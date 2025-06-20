import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobal } from './middleware/logger/logger.middleware';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin: '*',});
  app.use(LoggerGlobal);

  app.useGlobalPipes(new ValidationPipe({ //Esto sirve para que entre en vigencia todas las validaciones que cree en las class de los DTO
    whitelist: true, //esta validacion sirve para que no llegen propiedades que no estan definidas a mi controlador
    forbidNonWhitelisted: true, // esta validacion hace que tire error si agrego propiedades que no estan dfinidas
    transform: true,  //esta validacion transforma los datos que entran al tipo que espera el DTO, ej de string a number
  }));

   app.enableCors({
    origin: ['https://arcana-front-9ej2.vercel.app/'], // Cambiá esto por tu dominio de Vercel real
    credentials: true, 
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Arcana')
    .setDescription('Back-end de la base de datos de Arcana')
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api',app, document);

  await app.listen(3000);
}
bootstrap();
