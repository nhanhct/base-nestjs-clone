import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationAppleController } from './authentication-apple.controller';
import { AuthenticationAppleService } from './authentication-apple.service';
import { AuthenticationApple } from '.';

@Module({
  imports: [TypeOrmModule.forFeature([AuthenticationApple])],
  providers: [AuthenticationAppleService],
  exports: [AuthenticationAppleService],
  controllers: [AuthenticationAppleController]
})
export class AuthenticationAppleModule { }
