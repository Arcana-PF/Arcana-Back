import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { postgresDataSourceConfig } from 'src/config/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresDataSourceConfig], //envFilePath: './.env.development'
    }),
    TypeOrmModule.forRootAsync({
     inject: [ConfigService],
     useFactory: (configService: ConfigService) => {
      const config = configService.get('postgres');
      return{
        ...config,
        migrations: [],
      };
     },
    // Al crear el postgresDataSourceConfig y traerlo en el forRoot ya no tengo que escribir todas las configuraciones 
    // de la base de datos sino que las trae directametne desde data-source utilizando el alias que elegi.
    // Ya no es necesarios escribir todo esto:
    //   ({
    //   type: 'postgres',
    //   database: configService.get('DB_NAME'),
    //   host: configService.get('DB_HOST'),
    //   port: configService.get('DB_PORT'),
    //   username: configService.get('DB_USERNAME'),
    //   password: configService.get('DB_PASSWORD'),
    //   entities: [Product, User, Order, OrderDetail, Category],
    //   synchronize: false,
    //   logging: true,
    //  })
    }),
    UsersModule, ProductsModule, AuthModule, CategoriesModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
