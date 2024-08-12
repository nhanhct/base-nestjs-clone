import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { DailyRecordsModule } from 'modules/daily-records'; 
import { UserModule } from 'modules/user';
import { DailyRecordsHistory,DailyRecordsHistoryService } from 'modules/daily-records-history';
import { DailyRecordsHistoryController } from './daily-records-history.controller';
import {  DailyRecordsHistoryDetailModule } from 'modules/daily-records-history-detail';
 

@Module({
    providers:[DailyRecordsHistoryService],
    imports: [TypeOrmModule.forFeature([DailyRecordsHistory]), UserModule,
                forwardRef(() => DailyRecordsModule),
                forwardRef(() => DailyRecordsHistoryDetailModule),
            ],
    exports: [DailyRecordsHistoryService],
    controllers: [DailyRecordsHistoryController]
})
export class DailyRecordsHistoryModule {}
