import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}
  
  // Métodos nuevos agregados:
  
  async create(createOrderDto: CreateOrderDto) {
    return await this.ordersRepository.create(createOrderDto);
  }

  async findAll() {
    return await this.ordersRepository.findAll();
  }

  async findOne(id: string) {
    return await this.ordersRepository.findOne(id);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.ordersRepository.update(id, updateOrderDto);
  }

  async remove(id: string) {
    return await this.ordersRepository.remove(id);
  }
}