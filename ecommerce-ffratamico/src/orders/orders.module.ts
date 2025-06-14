import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { OrderDetailRepository } from './orderDetail.repository';
import { OrderDetail } from './entities/orderDetail.entity';
import { PayPalService } from './paypal.service';
import { OrderDetailProduct } from './entities/order-detail-product.entity';
import { CartController } from 'src/carrito/cart.controller';
import { CartService } from 'src/carrito/cart.service';
import { CartRepository } from 'src/carrito/cart.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail, OrderDetailProduct]), UsersModule, ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrderDetailRepository, PayPalService, CartController, CartService, CartRepository],
})
export class OrdersModule {}
