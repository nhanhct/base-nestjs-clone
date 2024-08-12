import { Module } from '@nestjs/common';
import { CommonCodesService } from './common-codes.service';
import { CommonCodes } from './common-codes.entity';
 import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodeController } from './common-codes.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CommonCodes])],
    exports: [CommonCodesService],
    providers: [CommonCodesService],
    controllers: [CommonCodeController]
})
export class CommonCodesModule {}
