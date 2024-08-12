import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyRecordsDetail } from '.';
import { SurveyRecordsDetailController } from './survey-records-detail.controller';
import { SurveyRecordsDetailService } from './survey-records-detail.service';

@Module({
  providers: [SurveyRecordsDetailService],
  imports: [TypeOrmModule.forFeature([SurveyRecordsDetail])],
  exports: [SurveyRecordsDetailService],
  controllers: [SurveyRecordsDetailController]

})
export class SurveyRecordsDetailModule {}
