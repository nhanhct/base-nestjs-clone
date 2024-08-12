import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsModule } from 'modules/admins';
import { CommonCodesModule } from 'modules/common-codes';
import { FcmTokenModule } from 'modules/fcm-token';
import { UserModule } from 'modules/user';
import { Notices } from '.';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notices]), CommonCodesModule, AdminsModule, UserModule,
  forwardRef(() => FcmTokenModule)],
  exports: [NoticesService],
  providers: [NoticesService],
  controllers: [NoticesController]
})
export class NoticesModule { }
