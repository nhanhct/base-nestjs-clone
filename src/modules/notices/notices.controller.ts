
import { Controller, Delete, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { Admins } from './../admins';
import {
    UPDATE_SUCCESS,
    BAD_REQUEST,
    CREATE_SUCCESS,
    UNAUTHORIZED,
    SUCCESSFULLY,
    DELETESUCCESS
} from 'utils/constants';
import { NoticesService } from './notices.service';
import { SUCCESS, SUCCESS_PAGING } from 'constants/response';

@Controller('api/notices')
export class NoticesController {
    constructor(
        private readonly noticesService: NoticesService,
    ) { }

    // detail
    @Get('detail-notices/:id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getDetailNotices(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        const notice = await this.noticesService.getById(parseInt(id))
        return SUCCESS(200, notice, SUCCESSFULLY, 1, response)
    }

    //get all
    @Get('all-notices')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getAllNotice(@Res() response: Response): Promise<any> {
        const data = await this.noticesService.getAllNotices()
        return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, 0, response)
    }

    //get paging
    @Get('all-notices-paging')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getAllNoticePaging(@Req() request: Request, @Res() response: Response): Promise<any> {
        const { data, count } = await this.noticesService.getAllNoticesPaging(request.query)
        return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response)
    }

    //create
    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    @ApiResponse({ status: 201, description: CREATE_SUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async create(@CurrentUser() admin: Admins, @Req() request: Request, @Res() response: Response): Promise<any> {
        request.body.create_by = admin.id;
        const notice = await this.noticesService.create(request.body);

        return SUCCESS(200, notice, CREATE_SUCCESS, 1, response)
    }

    //update
    @UseGuards(AuthGuard('jwt'))
    @Put('update/:id')
    @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async update(@CurrentUser() admin: Admins, @Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        request.body.create_by = admin.id;
        const notice = await this.noticesService.update(parseInt(id), request.body);

        return SUCCESS(200, notice, UPDATE_SUCCESS, 1, response)
    }

    // update status isdelete 
    // @UseGuards(AuthGuard('jwt'))
    @Delete('delete-update/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async deleteUpdate(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.noticesService.deleteUpdate(parseInt(id));
        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }


}