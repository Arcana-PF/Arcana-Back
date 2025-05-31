import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayPalCaptureDto } from './dto/paypal-capture.dto';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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

  @Post('paypal/capture')
  @UseGuards(AuthGuard)
  async capturePayPalOrder(@Body() captureDto: PayPalCaptureDto) {
    return this.ordersService.capturePayPalOrder(captureDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOrderDetails(@Param('id') orderId: string) {
    return this.ordersService.getOrderDetails(orderId);
  }
}