import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { SleepRecordsService } from './../sleep-records';
import {
  UPDATE_SUCCESS,
  BAD_REQUEST,
  UNAUTHORIZED,
  SUCCESSFULLY,
  DELETESUCCESS,
  UPDATE_FAILED,
  BODY_NULL,
  RECORD_DATA_NULL,
} from 'utils/constants';
import { SUCCESS, SUCCESS_PAGING, FAIL, SUCCESSTest } from 'constants/response';

@Controller('api/sleep-records')
export class SleepRecordsController {
  constructor(private readonly sleepRecordsService: SleepRecordsService) { }
  //get full date of month
  @UseGuards(AuthGuard('jwt'))
  @Get('get-alldate-bymonth')
  async getAllDateByMonth(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    let date = request.query.date;
    const sleepRecord = await this.sleepRecordsService.getFullDateRecordByMonth(
      userId,
      date,
    );

    return SUCCESS(200, sleepRecord, SUCCESSFULLY, 1, response);
  }
  //get by id
  @Get('get-by-id/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getDetail(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const sleepRecord = await this.sleepRecordsService.getDetailByID(
      parseInt(id),
    );
    return SUCCESS(200, sleepRecord, SUCCESSFULLY, 1, response);
  }

  //get by id
  @Get('get/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async get(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const sleepRecord = await this.sleepRecordsService.get(
      parseInt(id),
    );
    return SUCCESS(200, sleepRecord, SUCCESSFULLY, 1, response);
  }

  //get by id
  @Get('get-by-id-admin/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getDetailAdmin(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const sleepRecord = await this.sleepRecordsService.get(parseInt(id));
    const resultRecord = await this.sleepRecordsService.getAllByDate(
      sleepRecord.user_id,
      sleepRecord?.date,
    );
    return SUCCESS(200, resultRecord, SUCCESSFULLY, 1, response);
  }

  //get by user id
  @Get('get-by-user-id/:user_id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getByUserId(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.params.user_id;
    const sleepRecord = await this.sleepRecordsService.getByUserId(
      parseInt(userId),
    );

    return SUCCESS(200, sleepRecord, SUCCESSFULLY, 1, response);
  }

  //get by user id, today
  @UseGuards(AuthGuard('jwt'))
  @Get('get-by-user-id-today')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getByUserIdToday(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    let date = request.query.date;
    const sleepRecord = await this.sleepRecordsService.getByDate(
      parseInt(userId),
      date,
    );

    return SUCCESS(200, sleepRecord, SUCCESSFULLY, 1, response);
  }

  //get selection by user id, today
  @UseGuards(AuthGuard('jwt'))
  @Get('get-selection-today')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getSelectionToday(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    let date = request.query.date;
    const sleepRecords = await this.sleepRecordsService.getAllByDate(
      parseInt(userId),
      date,
    );
    if (sleepRecords == undefined) {
      return SUCCESS(200, null, SUCCESSFULLY, 1, response);
    }
    return SUCCESS(200, sleepRecords, SUCCESSFULLY, 1, response);
  }

  //get selection by user id, today
  @UseGuards(AuthGuard('jwt'))
  @Get('get-selection-today-test-admin')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getSelectionTodayTestAdmin(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    let date = request.query.date;
    const sleepRecords = await this.sleepRecordsService.getAllByDate(
      parseInt(userId),
      date,
    );
    if (sleepRecords == undefined) {
      return SUCCESS(200, null, SUCCESSFULLY, 1, response);
    }
    return SUCCESS(200, sleepRecords, SUCCESSFULLY, 1, response);
  }

  //get data home screen sleep record history
  @UseGuards(AuthGuard('jwt'))
  @Get('get-record-data-home-history')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getRecordDataHomeHistory(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    const sleepRecordsHistory =
      await this.sleepRecordsService.getRecordDataHomeHistory(
        parseInt(userId)
      );
    if (sleepRecordsHistory == undefined) {
      return SUCCESS(200, null, SUCCESSFULLY, 1, response);
    }

    return SUCCESS(200, sleepRecordsHistory, SUCCESSFULLY, 1, response);
  }

  //get paging
  @Get('all-sleep-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllSleepPaging(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    console.log("aaaa");

    const { data, count } = await this.sleepRecordsService.getAllSleepPaging(
      request.query,
    );

    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update-by-user')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateByUser(@Req() request, @Res() response: Response): Promise<any> {
    if (request.body == null) return FAIL(200, null, BODY_NULL, response);
    const recordDate = request.body.date;
    if (recordDate == null) return FAIL(200, null, RECORD_DATA_NULL, response);

    const sleepRecords = await this.sleepRecordsService.updateByUser(
      request.user.id,
      request.body,
    );
    if (sleepRecords)
      return SUCCESS(200, sleepRecords, UPDATE_SUCCESS, 1, response);

    return FAIL(200, null, UPDATE_FAILED, response);
  }

  @Delete('delete-update/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async deleteUpdate(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    await this.sleepRecordsService.deleteUpdate(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-update-datafitbit')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async createUpdateDataFitbit(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const user_id = request.user.id;
    await this.sleepRecordsService.createUpdateFitbit(
      user_id,
      request.body.date,
      request.body.details,
    );

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }

  //remove in DB
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async delete(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    await this.sleepRecordsService.delete(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }
}
