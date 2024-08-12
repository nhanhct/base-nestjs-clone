import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { DailyRecordsModule } from 'modules/daily-records';
import { DailyRecordsDetailController } from './daily-records-detail.controller';
import { DailyRecordsDetail } from './daily-records-detail.entity';
import { DailyRecordsDetailService } from './daily-records-detail.service';

@Module({
    providers: [DailyRecordsDetailService],
    imports: [TypeOrmModule.forFeature([DailyRecordsDetail]), CommonCodesModule,
    forwardRef(() => DailyRecordsModule)],
    exports: [DailyRecordsDetailService],
    controllers: [DailyRecordsDetailController]
})
export class DailyRecordsDetailModule { }
