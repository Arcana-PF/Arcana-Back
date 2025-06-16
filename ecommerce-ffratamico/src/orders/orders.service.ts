import {ConflictException,Injectable,InternalServerErrorException,NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/orderDetail.entity';
import { OrderDetailProduct } from './entities/order-detail-product.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayPalService } from './paypal.service';
import { OrderStatus } from './enums/order-status.enum';
import { PayPalCaptureDto } from './dto/paypal-capture.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersRepository } from './orders.repository';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,

    @InjectRepository(OrderDetailProduct)
    private readonly orderItemRepository: Repository<OrderDetailProduct>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    private readonly paypalService: PayPalService,
    private readonly dataSource: DataSource,
    private readonly ordersRepositoryCustom: OrdersRepository,
    private readonly mailService: MailService,
  ) {}


  async createOrderWithPayment(newOrder: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = new Order();
      order.user = { id: newOrder.userId } as any;
      order.status = OrderStatus.PENDING;

      const orderDetail = new OrderDetail();
      orderDetail.price = 0;
      let total = 0;

      const savedOrder = await queryRunner.manager.save(Order, order);
      orderDetail.order = savedOrder;
      const savedOrderDetail = await queryRunner.manager.save(OrderDetail, orderDetail);

      for (const item of newOrder.products) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId }
        });

        if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        if (!product.isActive) throw new ConflictException(`El producto ${product.name} no está disponible actualmente`);
        if (product.stock < item.quantity) throw new ConflictException(`Stock insuficiente para ${product.name}`);

        const orderItem = new OrderDetailProduct();
        orderItem.product = product;
        orderItem.quantity = item.quantity;
        orderItem.priceAtPurchase = product.price;
        orderItem.orderDetail = savedOrderDetail;

        await queryRunner.manager.save(OrderDetailProduct, orderItem);

        total += product.price * item.quantity;
        product.stock -= item.quantity;
        await queryRunner.manager.save(Product, product);
      }

      savedOrderDetail.price = total;
      await queryRunner.manager.save(OrderDetail, savedOrderDetail);

      const paypalOrder = await this.paypalService.createOrder(total, 'USD');
      const approveLink = paypalOrder.links.find(link => link.rel === 'approve');

      savedOrder.paypalData = {
        orderId: paypalOrder.id
      };
      await queryRunner.manager.save(Order, savedOrder);

      await queryRunner.commitTransaction();

      const itemsWithProducts = await this.orderItemRepository.find({
        where: { orderDetail: { id: savedOrderDetail.id } },
        relations: ['product']
      });

      return {
        success: true,
        orderId: savedOrder.id,
        paypalId: paypalOrder.id,
        total,
        redirectUrl: approveLink?.href,
        items: itemsWithProducts.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.priceAtPurchase
        }))
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Error al crear orden: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async capturePayPalOrder(captureDto: PayPalCaptureDto) {
    const paypalResult = await this.paypalService.captureOrder(captureDto.orderId);

    if (paypalResult.status !== 'COMPLETED') {
      throw new ConflictException('El pago no se completó correctamente en PayPal');
    }

    const updatedOrder = await this.ordersRepository.update(
      { id: captureDto.localOrderId },
      {
        status: OrderStatus.PAID,
        paypalData: {
          orderId: captureDto.orderId,
          captureId: paypalResult.id,
          payerEmail: paypalResult.payer?.email_address,
          fullResponse: paypalResult
        }
      }
    );

    if (updatedOrder.affected === 0) {
      throw new NotFoundException(`Orden ${captureDto.localOrderId} no encontrada`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: captureDto.localOrderId },
      relations: ['orderDetail', 'orderDetail.items', 'orderDetail.items.product']
    });

   const itemsHtml = order.orderDetail.items.map(item => `
  <tr>
    <td style="padding: 8px; border: 1px solid #ccc;">${item.product.name}</td>
    <td style="padding: 8px; border: 1px solid #ccc;">${item.quantity}</td>
    <td style="padding: 8px; border: 1px solid #ccc;">$${item.priceAtPurchase.toFixed(2)}</td>
  </tr>
`).join('');

const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color:rgb(112, 7, 161);">Confirmación de Compra</h2>
    <p>Hola ${order.user?.name || order.user?.email},</p>
    <p>¡Gracias por tu compra! Aquí tienes el detalle de tu orden:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr>
          <th style="padding: 8px; border: 1px solid #ccc;">Producto</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Cantidad</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <p style="margin-top: 20px;"><strong>Total pagado:</strong> $${order.orderDetail.price.toFixed(2)}</p>

    <p style="margin-top: 30px;">Saludos,<br><strong>Equipo de Arcana</strong></p>
    <hr style="margin-top: 40px;" />
    <small style="color: #888;">Este correo fue enviado automáticamente. Por favor, no respondas.</small>
  </div>
`;

await this.mailService.sendEmail(
  order.user.email,
  'Confirmación de compra - Arcana',
  emailHtml
);

// RETURN FINAL
return {
  success: true,
  orderId: order.id,
  status: order.status,
  paymentDetails: {
    method: 'PayPal',
    amount: order.orderDetail.price,
    orderId: captureDto.orderId,
    captureId: paypalResult.id,
    payerEmail: paypalResult.payer?.email_address,
    date: new Date(paypalResult.create_time)
  },
  items: order.orderDetail.items.map(item => ({
    productId: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.priceAtPurchase
  }))
};
  }

    async getOrderDetails(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'orderDetail', 'orderDetail.items'], // Ajusta según tus relaciones reales
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }


  async findAll() {
    return await this.ordersRepository.find({
      relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product']
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product']
    });

    if (!order) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.preload({ id, ...updateOrderDto });

    if (!order) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }

    return this.ordersRepository.save(order);
  }

  async remove(id: string) {
    return this.ordersRepositoryCustom.remove(id);
  }
}