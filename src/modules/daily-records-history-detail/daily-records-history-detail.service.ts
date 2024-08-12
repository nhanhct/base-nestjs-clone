import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyRecordsDetail } from 'modules/daily-records-detail/daily-records-detail.entity';
import { DailyRecordsHistory } from 'modules/daily-records-history';
import { Repository } from 'typeorm';
import { DailyRecordsHistoryDetail } from './daily-records-history-detail.entity';

@Injectable()
export class DailyRecordsHistoryDetailService {
    constructor(
        @InjectRepository(DailyRecordsHistoryDetail)
        private readonly dailyRecordhistoryRepository: Repository<DailyRecordsHistoryDetail>,
    ) { }

    async CreateRange(dailyRecordhistory: DailyRecordsHistory, dailyRecordsDetails: DailyRecordsDetail[]) {
        const details = [];
        for (let index = 0; index < dailyRecordsDetails.length; index++) {
            const element = dailyRecordsDetails[index];
            const detail = new DailyRecordsHistoryDetail();
            detail.daily_type_id = element.daily_type_id;
            detail.type_id = element.type_id;
            detail.vol = element.vol;
            detail.time_id = element.time_id;
            detail.created_at = new Date();
            detail.dailyRecordsHistory = dailyRecordhistory;
            await this.dailyRecordhistoryRepository.save(detail);
            details.push(detail);
        }
        return details;
    }
}
