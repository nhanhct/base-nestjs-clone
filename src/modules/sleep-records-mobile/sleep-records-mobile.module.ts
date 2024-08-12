import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepRecordsModule } from 'modules/sleep-records';
import { SleepRecordsDetailModule } from 'modules/sleep-records-fitbit';
import { SleepRecordsLog, SleepRecordsLogService } from 'modules/sleep-records-mobile';
import { UserModule } from 'modules/user';
import { SleepRecordsLogController } from './sleep-records-mobile.controller';

@Module({
  providers: [SleepRecordsLogService],
  imports: [TypeOrmModule.forFeature([SleepRecordsLog]),
  forwardRef(() => SleepRecordsModule),
  forwardRef(() => SleepRecordsDetailModule),
    UserModule,

  ],
  exports: [SleepRecordsLogService],
  controllers: [SleepRecordsLogController],
})
export class SleepRecordsLogModule { }
