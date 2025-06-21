import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CronEmailService } from './cron-email.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Subscribe')
@Controller('cron-email')
export class CronEmailController {
  constructor(private readonly cronEmailService: CronEmailService) {}

  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    await this.cronEmailService.subscribeUser(email);
    return { message: 'Suscripción exitosa. ¡Gracias por unirte!' };
  }

  @Patch('unsubscribe/:email')
  async unsubscribe(@Param('email') email: string) {
    return await this.cronEmailService.unsubscribeUser(email);
  }
}