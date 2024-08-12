import { Controller, Delete, Get, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import { AuthGuard } from '@nestjs/passport';
import { SurveyRecordsService } from './../survey-records';
import {
    BAD_REQUEST,
    CREATE_SUCCESS,
    UNAUTHORIZED,
    SUCCESSFULLY,
    DELETESUCCESS, BODY_NULL, RECORD_DATA_NULL, CREATE_FAILED
} from 'utils/constants';
import { FAIL, SUCCESS, SUCCESS_PAGING } from 'constants/response';
import { SurveyRecordsDetailService } from 'modules/survey-records-detail';

@Controller('api/survey-records')
export class SurveyRecordsController {
    constructor(
        private readonly surveyRecordsService: SurveyRecordsService,
        private readonly surveyRecordsDetailService: SurveyRecordsDetailService,
    ) { }

    //get by id
    @Get('get-by-id/:id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        const surveyRecord = await this.surveyRecordsService.get(parseInt(id))

        return SUCCESS(200, surveyRecord, SUCCESSFULLY, 1, response)
    }

    //get by id
    @Get('get-detail-by-survey-id/:survey_records_id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getSurveyDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.survey_records_id
        const surveyRecordDetail = await this.surveyRecordsDetailService.getDetailBySurveyId(parseInt(id))

        return SUCCESS(200, surveyRecordDetail, SUCCESSFULLY, 1, response)
    }

    //get by user id
    @Get('get-by-user-id/:user_id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getByUserId(@Req() request: Request, @Res() response: Response): Promise<any> {
        const userId = request.params.user_id
        const surveyRecord = await this.surveyRecordsService.getByUserId(parseInt(userId))

        return SUCCESS(200, surveyRecord, SUCCESSFULLY, 1, response)
    }

    //get paging
    @Get('all-survey-paging')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getAllUserPaging(@Req() request: Request, @Res() response: Response): Promise<any> {
        const { data, count } = await this.surveyRecordsService.getAllSurveyPaging(request.query)
        console.log("data", data)
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
        let dailyRecord = await this.surveyRecordsService.getInfoByDate(userId, date);
        return SUCCESS(200, dailyRecord, SUCCESSFULLY, 1, response)
    }


    @UseGuards(AuthGuard('jwt'))
    @Put('update-by-user')
    @ApiResponse({ status: 201, description: CREATE_SUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async create(@Req() request, @Res() response: Response): Promise<any> {
        if (request.body == null)
            return FAIL(200, null, BODY_NULL, response);

        const recordDate = request.body.date;
        if (recordDate == null)
            return FAIL(200, null, RECORD_DATA_NULL, response);
        const surveyRecord = await this.surveyRecordsService.updateByUser(request.user.id, request.body);
        if (surveyRecord)
            return SUCCESS(200, surveyRecord, CREATE_SUCCESS, 1, response)
        return FAIL(200, null, CREATE_FAILED, response)
    }

    // update status isdelete 
    // @UseGuards(AuthGuard('jwt'))
    @Delete('delete-update/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async deleteUpdate(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.surveyRecordsService.deleteUpdate(parseInt(id));
        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }
}