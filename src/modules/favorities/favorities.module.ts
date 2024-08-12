import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'modules/user';
import { Favorities } from '.';
import { FavoritiesController } from './favorities.controller';
import { FavoritiesService } from './favorities.service';
@Module({
  imports: [TypeOrmModule.forFeature([Favorities]), UserModule],
  exports: [FavoritiesService],
  providers: [FavoritiesService],
  controllers: [FavoritiesController],
})
export class FavoritiesModule { }