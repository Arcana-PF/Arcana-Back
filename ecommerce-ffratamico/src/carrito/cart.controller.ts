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
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ItemIdParamDto } from './dto/item-id-param.dto';

@ApiBearerAuth()
@ApiTags('Cart')
@UseGuards(AuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getActiveCart(@Req() req) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');

    return this.cartService.getActiveCartByUser(userId);
  }

  @Post('items')
  async addItemToCart(
    @Req() req,
    @Body() items: AddItemToCartDto,
  ) {
    return this.cartService.addItemToCart(req.user?.id, items);
  }

  @Patch('items/:itemId')
  async updateCartItem(
    @Req() req,
    @Param() item: ItemIdParamDto,
    @Body() updateItem: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItemQuantity(req.user?.id, item.itemId, updateItem);
  }

  @Delete('items/:itemId')
  async removeCartItem(@Req() req, @Param() item: ItemIdParamDto) {
    return this.cartService.removeCartItem(req.user?.id, item.itemId);
  }

  @Delete()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user?.id);
  }
}
