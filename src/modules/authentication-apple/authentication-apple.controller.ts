import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  FAIL,
  SUCCESS,
} from 'constants/response';
import {
  CREATE_SUCCESS,
  APPLEID_EXIST,
  SUCCESSFULLY,
  BAD_REQUEST,
  UNAUTHORIZED,
  FAILED
} from 'utils/constants';
import { AuthenticationAppleService } from './authentication-apple.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('api/authentication')
export class AuthenticationAppleController {
  constructor(
    private readonly authenticationAppleService: AuthenticationAppleService,

  ) { }

  //get-detail
  @Get('get-by-appleId/:apple_id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getBySleepRecordLogId(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const appleId = request.params.apple_id;
    const appleModel = await this.authenticationAppleService.checkAppleId(appleId);
    if (appleModel != undefined) {
      return SUCCESS(200, appleModel, SUCCESSFULLY, 200, response);
    } else return FAIL(400, null, FAILED, response);
  }

  //create
  @Post('create-apple-id')
  async createAppleId(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const body = request.body;

    const appleModel = await this.authenticationAppleService.checkAppleId(body.apple_id)
    console.log("appleModel", appleModel);
    if (appleModel == undefined) {
      const data = await this.authenticationAppleService.addAppleId(body);
      return SUCCESS(200, data, CREATE_SUCCESS, 200, response);
    } else return FAIL(401, null, APPLEID_EXIST, response);
  }
}
