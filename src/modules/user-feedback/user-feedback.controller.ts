import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import {
  BAD_REQUEST,
  UNAUTHORIZED,
  SUCCESSFULLY
} from 'utils/constants';
import { AuthGuard } from '@nestjs/passport';
import { UsersFeedbackService } from './../user-feedback';
import { SUCCESS, SUCCESS_PAGING } from 'constants/response';
@Controller('api/user-feedback')
//@ApiTags('authentication')
export class UsersFeedbackController {
  constructor(
    private readonly userFeedbackService: UsersFeedbackService,
  ) { }

  @Get('get-by-id/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.id
    let dailyRecord = await this.userFeedbackService.getById(parseInt(id))
    return SUCCESS(200, dailyRecord, SUCCESSFULLY, 1, response)
  }

  //getListByUser
  @Get('get-list-by-user/:user_id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getListByUser(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.user_id
    let userFeedback = await this.userFeedbackService.getListByUser(parseInt(id))
    return SUCCESS(200, userFeedback, SUCCESSFULLY, 1, response)
  }

  //get paging
  @Get('all-feedback-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllPaging(@Req() request: Request, @Res() response: Response): Promise<any> {
    const { data, count } = await this.userFeedbackService.getAllDailyPaging(request.query)
    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get-by-date')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getByDate(@Req() request, @Res() response: Response): Promise<any> {
    const userId = request.user.id
    const date = request.query.date
    let userFeedback = await this.userFeedbackService.getInfoByDate(userId, date);
    return SUCCESS(200, userFeedback, SUCCESSFULLY, 1, response)
  }

}

