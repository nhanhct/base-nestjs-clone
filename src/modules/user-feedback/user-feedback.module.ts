import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersFeedbackService } from './user-feedback.service';
import { UsersFeedbackController} from './user-feedback.controller'
import { CommonCodes,  } from 'modules/common-codes';
import { UsersFeedback } from '.';
import { UserModule } from 'modules/user';
import { UserFeedbackDetailModule } from 'modules/user-feedback-detail';
import { DailyRecordsModule } from 'modules/daily-records';
import { EnvironmentRecordsModule } from 'modules/environment-records';
import { SleepRecordsModule } from 'modules/sleep-records';
 
@Module({
  imports: [TypeOrmModule.forFeature([UsersFeedback,CommonCodes]),
            forwardRef(() => UserFeedbackDetailModule),UserModule ,
            forwardRef(() => DailyRecordsModule),
            forwardRef(() => EnvironmentRecordsModule),
            forwardRef(() => SleepRecordsModule)
        ],
  exports: [UsersFeedbackService],
  providers: [UsersFeedbackService],
  controllers:[UsersFeedbackController]
})   
export class UsersFeedbackModule {}
