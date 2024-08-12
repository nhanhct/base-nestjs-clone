import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFeedbackDetail } from './user-feedback-detail.entity';
import { UserFeedbackDetailService } from 'modules/user-feedback-detail';

@Module({
  imports: [TypeOrmModule.forFeature([UserFeedbackDetail])],
  providers: [UserFeedbackDetailService],
  exports: [UserFeedbackDetailService],
})
export class UserFeedbackDetailModule { }
