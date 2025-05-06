import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard) // Header de autorizacion
  async addOrder(@Body() newOrder: CreateOrderDto) {
    return await this.ordersService.addOrder(newOrder);
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Header de autorizacion
  findOne(@Param() param: IdParamDTO) {
    return this.ordersService.getOrder(param.id);
  }
}
