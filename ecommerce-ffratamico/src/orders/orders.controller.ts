import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete, 
  UseGuards, 
  Req, 
  ForbiddenException 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { PayPalCaptureDto } from './dto/paypal-capture.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsAdminGuard } from 'src/auth/guard/is-admin/isAdmin.guard';
import { CarritoService } from 'src/carrito/cart.service';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService,
    private readonly carritoService: CarritoService,
  ) {}

@Post()
@UseGuards(AuthGuard)
async createOrder(@Req() req) {
  const userId = req.user?.id;
  if (!userId) throw new ForbiddenException('Usuario no autenticado');

  return this.carritoService.createOrderFromCart(userId);
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