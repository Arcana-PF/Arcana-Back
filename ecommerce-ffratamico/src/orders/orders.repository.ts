import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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
    } catch {
      throw new InternalServerErrorException('Error al obtener órdenes');
    }
  }

  async getOrCreateCart(userId: string): Promise<Order> {
    const user = await this.userRepository.getById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    let cart = await this.repository.findOne({
      where: {
        user: { id: userId },
        status: OrderStatus.CART,
        isActive: true,
      },
      relations: {
        orderDetail: {
          items: { product: true },
        },
      },
    });

    if (!cart) {
      const orderDetail = this.orderDetailRepository.createOrderDetail({
        items: [],
        price: 0,
      });

      await this.orderDetailRepository.saveOrderDetail(orderDetail);

      cart = this.repository.create({
        user,
        orderDetail,
        status: OrderStatus.CART,
        isActive: true,
        date: new Date(),
      });

      await this.repository.save(cart);
    }

    return cart;
  }

  async addProductToCart(userId: string, productId: string, quantity: number): Promise<Order> {
    const product = await this.productRepository.getProductById(productId);
    if (!product || !product.isActive) {
      throw new NotFoundException('Producto no válido o inactivo');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.orderDetail.items.find(
      (item) => item.product.id === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.orderDetailRepository.orderDetailProductRepository.save(existingItem);
    } else {
      const newItem = this.orderDetailRepository.orderDetailProductRepository.create({
        product,
        quantity,
        priceAtPurchase: product.price,
        orderDetail: cart.orderDetail,
      });
      await this.orderDetailRepository.orderDetailProductRepository.save(newItem);
      cart.orderDetail.items.push(newItem);
    }

    cart.orderDetail.price = cart.orderDetail.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtPurchase,
      0,
    );

    await this.orderDetailRepository.saveOrderDetail(cart.orderDetail);
    return this.repository.save(cart);
  }

  async createDatabaseOrder(orderData: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.getById(orderData.userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    let orderDetail = this.orderDetailRepository.createOrderDetail({
      items: [],
      price: 0,
    });

    await this.orderDetailRepository.saveOrderDetail(orderDetail);

    let totalPrice = 0;

    for (const item of orderData.products) {
      const product = await this.productRepository.getProductById(item.productId);
      if (!product || !product.isActive) continue;

      if (product.stock < item.quantity) {
        throw new ConflictException(`No hay stock suficiente para el producto ${product.name}`);
      }

      product.stock -= item.quantity;
      await this.productRepository.updateProduct(product.id, { stock: product.stock });

      const orderDetailProduct = this.orderDetailRepository.orderDetailProductRepository.create({
        product,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        orderDetail,
      });

      await this.orderDetailRepository.orderDetailProductRepository.save(orderDetailProduct);
      orderDetail.items.push(orderDetailProduct);
      totalPrice += product.price * item.quantity;
    }

    if (orderDetail.items.length === 0) {
      throw new ConflictException('Ningún producto tiene stock disponible o válido');
    }

    orderDetail.price = totalPrice;
    await this.orderDetailRepository.saveOrderDetail(orderDetail);

    const newOrder = this.repository.create({
      user,
      orderDetail,
      status: OrderStatus.PENDING,
      isActive: true,
      date: new Date(),
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
    },
  ): Promise<Order> {
    const order = await this.repository.findOne({
      where: { id: orderId },
      relations: ['orderDetail', 'orderDetail.items', 'orderDetail.items.product', 'user'],
    });

    if (!order) throw new NotFoundException(`Orden ${orderId} no encontrada`);

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

      if (!order) throw new NotFoundException(`Orden activa con ID ${id} no encontrada`);
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar la orden');
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    try {
      const order = await this.repository.findOne({
        where: { id, isActive: true },
        relations: ['user'],
      });

      if (!order) throw new NotFoundException(`Orden activa con ID ${id} no encontrada`);

      if (updateOrderDto.userId) {
        const user = await this.userRepository.getById(updateOrderDto.userId);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        order.user = user;
      }

      if ('status' in updateOrderDto && updateOrderDto.status !== undefined) {
        order.status = updateOrderDto.status;
      }

      await this.repository.save(order);
      return { ...order };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar la orden');
    }
  }

  async remove(id: string) {
    try {
      const order = await this.repository.findOne({
        where: { id, isActive: true },
        relations: ['orderDetail', 'orderDetail.items'],
      });

      if (!order) throw new NotFoundException(`Orden con ID ${id} no encontrada o ya inactiva`);

      order.isActive = false;
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

  async findAllWithInactive(): Promise<Order[]> {
    try {
      return await this.repository.find({
        withDeleted: true,
        relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product'],
      });
    } catch {
      throw new InternalServerErrorException('Error al obtener el historial completo');
    }
  }

  async getFullOrderDetails(orderId: string): Promise<Order> {
    const order = await this.repository.findOne({
      where: { id: orderId },
      relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product'],
    });

    if (!order) throw new NotFoundException(`Orden ${orderId} no encontrada`);
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.repository.update(orderId, { status });
  }
}
