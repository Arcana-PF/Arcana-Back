import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /* ENDPOINTS NUEVOS AGREGADOS */
  
  // POST /orders - Crear nueva orden (existente)
  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return await this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param() param: IdParamDTO) {
    return await this.ordersService.findOne(param.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param() param: IdParamDTO, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.ordersService.update(param.id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param() param: IdParamDTO) {
    return await this.ordersService.remove(param.id);
  }
}