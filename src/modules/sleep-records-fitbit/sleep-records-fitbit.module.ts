import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { SleepRecordsLogModule } from 'modules/sleep-records-mobile';
import { UsersFeedbackModule } from 'modules/user-feedback';
import { UserFeedbackDetailModule } from 'modules/user-feedback-detail';
import { SleepRecordsDetailController } from './sleep-records-fitbit.controller';
import { SleepRecordsDetail } from './sleep-records-fitbit.entity';
import { SleepRecordsDetailService } from './sleep-records-fitbit.service';

@Module({
  providers: [SleepRecordsDetailService],
  imports: [TypeOrmModule.forFeature([SleepRecordsDetail]), CommonCodesModule,
  forwardRef(() => SleepRecordsLogModule),
    UsersFeedbackModule,
    UserFeedbackDetailModule
  ],
  exports: [SleepRecordsDetailService],
  controllers: [SleepRecordsDetailController]
})
export class SleepRecordsDetailModule { }
