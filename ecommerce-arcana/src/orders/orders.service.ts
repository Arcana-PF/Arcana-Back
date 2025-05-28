import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository){}
  
  async addOrder(newOrder: CreateOrderDto){
    return await this.ordersRepository.addOrder(newOrder);
  }

  getOrder(id: string){
    return this.ordersRepository.getOrder(id);
  }
}
