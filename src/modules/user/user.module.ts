import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './user.service';
import {UsersController} from './user.controller'
import {  CommonCodes, CommonCodesModule } from 'modules/common-codes';
import { UserPasswordHistory } from 'modules/user-password-history/user-password-history.entity';
import { UserPasswordHistoryModule } from 'modules/user-password-history/user-password-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([User,CommonCodes, UserPasswordHistory]),CommonCodesModule, UserPasswordHistoryModule],
  exports: [UsersService],
  providers: [UsersService],
  controllers:[UsersController]
})
export class UserModule {}
