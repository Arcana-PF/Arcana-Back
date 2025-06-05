import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UserRepository } from "../users/users.repository";
import { ProductsRepository } from "../products/products.repository";
import { Product } from "../products/entities/product.entity";
import { OrderDetailRepository } from "./orderDetail.repository";
import { OrderStatus } from "./enums/order-status.enum";

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order) 
    private readonly repository: Repository<Order>,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductsRepository,
    private readonly orderDetailRepository: OrderDetailRepository
  ) {}

  async createDatabaseOrder(orderData: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.getById(orderData.userId);
    const productsToBuy: Product[] = [];
    let total = 0;

    for (const item of orderData.products) {
      const product = await this.productRepository.getProductById(item.id);
      if(product.stock <= 0) continue;

      product.stock -= 1;
      await this.productRepository.updateProduct(product.id, {stock: product.stock});

      productsToBuy.push(product);
      total += Number(product.price);
    }

    if(productsToBuy.length === 0) {
      throw new ConflictException('Ningún producto tiene stock disponible');
    }

    const orderDetail = this.orderDetailRepository.createOrderDetail({
      price: total, 
      products: productsToBuy
    });
    await this.orderDetailRepository.saveOrderDetail(orderDetail);

    const newOrder = this.repository.create({
      user,
      orderDetail,
      status: OrderStatus.PENDING
    });

    return this.repository.save(newOrder);
  }

  async updateOrderWithPayment(
    orderId: string,
    updateData: {
      status: OrderStatus;
      paypalData?: {
        captureId: string;
        payerEmail: string;
        fullResponse: any;
      };
    }
  ): Promise<Order> {
    const order = await this.repository.findOne({
      where: { id: orderId },
      relations: ['orderDetail', 'orderDetail.products', 'user']
    });

    if (!order) {
      throw new NotFoundException(`Orden ${orderId} no encontrada`);
    }

    order.status = updateData.status;
    
    if (updateData.paypalData) {
      order.paypalData = {
        captureId: updateData.paypalData.captureId,
        payerEmail: updateData.paypalData.payerEmail,
        fullResponse: updateData.paypalData.fullResponse
      };
    }

    return this.repository.save(order);
  }

  async getFullOrderDetails(orderId: string): Promise<Order> {
    const order = await this.repository.findOne({
      where: { id: orderId },
      relations: [
        'user', 
        'orderDetail', 
        'orderDetail.products'
      ]
    });

    if (!order) {
      throw new NotFoundException(`Orden ${orderId} no encontrada`);
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus
  ): Promise<void> {
    await this.repository.update(orderId, { status });
  }
}