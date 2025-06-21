import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { UserRepository} from 'src/users/users.repository';
import { Subscriber } from './Entities/subscriber.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CronEmailService {
 
    constructor(
        @InjectRepository(Subscriber)
        private readonly subscriberRepository: Repository<Subscriber>,
        private readonly mailService: MailService,
        private readonly usersRepository: UserRepository,
    ) {}

  // ✅ CAMBIO: Ejecuta esta función cada semana (domingo a las 10 AM)
    @Cron(CronExpression.EVERY_10_MINUTES)
    async sendReminderEmailToUsers() {

      console.log('⏰ Ejecutando cron job para enviar correos de recordatorio...')
      const users = await this.usersRepository.getUsers(); // trae todos los usuarios registrados

      for (const user of users) {
        await this.mailService.sendEmail(
          user.email,
          '¡Volvé a visitarnos en Arcana!',
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color:rgb(112, 7, 161);">¡Te extrañamos en Arcana!</h2>
          <p>Hola ${user.name || user.email},</p>
          <p>Hace un tiempo que no te vemos. Volvé a visitar nuestra tienda y descubrí nuevos productos.</p>
          <p style="margin-top: 30px;">Saludos,<br><strong>Equipo de Arcana</strong></p>
          <hr style="margin-top: 40px;" />
          <small style="color: #888;">Este correo fue enviado automáticamente. Por favor, no respondas.</small>
          </div>
          `
        );
      }
    }

    async subscribeUser(email: string) {
    const existing = await this.subscriberRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Este correo ya está suscrito');
    }

    const subscriber = this.subscriberRepository.create({ email });
    await this.subscriberRepository.save(subscriber);
  }

  // ✅ NUEVO: cron job para enviar ofertas a suscriptores (todos los viernes a las 11 AM)
  @Cron(CronExpression.EVERY_10_MINUTES)
  async sendOffersToSubscribers() {
    console.log('📧 Enviando ofertas a suscriptores...');

    const subscribers = await this.subscriberRepository.find();

    for (const subscriber of subscribers) {
      await this.mailService.sendEmail(
        subscriber.email,
        '🧙‍♀️ ¡Ofertas mágicas esta semana en Arcana!',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color:rgb(112, 7, 161);">¡Ofertas exclusivas para vos!</h2>
          <p>Te invitamos a descubrir las nuevas promociones de esta semana en nuestra tienda de productos esotéricos.</p>
          <p>✨ Incienso, velas, runas y más... ¡Todo con descuentos especiales!</p>

          <!-- ✅ BOTÓN DE DESUSCRIPCIÓN -->
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://arcana.com/unsubscribe?email=${subscriber.email}"
              style="background-color: #7007a1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Cancelar suscripción
            </a>
          </p>

          <p style="margin-top: 30px;">Con amor,<br><strong>El equipo de Arcana</strong></p>
          <hr style="margin-top: 40px;" />
          <small style="color: #888;">Este correo fue enviado automáticamente. Por favor, no respondas.</small>
        </div>
        `
      );
    }
  }

  async unsubscribeUser(email: string) {
  const subscriber = await this.subscriberRepository.findOne({ where: { email } });

    if (!subscriber) throw new NotFoundException('No existe una suscripción con ese email');

    await this.subscriberRepository.remove(subscriber);

    return { success: true, message: 'Te has desuscripto correctamente' };
  }


}
