import { Controller, Delete, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from "express";
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { Admins, AdminsService } from './../admins';
import {
    UPDATE_SUCCESS,
    BAD_REQUEST, CREATE_SUCCESS,
    UNAUTHORIZED, SUCCESSFULLY,
    DELETESUCCESS, RESPONE_SUCCESS
} from 'utils/constants';
import { SUCCESS, SUCCESS_PAGING } from 'constants/response';

@Controller('api/admin')
export class AdminsController {
    constructor(
        private readonly adminsService: AdminsService,
    ) { }

    //get all
    @Get('all-admin')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getAll(@Req() request: Request, @Res() response: Response): Promise<any> {
        const admins = await this.adminsService.getAllAdmins()
        return SUCCESS(200, admins, SUCCESSFULLY, 1, response)
    }

    //get paging
    @Get('all-admin-paging')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getAllUserPaging(@Req() request: Request, @Res() response: Response): Promise<any> {
        const { data, count } = await this.adminsService.getAllAdminPaging(request.query)
        return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response)
    }

    //get by id
    // @UseGuards(AuthGuard('jwt'))
    @Get('get-by-id/:id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        const admins = await this.adminsService.getDetail(parseInt(id))
        return SUCCESS(200, admins, SUCCESSFULLY, 1, response)
    }

    //create
    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    @ApiResponse({ status: 201, description: CREATE_SUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async create(@Req() request: Request, @Res() response: Response): Promise<any> {
        const admin = await this.adminsService.create(request.body);
        return SUCCESS(200, admin, CREATE_SUCCESS, 1, response)
    }

    //update
    @UseGuards(AuthGuard('jwt'))
    @Put('update/:id')
    @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async update(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        const admin = await this.adminsService.update(parseInt(id), request.body);

        return SUCCESS(200, admin, UPDATE_SUCCESS, 1, response)
    }

    // update status isdelete 
    @UseGuards(AuthGuard('jwt'))
    @Delete('delete-update/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async deleteUpdate(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.adminsService.deleteUpdate(parseInt(id));

        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }

    //remove in DB
    @UseGuards(AuthGuard('jwt'))
    @Delete('delete/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async delete(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.adminsService.delete(parseInt(id));

        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('admin')
    @ApiResponse({ status: 200, description: RESPONE_SUCCESS })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getLoggedInAdmin(@CurrentUser() admin: Admins): Promise<Admins> {
        return admin;
    }
}