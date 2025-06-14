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
OrdersService
CreateOrderDto
UpdateOrderDto
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from 'src/orders/orders.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/orders/dto/update-order.dto';
import { CartService } from './cart.service';

@ApiBearerAuth()
@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

@Get('cart')
  @UseGuards(AuthGuard)
  async getActiveCart(@Req() req) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');

    return this.cartService.getActiveCartByUser(userId);
  }

  @Post('cart/items')
  @UseGuards(AuthGuard)
  async addItemToCart(
    @Req() req,
    @Body() body: { productId: string; quantity: number },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');

    return this.cartService.addItemToCart(userId, body.productId, body.quantity);
  }

  @Patch('cart/items/:itemId')
  @UseGuards(AuthGuard)
  async updateCartItem(
    @Req() req,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');

    return this.cartService.updateCartItemQuantity(userId, itemId, body.quantity);
  }

  @Delete('cart/items/:itemId')
  @UseGuards(AuthGuard)
  async removeCartItem(@Req() req, @Param('itemId') itemId: string) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');

    return this.cartService.removeCartItem(userId, itemId);
  }

  @Delete('cart')
  @UseGuards(AuthGuard)
  async clearCart(@Req() req) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');

    return this.cartService.clearCart(userId);
  }
}
