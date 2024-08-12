import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserModule } from 'modules/user';
import { Notifications } from '.';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
@Module({
  imports: [TypeOrmModule.forFeature([Notifications]), UserModule],
  exports: [NotificationsService],
  providers: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule { }
