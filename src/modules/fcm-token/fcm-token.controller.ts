import { Controller, Get, Post, UseGuards, Req, Res, Delete } from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import {
  BAD_REQUEST,
  UNAUTHORIZED,
  SUCCESSFULLY,
  DELETESUCCESS
} from 'utils/constants';
import { AuthGuard } from '@nestjs/passport';
import { SUCCESS } from 'constants/response';
import { FcmTokenService } from '.';
@Controller('api/fcm-token')
export class FcmTokenController {
  constructor(
    private readonly fcmTokenService: FcmTokenService,
  ) { }

  @Get('send-notifications-to-user-group')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async sendNotifications(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.user_id
    let fcm = await this.fcmTokenService.getListByUser(parseInt(id))

    return SUCCESS(200, fcm, SUCCESSFULLY, 1, response)
  }

  @Post('send-notifications-to-user')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async sendNotificationsToUser(@Req() request: Request, @Res() response: Response): Promise<any> {
    const token = request.body.token;
    const title = request.body.title;
    const content = request.body.content;
    const notice_id = request.body.notice_id;
    let fcm = await this.fcmTokenService.sendNotification(token, title, content, notice_id);
    console.log("fcm", fcm);
    return SUCCESS(200, fcm, SUCCESSFULLY, 1, response)
  }

  //remove in DB
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async delete(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.id
    await this.fcmTokenService.delete(parseInt(id));
    return SUCCESS(200, null, DELETESUCCESS, 1, response)
  }

}

