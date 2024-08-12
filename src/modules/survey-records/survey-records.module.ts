import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyRecords } from './survey-records.entity';
import { SurveyRecordsService } from './survey-records.service';
import { SurveyRecordsController } from './survey-records.controller';
import { UserModule } from 'modules/user';
import { SurveyRecordsDetailModule } from 'modules/survey-records-detail';
import { CommonCodesModule } from 'modules/common-codes';

@Module({
  providers: [SurveyRecordsService],
  imports: [TypeOrmModule.forFeature([SurveyRecords]),
              UserModule,
              CommonCodesModule,
              SurveyRecordsDetailModule
            ],
  exports: [SurveyRecordsService],
  controllers: [SurveyRecordsController]
})
export class SurveyRecordsModule {}
