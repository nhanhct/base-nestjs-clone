import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { DailyRecordsModule, DailyRecordsService } from 'modules/daily-records';
import { DailyRecordsDetailModule } from 'modules/daily-records-detail/daily-records-detail.module';
import { EnvironmentRecordsModule } from 'modules/environment-records';
import { EnvironmentRecordsDetailModule } from 'modules/environment-records-detail';
import { SleepRecordsDetailModule } from 'modules/sleep-records-fitbit';
import { SleepRecordsLogModule } from 'modules/sleep-records-mobile';
import { SurveyRecordsModule } from 'modules/survey-records';
import { UserModule } from 'modules/user';
import { UsersFeedbackModule } from 'modules/user-feedback';
import { UserFeedbackDetailModule } from 'modules/user-feedback-detail';
import { SleepRecordsController } from './sleep-records.controller';
import { SleepRecords } from './sleep-records.entity';
import { SleepRecordsService } from './sleep-records.service';

@Module({
  providers: [SleepRecordsService],
  imports: [
    TypeOrmModule.forFeature([SleepRecords]),
    CommonCodesModule,
    UserModule,
    DailyRecordsModule,
    DailyRecordsDetailModule,
    EnvironmentRecordsModule,
    EnvironmentRecordsDetailModule,
    SurveyRecordsModule,
    forwardRef(() => SleepRecordsLogModule),
    forwardRef(() => SleepRecordsDetailModule),
    UsersFeedbackModule,
    UserFeedbackDetailModule,
  ],
  exports: [SleepRecordsService],
  controllers: [SleepRecordsController],
})
export class SleepRecordsModule { }
