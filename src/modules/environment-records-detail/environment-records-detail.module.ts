import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentRecordsDetail, EnvironmentRecordsDetailService } from 'modules/environment-records-detail';

@Module({
    providers: [EnvironmentRecordsDetailService],
    imports: [TypeOrmModule.forFeature([EnvironmentRecordsDetail])],
    exports: [EnvironmentRecordsDetailService],
})
export class EnvironmentRecordsDetailModule { }
