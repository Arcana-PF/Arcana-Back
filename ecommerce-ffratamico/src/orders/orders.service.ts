import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, Redirect } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayPalService } from './paypal.service';
import { PayPalCaptureDto } from './dto/paypal-capture.dto';
import { OrderStatus } from './enums/order-status.enum';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly paypalService: PayPalService
  ) {}
  
   async createOrderWithPayment(newOrder: CreateOrderDto) {
    const dbOrder = await this.ordersRepository.createDatabaseOrder(newOrder);

    try {
      const paypalOrderId = await this.paypalService.createOrder(
        dbOrder.orderDetail.price,
        'USD'
      );

      const approveLink = paypalOrderId.links.find(link => link.rel === 'approve');

      return {
        success: true,
        orderId: dbOrder.id,
        paypalIdOrder: paypalOrderId.id,
        amount: dbOrder.orderDetail.price,
        nextSteps: {
          client: 'Debe aprobar el pago en PayPal',
          redirectUrl: approveLink?.href || 'no disponible',
          server: `POST /orders/paypal/capture con { "orderId": "${paypalOrderId.id}" }`
        },
        orderDetails: {
          date: dbOrder.date,
          products: dbOrder.orderDetail.products
        }
      };
    } catch (error) {
      await this.ordersRepository.updateOrderStatus(dbOrder.id, OrderStatus.FAILED);
      throw new InternalServerErrorException('Error al crear pago en PayPal: ' + error.message);
    }
  }
  
  async findAll() {
    return await this.ordersRepository.findAll();
  }
  
  async capturePayPalOrder(captureDto: PayPalCaptureDto) {
    const paypalResult = await this.paypalService.captureOrder(captureDto.orderId);

    if (paypalResult.status !== 'COMPLETED') {
      throw new ConflictException('El pago no se completó correctamente en PayPal');
    }

    const updatedOrder = await this.ordersRepository.updateOrderWithPayment(
      paypalResult.id,
      {
        status: OrderStatus.PAID,
        paypalData: {
          captureId: paypalResult.id,
          payerEmail: paypalResult.payer.email_address,
          fullResponse: paypalResult
        }
      }
    );

    return {
      success: true,
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      paymentDetails: {
        method: 'PayPal',
        amount: updatedOrder.orderDetail.price,
        captureId: paypalResult.id,
        payerEmail: paypalResult.payer.email_address,
        date: new Date(paypalResult.create_time)
      },
      products: updatedOrder.orderDetail.products
    };
  }
  
   async getOrderDetails(orderId: string) {
    const order = await this.ordersRepository.getFullOrderDetails(orderId);
    if (!order) throw new NotFoundException(`Orden ${orderId} no encontrada`);

    return {
      id: order.id,
      date: order.date,
      status: order.status,
      user: { id: order.user.id, email: order.user.email },
      payment: order.paypalData ? { method: 'PayPal', ...order.paypalData } : null,
      products: order.orderDetail.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price
      })),
      total: order.orderDetail.price
    };

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.ordersRepository.update(id, updateOrderDto);
  }

  async remove(id: string) {
    return await this.ordersRepository.remove(id);

  }
}