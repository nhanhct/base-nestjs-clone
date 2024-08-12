import { Controller, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FAIL, SUCCESS, SUCCESS_PAGING } from 'constants/response';
import {
  BAD_REQUEST,
  SUCCESSFULLY,
  UNAUTHORIZED,
  UPDATE_FAILED,
  UPDATE_SUCCESS,
} from 'utils';
import { SleepRecordsLogService } from './sleep-records-mobile.service';

@Controller('api/sleep-records-log')
export class SleepRecordsLogController {
  constructor(
    private readonly sleepRecordsLogService: SleepRecordsLogService,
  ) { }

  //get paging
  @Get('sleep-log-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllSleepLogPaging(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { data, count } = await this.sleepRecordsLogService.getAllSleepLogPaging(request.query);
    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response);
  }

  //get-list
  @Get('get-detail/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getBySleepRecordLogId(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const sleepRecordsLogs = await this.sleepRecordsLogService.getBySleepRecordLogId(parseInt(id));

    return SUCCESS(200, sleepRecordsLogs, SUCCESSFULLY, 1, response);
  }

  //get-list
  @Get('get-by-sleep-record/:sleep_records_id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getBySleepRecordId(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.sleep_records_id;
    const sleepRecordsLogs = await this.sleepRecordsLogService.getBySleepRecordId(parseInt(id));

    return SUCCESS(200, sleepRecordsLogs, SUCCESSFULLY, 1, response);
  }

  //get-by-date
  @Get('get-by-date')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getByDate(@Req() request, @Res() response: Response): Promise<any> {
    const sleepRecordsLog = await this.sleepRecordsLogService.getByDate(request.query.user_id, request.query.date);

    return SUCCESS(200, sleepRecordsLog, SUCCESSFULLY, 1, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async create(@Req() request, @Res() response: Response): Promise<any> {
    const sleepRecordsLog = await this.sleepRecordsLogService.create(request.user.id, request.body);
    if (sleepRecordsLog) {
      return SUCCESS(200, sleepRecordsLog, UPDATE_SUCCESS, 1, response);
    }

    return FAIL(200, null, UPDATE_FAILED, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async update(@Req() request, @Res() response: Response): Promise<any> {
    const sleepRecordsMobile = await this.sleepRecordsLogService.getBySleepRecordLogId(request.body.id);
    if (!sleepRecordsMobile) {
      return FAIL(500, null, "Record mobile not found", response);
    }
    const sleepRecordsLog = await this.sleepRecordsLogService.update(request.body.id, request.body.url);
    if (sleepRecordsLog) {
      return SUCCESS(200, sleepRecordsLog, UPDATE_SUCCESS, 1, response);
    }

    return FAIL(200, null, UPDATE_FAILED, response);
  }
}
