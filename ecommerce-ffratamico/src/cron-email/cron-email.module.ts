import { Module } from '@nestjs/common';
import { CronEmailService } from './cron-email.service';
import { CronEmailController } from './cron-email.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { UserRepository } from 'src/users/users.repository';
import { Subscriber } from './Entities/subscriber.entity';

@Module({
  imports:[MailModule,UsersModule,
    TypeOrmModule.forFeature([User, Subscriber])
  ],
  controllers: [CronEmailController],
  providers: [CronEmailService,UserRepository],
})
export class CronEmailModule {}
