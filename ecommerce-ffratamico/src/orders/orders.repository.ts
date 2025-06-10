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
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  async findAll() {
    try {
      return await this.repository.find({
        relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product'],
        order: { date: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener órdenes');
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.repository.findOne({
        where: { id },
        relations: ['user', 'orderDetail', 'orderDetail.items', 'orderDetail.items.product'],
      });

      if (!order) {
        throw new NotFoundException(`Orden con ID ${id} no encontrada`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar la orden');
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.repository.findOneBy({ id });

      if (!order) {
        throw new NotFoundException(`Orden con ID ${id} no encontrada`);
      }

      // Solo permite actualizar ciertos campos. Si quieres modificar, agrega aquí.
      if (updateOrderDto.status) order.status = updateOrderDto.status;
      if (updateOrderDto.userId) order.user = { id: updateOrderDto.userId } as any;

      await this.repository.save(order);

      return {
        ...order,
        message: 'Orden actualizada correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar la orden');
    }
  }

  async remove(id: string) {
    try {
      const order = await this.repository.findOne({ where: { id } });

      if (!order) {
        throw new NotFoundException(`Orden con ID ${id} no encontrada`);
      }

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
}
