import { Module } from '@nestjs/common';
import { Admins } from './admins.entity';
import { AdminsService } from './admins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsController } from './admins.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Admins])],
  exports: [AdminsService],
  providers: [AdminsService],
  controllers: [AdminsController]

})
export class AdminsModule { }
