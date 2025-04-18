import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository){}
  
  addOrder(newOrder){
    return this.ordersRepository.addOrder(newOrder);
  }

  getOrder(id){
    return this.ordersRepository.getOrder(id);
  }
}
