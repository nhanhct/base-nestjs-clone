import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodes, CommonCodesModule } from 'modules/common-codes';
import { User } from 'modules/user';
import { UsersController } from 'modules/user/user.controller';
import { UsersLog } from '.';
import { UsersLogService } from '../users-log/users-log.service';
import { UsersLogController } from './users-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersLog, CommonCodes]),
    CommonCodesModule,
  ],
  controllers: [UsersLogController],
  providers: [UsersLogService],
  exports: [UsersLogService],
})
export class UsersLogModule {}
