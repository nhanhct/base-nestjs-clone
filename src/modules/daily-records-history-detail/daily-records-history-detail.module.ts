import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { DailyRecordsHistoryDetail, DailyRecordsHistoryDetailService } from 'modules/daily-records-history-detail';

@Module({
  providers: [DailyRecordsHistoryDetailService],
  imports: [TypeOrmModule.forFeature([DailyRecordsHistoryDetail]),CommonCodesModule],
  exports: [DailyRecordsHistoryDetailService],
})
export class DailyRecordsHistoryDetailModule {}
