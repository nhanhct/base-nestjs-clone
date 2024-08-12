import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPasswordHistoryController } from './user-password-history.controller';
import { UserPasswordHistory } from './user-password-history.entity';
import { UserPasswordHistoryService } from './user-password-history.service';
@Module({
    imports: [TypeOrmModule.forFeature([UserPasswordHistory]),UserPasswordHistoryModule],
    exports: [UserPasswordHistoryService],
    providers: [UserPasswordHistoryService],
    controllers:[UserPasswordHistoryController]
  })
  export class UserPasswordHistoryModule {}
  