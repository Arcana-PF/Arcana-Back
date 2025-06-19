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
import { Auth0Guard } from 'src/auth/guard/auth0/auth0.guard';

@ApiBearerAuth()
@ApiTags('Cart')
@UseGuards(Auth0Guard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  // @UseGuards(AuthGuard)
  async getActiveCart(@Req() req) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Usuario no autenticado');

    return this.cartService.getActiveCartByUser(userId);
  }

  @Post('items')
  // @UseGuards(AuthGuard)
  async addItemToCart(
    @Req() req,
    @Body() items: AddItemToCartDto,
  ) {
    return this.cartService.addItemToCart(req.user?.id, items);
  }

  @Patch('items/:itemId')
  // @UseGuards(AuthGuard)
  async updateCartItem(
    @Req() req,
    @Param() item: ItemIdParamDto,
    @Body() updateItem: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItemQuantity(req.user?.id, item.itemId, updateItem);
  }

  @Delete('items/:itemId')
  // @UseGuards(AuthGuard)
  async removeCartItem(@Req() req, @Param() item: ItemIdParamDto) {
    return this.cartService.removeCartItem(req.user?.id, item.itemId);
  }

  @Delete()
  // @UseGuards(AuthGuard)
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user?.id);
  }
}
