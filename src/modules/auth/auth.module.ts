import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from './../config';
import { UserModule } from './../user';
import { AdminsModule } from './../admins';
import { ContentModule } from './../content';
import { AuthService } from './auth.service';
import { CommonCodesModule } from './../common-codes';

import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthenticationAppleModule } from 'modules/authentication-apple/authentication-apple.module';

import { SleepRecordsModule } from './../sleep-records';
import { SleepRecordsDetailModule } from '../sleep-records-fitbit';
import { DailyRecordsModule } from './../daily-records';
import { EnvironmentRecordsModule } from './../environment-records';
import { SurveyRecordsModule } from './../survey-records';
import { DailyRecordsHistoryModule } from './../daily-records-history';
import { HttpModule } from '@nestjs/axios';
import { SurveyRecordsDetailModule } from 'modules/survey-records-detail';
import { UsersFeedbackModule } from 'modules/user-feedback';
import { DailyRecordsHistoryDetailModule } from 'modules/daily-records-history-detail';
import { UserFeedbackDetailModule } from 'modules/user-feedback-detail';
import { EnvironmentRecordsDetailModule } from 'modules/environment-records-detail';
import { SleepRecordsLogModule } from 'modules/sleep-records-mobile';
import { DailyRecordsDetailModule } from 'modules/daily-records-detail/daily-records-detail.module';
import { NoticesModule } from 'modules/notices/notices.module';
import { UsersNoticesModule } from 'modules/users-notices/users-notices.module';
import { FcmTokenModule } from 'modules/fcm-token/fcm-token.module';
import { UsersLogModule } from 'modules/users-log/users-log.module';
import { NotificationsModule } from 'modules/notifications/notifications.module';
import { FavoritiesModule } from 'modules/favorities/favorities.module';


@Module({
  imports: [
    FavoritiesModule,
    UserModule,
    ConfigModule,
    AdminsModule,
    ContentModule,
    CommonCodesModule,
    DailyRecordsModule,
    DailyRecordsDetailModule,
    EnvironmentRecordsModule,
    EnvironmentRecordsDetailModule,
    SurveyRecordsModule,
    SurveyRecordsDetailModule,
    DailyRecordsHistoryModule,
    DailyRecordsHistoryDetailModule,
    SleepRecordsModule,
    SleepRecordsDetailModule,
    SleepRecordsLogModule,
    UsersFeedbackModule,
    UserFeedbackDetailModule,
    NoticesModule,
    UsersNoticesModule,
    UsersLogModule,
    FcmTokenModule,
    NotificationsModule,
    AuthenticationAppleModule,
    HttpModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET_KEY'),
          signOptions: {
            ...(configService.get('JWT_EXPIRATION_TIME')
              ? {
                expiresIn: Number(configService.get('JWT_EXPIRATION_TIME')),
              }
              : {}),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule.register({ defaultStrategy: 'jwt' })],
})
export class AuthModule { }
