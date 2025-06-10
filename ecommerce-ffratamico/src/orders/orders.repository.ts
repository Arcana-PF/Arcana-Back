import { 
  ConflictException, 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

import { ProductsRepository } from 'src/products/products.repository';
import { OrderDetailRepository } from './orderDetail.repository';
import { UserRepository } from '../users/users.repository';
import { OrderStatus } from './enums/order-status.enum';
import { OrderDetailProduct } from './entities/order-detail-product.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductsRepository,
    private readonly orderDetailRepository: OrderDetailRepository,
  ) {}

  /**
   * Obtiene todas las órdenes activas con sus detalles
   */
  async findAll(): Promise<Order[]> {
    try {
      return await this.repository.find({
        where: { isActive: true },
        relations: {
          user: true,
          orderDetail: {
            items: {
              product: true,
            },
          },
        },
        order: { date: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener órdenes');
    }
  }

  /**
   * Crea una orden con detalle de productos y actualiza stock
   */
  async createDatabaseOrder(orderData: CreateOrderDto): Promise<Order> {
    // Obtener usuario
    const user = await this.userRepository.getById(orderData.userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Crear un nuevo detalle de orden (vacío por ahora)
    const orderDetail = this.orderDetailRepository.createOrderDetail({
      items: [],
      price: 0,
    });

    await this.orderDetailRepository.saveOrderDetail(orderDetail);

    let totalPrice = 0;

    // Recorrer productos para validar stock y preparar items
    for (const item of orderData.products) {
      const product = await this.productRepository.getProductById(item.productId);
      if (!product || !product.isActive) continue;

      if (product.stock < item.quantity) {
        throw new ConflictException(`No hay stock suficiente para el producto ${product.name}`);
      }

      // Actualizar stock
      product.stock -= item.quantity;
      await this.productRepository.updateProduct(product.id, { stock: product.stock });

      // Crear item detalle producto con cantidad y precio al momento de compra
      const orderDetailProduct = this.orderDetailRepository.orderDetailProductRepository.create({
        product,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        orderDetail,
      });

      // Guardar item detalle producto
      await this.orderDetailRepository.orderDetailProductRepository.save(orderDetailProduct);

      orderDetail.items.push(orderDetailProduct);

      // Acumular total
      totalPrice += product.price * item.quantity;
    }

    if (orderDetail.items.length === 0) {
      throw new ConflictException('Ningún producto tiene stock disponible o válido');
    }

    // Actualizar precio total en detalle de orden
    orderDetail.price = totalPrice;
    await this.orderDetailRepository.saveOrderDetail(orderDetail);

    // Crear orden
    const newOrder = this.repository.create({
      user,
      orderDetail,
      status: OrderStatus.PENDING,
      isActive: true,
      date: new Date(),
    });

    return this.repository.save(newOrder);
  }

  /**
   * Actualiza el estado de la orden con datos de pago (PayPal)
   */
  async updateOrderWithPayment(
    orderId: string,
    updateData: {
      status: OrderStatus;
      paypalData?: {
        captureId: string;
        payerEmail: string;
        fullResponse: any;
      };
    },
  ): Promise<Order> {
    const order = await this.repository.findOne({
      where: { id: orderId },
      relations: ['orderDetail', 'orderDetail.items', 'orderDetail.items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Orden ${orderId} no encontrada`);
    }

    order.status = updateData.status;

    if (updateData.paypalData) {
      order.paypalData = {
        captureId: updateData.paypalData.captureId,
        payerEmail: updateData.paypalData.payerEmail,
        fullResponse: updateData.paypalData.fullResponse,
      };
    }

    return this.repository.save(order);
  }

  /**
   * Busca una orden activa por ID con detalle completo
   */
  async findOne(id: string): Promise<Order> {
    try {
      const order = await this.repository.findOne({
        where: { id, isActive: true },
        relations: {
          user: true,
          orderDetail: {
            items: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Orden activa con ID ${id} no encontrada`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar la orden');
    }
  }

  /**
   * Actualiza campos permitidos de una orden activa
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    try {
      const order = await this.repository.findOne({
        where: { id, isActive: true },
        relations: ['user'],
      });

      if (!order) {
        throw new NotFoundException(`Orden activa con ID ${id} no encontrada`);
      }

      // Actualizar usuario si viene en dto
      if (updateOrderDto.userId) {
        const user = await this.userRepository.getById(updateOrderDto.userId);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        order.user = user;
      }

      // Actualizar estado si viene en dto
      if ('status' in updateOrderDto && updateOrderDto.status !== undefined) {
        order.status = updateOrderDto.status;
      }

      await this.repository.save(order);
      return {
        ...order,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar la orden');
    }
  }

  /**
   * Borrado lógico de una orden (marcar como inactiva)
   */
  async remove(id: string) {
  try {
    const order = await this.repository.findOne({
      where: { id, isActive: true }, // 🔹 solo buscamos órdenes activas
      relations: ['orderDetail', 'orderDetail.items'],
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada o ya inactiva`);
    }

    order.isActive = false; // 🔸 marcamos como inactiva
    await this.repository.save(order);

    return {
      message: 'Orden desactivada (borrado lógico)',
      orderId: id,
      isActive: false,
      dateDeleted: new Date(),
    };
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Error al desactivar la orden');
  }
}

  /**
   * Obtiene todas las órdenes, activas e inactivas, con detalles completos (para admins)
   */
  async findAllWithInactive(): Promise<Order[]> {
    try {
      return await this.repository.find({
        withDeleted: true,
        relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el historial completo');
    }
  }

  /**
   * Obtiene orden completa con detalles por ID
   */
  async getFullOrderDetails(orderId: string): Promise<Order> {
    const order = await this.repository.findOne({
      where: { id: orderId },
      relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Orden ${orderId} no encontrada`);
    }

    return order;
  }

  /**
   * Actualiza solo el estado de una orden
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.repository.update(orderId, { status });
  }
}
