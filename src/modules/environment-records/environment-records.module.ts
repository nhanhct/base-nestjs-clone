import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule, } from '@nestjs/typeorm';
import { CommonCodesModule } from 'modules/common-codes';
import { UserModule } from 'modules/user';
import { UsersFeedbackModule } from 'modules/user-feedback';
import { EnvironmentRecordsController } from './environment-records.controller';
import { EnvironmentRecords, EnvironmentRecordsService } from 'modules/environment-records';
import { EnvironmentRecordsDetailModule } from 'modules/environment-records-detail';
import { UserFeedbackDetailModule } from 'modules/user-feedback-detail';
import { SleepRecordsModule } from 'modules/sleep-records';

@Module({
    providers: [EnvironmentRecordsService],
    imports: [TypeOrmModule.forFeature([EnvironmentRecords]),
        CommonCodesModule,
        UserModule,
    forwardRef(() => UsersFeedbackModule),
    forwardRef(() => UserFeedbackDetailModule),
    forwardRef(() => EnvironmentRecordsDetailModule),
    forwardRef(() => SleepRecordsModule),
    ],
    exports: [EnvironmentRecordsService],
    controllers: [EnvironmentRecordsController]
})
export class EnvironmentRecordsModule { }
