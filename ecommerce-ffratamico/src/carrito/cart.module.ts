import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

CartController
import { CartService } from './cart.service';


import { Product } from 'src/products/entities/product.entity';

import { Order } from 'src/orders/entities/order.entity';
import { OrderDetail } from 'src/orders/entities/orderDetail.entity';
import { OrderDetailProduct } from 'src/orders/entities/order-detail-product.entity';

import { PayPalService } from 'src/orders/paypal.service';
import { CartController } from './cart.controller';
import { Cart } from './entitites/cart.entity';
import { CartItem } from './entitites/cart-item-entity';
import { CartRepository } from './cart.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Product,
      Order,
      OrderDetail,
      OrderDetailProduct,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, PayPalService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
