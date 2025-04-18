import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { Product } from './products/entities/product.entity';
import { User } from './users/entities/user.entity';

import { Category } from './categories/entities/categories.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderDetail } from './orders/entities/orderDetail.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env.development',
    }),
    TypeOrmModule.forRootAsync({
     inject: [ConfigService],
     useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      database: configService.get('DB_NAME'),
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      entities: [Product, User, Order, OrderDetail, Category],
      synchronize: true,
      logging: true,
     })
    }),
    UsersModule, ProductsModule, AuthModule, CategoriesModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
