import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { postgresDataSourceConfig } from 'src/config/data-source';
import { CloudinaryService } from './services/cloudinary/cloudinary.service';
import { FileUploadModule } from './file-upload/file-upload.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronEmailModule } from './cron-email/cron-email.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresDataSourceConfig], //envFilePath: './.env.development'
    }),
    // Al crear el postgresDataSourceConfig y traerlo en el forRoot ya no tengo que escribir todas las configuraciones
    // de la base de datos sino que las trae directametne desde data-source utilizando el alias que elegi.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('postgres');
        return {
          ...config,
          migrations: [],
        };
      },
    }),
    UsersModule,
    ProductsModule,
    AuthModule,
    CategoriesModule,
    OrdersModule,
    FileUploadModule,
    MailModule,
    JwtModule.register({
      global: true,
      signOptions: {expiresIn: '1h'},
      secret: process.env.JWT_SECRET
    }),
    ScheduleModule.forRoot(),
    CronEmailModule
  ],
  controllers: [],
  providers: [CloudinaryService],
})
export class AppModule {}
