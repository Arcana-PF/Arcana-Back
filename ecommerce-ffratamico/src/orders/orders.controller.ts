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
import { CartService } from 'src/carrito/cart.service';
import { Auth0Guard } from 'src/auth/guard/auth0/auth0.guard';

@ApiBearerAuth()
@ApiTags('Orders')
@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService,
    private readonly carritoService: CartService,
  ) {}

  @Post('paypal/create')
  async createOrderWithPayment(@Req() req) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');
    return this.carritoService.createOrderFromCart(userId);
  }

  @Post('paypal/initiate/:orderId')
  async initiatePayPalPayment(@Param('orderId') orderId: string) {
    return this.ordersService.initiatePayPalForOrder(orderId);
  }


  @Get()
  async findAll() {
    return await this.ordersService.findAll();
  }

  @Post('paypal/capture')
  async capturePayPalOrder(@Body() captureDto: PayPalCaptureDto) {
    return this.ordersService.capturePayPalOrder(captureDto);
  }

  
  @Get(':id')
  async getOrderDetails(@Param('id') orderId: string) {
    return this.ordersService.getOrderDetails(orderId);
  }


  @Patch(':id')
  @UseGuards(IsAdminGuard)
  async update(@Param() param: IdParamDTO, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.ordersService.update(param.id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param() param: IdParamDTO) {
    return await this.ordersService.remove(param.id);
  }

}