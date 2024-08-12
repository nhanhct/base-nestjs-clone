import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { FcmTokenModule } from 'modules/fcm-token';
import { NoticesModule } from 'modules/notices';
import { NotificationsModule } from 'modules/notifications';
import { SleepRecordsModule } from 'modules/sleep-records';
import { UserModule } from 'modules/user';
import { UsersNotices } from '.';
import { UsersNoticesController } from './users-notices.controller';
import { UsersNoticesService } from './users-notices.service';

@Module({
  providers: [UsersNoticesService],
  imports: [
    TypeOrmModule.forFeature([UsersNotices]),
    CommonCodesModule,
    UserModule,
    FcmTokenModule,
    NoticesModule,
    SleepRecordsModule,
    NotificationsModule,
    CommonCodesModule
  ],
  exports: [UsersNoticesService],
  controllers: [UsersNoticesController],
})
export class UsersNoticesModule { }
