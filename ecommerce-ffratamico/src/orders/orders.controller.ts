import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { PayPalCaptureDto } from './dto/paypal-capture.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsAdminGuard } from 'src/auth/guard/is-admin/isAdmin.guard';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

 
  @Post()
  @UseGuards(AuthGuard)
  async createOrder(@Body() newOrder: CreateOrderDto) {
    return this.ordersService.createOrderWithPayment(newOrder);
  }

  @Get()
  @UseGuards(AuthGuard, IsAdminGuard)
  async findAll() {
    return await this.ordersService.findAll();
  }

  @Post('paypal/capture')
  @UseGuards(AuthGuard)
  async capturePayPalOrder(@Body() captureDto: PayPalCaptureDto) {
    return this.ordersService.capturePayPalOrder(captureDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard, IsAdminGuard)
  async getOrderDetails(@Param('id') orderId: string) {
    return this.ordersService.getOrderDetails(orderId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, IsAdminGuard)
  async update(@Param() param: IdParamDTO, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.ordersService.update(param.id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param() param: IdParamDTO) {
    return await this.ordersService.remove(param.id);
  }
}