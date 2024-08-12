import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmTokenService } from './fcm-token.service';
import { FcmTokenController } from './fcm-token.controller'
import { FcmToken } from '.';
import { User, UserModule } from 'modules/user';
import { Notices, NoticesModule } from 'modules/notices';
import { ConfigModule } from 'modules/config';

@Module({
  imports: [TypeOrmModule.forFeature([FcmToken, User, Notices]), UserModule, NoticesModule, ConfigModule],
  exports: [FcmTokenService],
  providers: [FcmTokenService],
  controllers: [FcmTokenController]
})
export class FcmTokenModule { }
