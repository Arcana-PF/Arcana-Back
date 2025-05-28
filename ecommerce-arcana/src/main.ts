import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobal } from './middleware/logger/logger.middleware';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(LoggerGlobal);

  app.useGlobalPipes(new ValidationPipe({ //Esto sirve para que entre en vigencia todas las validaciones que cree en las class de los DTO
    whitelist: true, //esta validacion sirve para que no llegen propiedades que no estan definidas a mi controlador
    forbidNonWhitelisted: true, // esta validacion hace que tire error si agrego propiedades que no estan dfinidas
    transform: true,  //esta validacion transforma los datos que entran al tipo que espera el DTO, ej de string a number
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Proyecto 4')
    .setDescription('Demo del proyecto 4 de Backend')
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api',app, document);

  await app.listen(3000);
}
bootstrap();
