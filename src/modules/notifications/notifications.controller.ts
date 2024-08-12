import { Request, Response } from "express";
import { AuthGuard } from '@nestjs/passport';
import {
    BAD_REQUEST,
    CREATE_SUCCESS,
    UNAUTHORIZED,
    SUCCESSFULLY,
    CREATE_FAILED
} from 'utils/constants';
import { NotificationsService } from './notifications.service';
import { FAIL, SUCCESS, SUCCESS_PAGING } from 'constants/response';
import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

@Controller('api/notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    //create
    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    @ApiResponse({ status: 201, description: CREATE_SUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async create(
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<any> {
        const notifications = await this.notificationsService.create(request.body);
        if (notifications != undefined)
            return SUCCESS(200, notifications, CREATE_SUCCESS, 1, response);
        else
            return FAIL(500, null, CREATE_FAILED, response);
    }

    @Get('paging')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getAllNotificationPaging(
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<any> {
        const { data, count } = await this.notificationsService.getAllNotifyPaging(request.query);

        return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response)
    }
}