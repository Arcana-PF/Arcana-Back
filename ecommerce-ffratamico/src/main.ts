import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobal } from './middleware/logger/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(LoggerGlobal);
  await app.listen(3000);
}
bootstrap();
