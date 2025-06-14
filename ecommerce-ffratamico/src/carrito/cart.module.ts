import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderDetail } from 'src/orders/entities/orderDetail.entity';
import { OrderDetailProduct } from 'src/orders/entities/order-detail-product.entity';
import { PayPalService } from 'src/orders/paypal.service';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

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
