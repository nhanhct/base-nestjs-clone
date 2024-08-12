import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '.';
import { CommonCodesModule } from 'modules/common-codes';
import { ContentsController } from './content.controller';
import { ContentService } from './content.service';
import { FavoritiesModule } from 'modules/favorities';

@Module({
  imports: [TypeOrmModule.forFeature([Content]), CommonCodesModule, FavoritiesModule],
  providers: [ContentService],
  exports: [ContentService],
  controllers: [ContentsController]
})
export class ContentModule { }
