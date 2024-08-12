import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { DailyRecordsDetailModule } from 'modules/daily-records-detail/daily-records-detail.module';
import { DailyRecordsHistoryModule } from 'modules/daily-records-history';
import { UserModule } from 'modules/user';
import { UsersFeedbackModule } from 'modules/user-feedback';
import { UserFeedbackDetailModule } from 'modules/user-feedback-detail';
import { DailyRecordsController } from './daily-records.controller';
import { DailyRecords } from './daily-records.entity';
import { DailyRecordsService } from './daily-records.service';

@Module({
    providers:[DailyRecordsService],
    imports: [TypeOrmModule.forFeature([DailyRecords]),
        CommonCodesModule,
        UserModule,  
        DailyRecordsHistoryModule,
        forwardRef(()=> DailyRecordsDetailModule),
        forwardRef(()=> UsersFeedbackModule),
        forwardRef(()=> UserFeedbackDetailModule)
    ],
    exports: [DailyRecordsService],
    controllers: [DailyRecordsController]
})
export class DailyRecordsModule {}
