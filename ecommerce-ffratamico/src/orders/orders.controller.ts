import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { IdParamDTO } from 'src/Id-Param.DTO';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async addOrder(@Body() newOrder: CreateOrderDto) {
    return await this.ordersService.addOrder(newOrder);
  }

  @Get(':id')
  findOne(@Param() param: IdParamDTO) {
    return this.ordersService.getOrder(param.id);
  }
}
