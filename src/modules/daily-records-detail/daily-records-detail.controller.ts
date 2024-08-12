import { Controller, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Response } from "express";
import { AuthGuard } from '@nestjs/passport';
import { BAD_REQUEST, UNAUTHORIZED, DELETESUCCESS } from 'utils/constants';
import { SUCCESS } from 'constants/response';
import { DailyRecordsDetailService } from './daily-records-detail.service';

@Controller('api/daily-records-detail')
export class DailyRecordsDetailController {
    constructor(
        private readonly dailyRecordsDetailService: DailyRecordsDetailService,
    ) { }

    //delete
    @UseGuards(AuthGuard('jwt'))
    @Delete('delete/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async delete(@Req() request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.dailyRecordsDetailService.delete(id);

        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }
}