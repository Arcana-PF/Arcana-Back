import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  addOrder(@Body() newOrder) {
    return this.ordersService.addOrder(newOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}
