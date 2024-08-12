import { Controller, Delete, Get, Put, Req, Res } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import {
    UPDATE_SUCCESS,
    BAD_REQUEST,
    UNAUTHORIZED,
    SUCCESSFULLY,
    DELETESUCCESS
} from 'utils/constants';
import { SUCCESS } from 'constants/response';
import { SurveyRecordsDetailService } from '.';

@Controller('api/survey-records-detail')
export class SurveyRecordsDetailController {
    constructor(
        private readonly surveyRecordsDetailService: SurveyRecordsDetailService,
    ) { }

    // //get by id
    // @Get('get-by-id/:id')
    // @ApiResponse({ status: 201, description: SUCCESSFULLY })
    // @ApiResponse({ status: 400, description: BAD_REQUEST })
    // @ApiResponse({ status: 401, description: UNAUTHORIZED })
    // async getDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
    //     const id = request.params.id
    //     const surveyRecord = await this.surveyRecordsDetailService.get(parseInt(id))

    //     return SUCCESS(200,surveyRecord,SUCCESSFULLY,1,response)
    // } 

    //get by survey id
    @Get('get-by-survey-id/:survey_records_id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getBySurveyId(@Req() request: Request, @Res() response: Response): Promise<any> {
        const surveyId = request.params.survey_records_id
        const surveyRecordDetail = await this.surveyRecordsDetailService.getDetailBySurveyId(parseInt(surveyId))

        return SUCCESS(200, surveyRecordDetail, SUCCESSFULLY, 1, response)
    }

    // //create
    // @UseGuards(AuthGuard('jwt'))
    // @Post('create')
    // @ApiResponse({ status: 201, description: CREATE_SUCCESS })
    // @ApiResponse({ status: 400, description: BAD_REQUEST })
    // @ApiResponse({ status: 401, description: UNAUTHORIZED })
    // async create(@Req() request: Request, @Res() response: Response): Promise<any> {
    //     const surveyRecordDetail = await this.surveyRecordsDetailService.create(request.body);

    //     return SUCCESS(200,surveyRecordDetail,CREATE_SUCCESS,1,response)
    // }

    //update
    // @UseGuards(AuthGuard('jwt'))
    @Put('update/:id')
    @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async update(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        const surveyRecordDetail = await this.surveyRecordsDetailService.updateAdmin(parseInt(id), request.body);

        return SUCCESS(200, surveyRecordDetail, UPDATE_SUCCESS, 1, response)
    }

    // update status isdelete 
    // @UseGuards(AuthGuard('jwt'))
    @Delete('delete-update/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async deleteUpdate(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.surveyRecordsDetailService.deleteUpdate(parseInt(id));

        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }

    @Delete('delete/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async delete(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.surveyRecordsDetailService.delete(parseInt(id));
        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }
}