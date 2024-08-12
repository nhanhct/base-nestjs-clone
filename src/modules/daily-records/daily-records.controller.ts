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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  UPDATE_SUCCESS,
  BAD_REQUEST,
  CREATE_SUCCESS,
  UNAUTHORIZED,
  SUCCESSFULLY,
  DELETESUCCESS,
  COMMON_CODE,
  RECORDS_TYPE,
  UPDATE_FAILED,
} from 'utils/constants';
import { FAIL, SUCCESS, SUCCESS_PAGING } from 'constants/response';
import { DailyRecordsService } from 'modules/daily-records';

@Controller('api/daily-records')
export class DailyRecordsController {
  constructor(private readonly dailyRecordsService: DailyRecordsService) { }

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
    let dailyRecord = await this.dailyRecordsService.getById(parseInt(id));

    return SUCCESS(200, dailyRecord, SUCCESSFULLY, 1, response);
  }

  //get paging
  @Get('all-daily-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllUserPaging(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { data, count } = await this.dailyRecordsService.getAllDailyPaging(request.query);

    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response);
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
    let dailyRecord = await this.dailyRecordsService.getByUserId(parseInt(userId));

    return SUCCESS(200, dailyRecord, SUCCESSFULLY, 1, response);
  }

  //get by date
  @UseGuards(AuthGuard('jwt'))
  @Get('get-by-date')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getByDate(@Req() request, @Res() response: Response): Promise<any> {
    const userId = request.user.id;
    const date = request.query.date;
    console.log("userId==date", userId, date);

    let dailyRecord = await this.dailyRecordsService.getInfoByDate(userId, date);
    console.log("dailyRecord", dailyRecord);

    return SUCCESS(200, dailyRecord, SUCCESSFULLY, 1, response);
  }

  //get-by-daily-type
  @UseGuards(AuthGuard('jwt'))
  @Get('get-by-daily-type')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getByDailyType(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    const date = request.query.date;
    const dailyTypeId = request.query.daily_type_id;
    let dailyRecord = await this.dailyRecordsService.getInfoByDailyType(userId, date, dailyTypeId);

    return SUCCESS(200, dailyRecord, SUCCESSFULLY, 1, response);
  }

  //create
  @UseGuards(AuthGuard('jwt'))
  @Put('update-by-user')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateByUser(@Req() request, @Res() response: Response): Promise<any> {
    if (request.body == null)
      return FAIL(200, null, 'Body null', response);

    const recordDate = request.body.record_date;
    if (recordDate == null)
      return FAIL(200, null, 'Record Date null', response);

    const dailyRecords = await this.dailyRecordsService.updateByUser(request.user.id, request.body);
    if (dailyRecords) {
      return SUCCESS(200, dailyRecords, UPDATE_SUCCESS, 1, response);
    }

    return FAIL(200, dailyRecords, UPDATE_FAILED, response);
  }

  //Admin delete
  @Delete('delete-update/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async deleteUpdate(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    await this.dailyRecordsService.deleteUpdate(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }

  //delete
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async delete(@Req() request, @Res() response: Response): Promise<any> {
    await this.dailyRecordsService.deleteDetailByUser(request.user.id, request.body);

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('delete-bynhan')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async deleteByNhan(@Req() request, @Res() response: Response): Promise<any> {
    await this.dailyRecordsService.deleteDetailByUser(request.user.id, request.body);

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }
}
