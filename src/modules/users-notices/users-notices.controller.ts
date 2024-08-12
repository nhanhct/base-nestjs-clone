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
import { ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { Admins } from './../admins';
import {
  UPDATE_SUCCESS,
  BAD_REQUEST,
  CREATE_SUCCESS,
  UNAUTHORIZED,
  SUCCESSFULLY,
  DELETESUCCESS,
} from 'utils/constants';
import { UsersNoticesService } from './users-notices.service';
import { SUCCESS, SUCCESS_PAGING } from 'constants/response';

@Controller('api/users-notices')
export class UsersNoticesController {
  constructor(private readonly userNoticesService: UsersNoticesService) { }

  // detail
  @Get('detail-users-notices/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getDetailNotices(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const userNotice = await this.userNoticesService.getById(parseInt(id));

    return SUCCESS(200, userNotice, SUCCESSFULLY, 1, response);
  }

  // detail
  @Get('list-by-notices/:notice_id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getListByNotices(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.notice_id;
    const userNotices = await this.userNoticesService.getByNoticeId(parseInt(id));

    return SUCCESS(200, userNotices, SUCCESSFULLY, 1, response);
  }

  // detail
  @Get('list-by-users/:user_id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getListByUsers(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.user_id;
    const userNotices = await this.userNoticesService.getListByUser(parseInt(id));

    return SUCCESS(200, userNotices, SUCCESSFULLY, 1, response);
  }

  //get paging
  @Get('all-users-notices-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllNoticePaging(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { data, count } =
      await this.userNoticesService.getAllUsersNoticesPaging(request.query);

    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response);
  }

  //create
  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async create(
    @CurrentUser() admin: Admins,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    request.body.create_by = admin.id;
    const userNotice = await this.userNoticesService.create(request.body);

    return SUCCESS(200, userNotice, CREATE_SUCCESS, 1, response);
  }
  @Post('testpost-notice')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async testpostcreate(
    @CurrentUser() admin: Admins,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const userNotice = await this.userNoticesService.createtest();

    return SUCCESS(200, userNotice, CREATE_SUCCESS, 1, response);
  }
  //update
  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async update(
    @CurrentUser() admin: Admins,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    request.body.create_by = admin.id;
    const userNotice = await this.userNoticesService.update(parseInt(id), request.body);

    return SUCCESS(200, userNotice, UPDATE_SUCCESS, 1, response);
  }

  //update viewed
  @UseGuards(AuthGuard('jwt'))
  @Put('update-is-views/:id')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateViewed(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const userNotice = await this.userNoticesService.updateIsView(parseInt(id));

    return SUCCESS(200, userNotice, UPDATE_SUCCESS, 1, response);
  }

  // update status isdelete
  // @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async deleteUpdate(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    await this.userNoticesService.delete(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }

  // send notice when sleep 10h
  @UseGuards(AuthGuard('jwt'))
  @Post('send-notice10h')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async sendNotice10h(@Req() request, @Res() response: Response): Promise<any> {
    const id = request.user.id;
    await this.userNoticesService.sendNotice10h(parseInt(id));

    return SUCCESS(200, null, SUCCESSFULLY, 1, response);
  }
}
