import { Controller, Delete, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import { DailyRecordsHistoryService } from '../daily-records-history';
import {
    BAD_REQUEST, UNAUTHORIZED,
    SUCCESSFULLY, DELETESUCCESS
} from 'utils/constants';
import { SUCCESS, SUCCESS_PAGING } from 'constants/response';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/daily-records-history')
export class DailyRecordsHistoryController {
    constructor(
        private readonly dailyRecordshistoryService: DailyRecordsHistoryService,
    ) { }

    //get paging
    @Get('all-daily-history-paging')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getAllDailyHistoryPaging(@Req() request: Request, @Res() response: Response): Promise<any> {
        const { data, count } = await this.dailyRecordshistoryService.getAllDailyHistoryPaging(request.query)

        return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response)
    }

    //get by user id
    @Get('get-by-user-id/:user_id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getByUserId(@Req() request: Request, @Res() response: Response): Promise<any> {
        const userId = request.params.user_id
        let dailyRecordHistory = await this.dailyRecordshistoryService.getByUserId(parseInt(userId))

        return SUCCESS(200, dailyRecordHistory, SUCCESSFULLY, 1, response)
    }

    //get by id
    @Get('get-by-id/:id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        let dailyRecordHistory = await this.dailyRecordshistoryService.getById(parseInt(id))

        return SUCCESS(200, dailyRecordHistory, SUCCESSFULLY, 1, response)
    }

    //get by daily-records user id
    @Get('get-by-daily-records-id/:daily_records_id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getByRecordId(@Req() request: Request, @Res() response: Response): Promise<any> {
        const dailyId = request.params.daily_records_id
        let dailyRecordHistory = await this.dailyRecordshistoryService.getByDailyRecordId(parseInt(dailyId))

        return SUCCESS(200, dailyRecordHistory, SUCCESSFULLY, 1, response)
    }

    //remove in DB
    @UseGuards(AuthGuard('jwt'))
    @Delete('delete/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async delete(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.dailyRecordshistoryService.delete(parseInt(id));

        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }

}