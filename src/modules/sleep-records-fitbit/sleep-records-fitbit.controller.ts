import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import { SleepRecordsDetailService } from '.';
import {
    BAD_REQUEST,
    UNAUTHORIZED,
    SUCCESSFULLY
} from 'utils/constants';
import { SUCCESS } from 'constants/response';

@Controller('api/sleep-records-fitbit')
export class SleepRecordsDetailController {
    constructor(
        private readonly sleepRecordsdetailService: SleepRecordsDetailService,
    ) { }

    //get by id
    @Get('get-by-id/:id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        const sleepRecordDetail = await this.sleepRecordsdetailService.getById(parseInt(id))

        return SUCCESS(200, sleepRecordDetail, SUCCESSFULLY, 1, response)
    }

    //get by sleep-record id
    @Get('get-by-sleep-records-id/:sleep_records_id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getByUserId(@Req() request: Request, @Res() response: Response): Promise<any> {
        const sleepRecordsId = request.params.sleep_records_id
        let dailyRecordDetails = await this.sleepRecordsdetailService.getBySleepRecordId(parseInt(sleepRecordsId))

        return SUCCESS(200, dailyRecordDetails, SUCCESSFULLY, 1, response)
    }

}