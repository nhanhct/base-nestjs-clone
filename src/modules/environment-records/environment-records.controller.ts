import {
  Controller,
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
import { EnvironmentRecordsService } from './../environment-records';
import {
  BAD_REQUEST,
  CREATE_SUCCESS,
  UNAUTHORIZED,
  SUCCESSFULLY,
} from 'utils/constants';
import { SUCCESS, SUCCESS_PAGING } from 'constants/response';

@Controller('api/environment-records')
export class EnvironmentRecordsController {
  constructor(
    private readonly environmentRecordsService: EnvironmentRecordsService,
  ) {}

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
    const environmentRecord = await this.environmentRecordsService.get(
      parseInt(id),
    );

    return SUCCESS(200, environmentRecord, SUCCESSFULLY, 1, response);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('update-create-phone-log')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateCreatePhoneLog(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const environmentRecord =
      await this.environmentRecordsService.updateCreatePhoneLog(
        request.user.id,
      );

    return SUCCESS(200, environmentRecord, SUCCESSFULLY, 1, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update-create-number-step')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateCreateNumberStep(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const environmentRecord =
      await this.environmentRecordsService.updateCreateNumberStep(
        request.user.id,
        request.body.step,
      );

    return SUCCESS(200, environmentRecord, SUCCESSFULLY, 1, response);
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
    const environmentRecord = await this.environmentRecordsService.getByUserId(
      parseInt(userId),
    );

    return SUCCESS(200, environmentRecord, SUCCESSFULLY, 1, response);
  }

  //get paging
  @Get('all-environment-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllEnvironmentPaging(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { data, count } =
      await this.environmentRecordsService.getAllEnvironmentPaging(
        request.query,
      );

    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response);
  }

  //get by date
  @UseGuards(AuthGuard('jwt'))
  @Get('phonelog-get-by-date')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getPhoneLogByDate(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    const date = request.query.date;
    let phonelogRecord =
      await this.environmentRecordsService.getEnvPhoneLogTodayUser(
        userId,
        date,
      );
      console.log("user===",userId)
    return SUCCESS(200, phonelogRecord, SUCCESSFULLY, 1, response);
  }

  //get number step by date
  @UseGuards(AuthGuard('jwt'))
  @Get('numberstep-get-by-date')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getNumberStepByDate(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const userId = request.user.id;
    const date = request.query.date;
    let numerStepRecord =
      await this.environmentRecordsService.getEnvNumberStepTodayUser(
        userId,
        date,
      );

    return SUCCESS(200, numerStepRecord, SUCCESSFULLY, 1, response);
  }

  //get bay date
  @UseGuards(AuthGuard('jwt'))
  @Get('get-by-date')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getByDate(@Req() request, @Res() response: Response): Promise<any> {
    const userId = request.user.id;
    const date = request.query.date;
    let environmentRecord = await this.environmentRecordsService.getInfoByDate(
      userId,
      date,
    );

    return SUCCESS(200, environmentRecord, SUCCESSFULLY, 1, response);
  }

  //create
  @UseGuards(AuthGuard('jwt'))
  @Put('update-mobile')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateMobile(@Req() request, @Res() response: Response): Promise<any> {
    const environmentRecord =
      await this.environmentRecordsService.createOrUpdateMobile(
        request.user.id,
        request.body,
      );

    return SUCCESS(200, environmentRecord, CREATE_SUCCESS, 1, response);
  }

  //update data fitbit
  @UseGuards(AuthGuard('jwt'))
  @Put('update-fitbit')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateFitbit(@Req() request, @Res() response: Response): Promise<any> {
    const environmentRecord =
      await this.environmentRecordsService.createOrUpdateFitbit(
        request.user.id,
        request.body,
      );

    return SUCCESS(200, environmentRecord, CREATE_SUCCESS, 1, response);
  }

  //create update-environment-detail
  @UseGuards(AuthGuard('jwt'))
  @Post('create-update-environment-detail')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getUpdateEnvDetail(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const environmentRecord =
      await this.environmentRecordsService.createOrUpdateEnvironmentDetail(
        request.user.id,
        request.body.date,
        request.body.details,
      );

    return SUCCESS(200, environmentRecord, SUCCESSFULLY, 1, response);
  }

  //create update-environment-detail
  @UseGuards(AuthGuard('jwt'))
  @Post('create-update-environment-weather')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async createUpdatenvironmentWeather(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const environmentRecord =
      await this.environmentRecordsService.createUpdateWeather(
        request.user.id,
        request.body.date,
        request.body.details,
      );
    return SUCCESS(200, environmentRecord, SUCCESSFULLY, 1, response);
  }
}
