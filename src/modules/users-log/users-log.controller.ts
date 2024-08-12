import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  Delete,
} from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import {
  BAD_REQUEST,
  UNAUTHORIZED,
  SUCCESSFULLY,
  DELETESUCCESS,
} from 'utils/constants';
import { AuthGuard } from '@nestjs/passport';
import { UsersLogService } from './users-log.service';
import { SUCCESS } from 'constants/response';

@Controller('api/users-log')
export class UsersLogController {
  constructor(private readonly usersLogService: UsersLogService) {}

  //get detail
  @UseGuards(AuthGuard('jwt'))
  @Get('getdetail')
  async getDetail(@Req() request, @Res() response: Response): Promise<any> {
    let log = await this.usersLogService.getById(request.user.id);

    return SUCCESS(200, log, SUCCESSFULLY, 1, response);
  }

  //create
  @UseGuards(AuthGuard('jwt'))
  @Post('create-update-user-log')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async createUpdate(@Req() request, @Res() response: Response): Promise<any> {
    const user_id = request.user.id;
    const userLog = await this.usersLogService.createUpdate(
      user_id,
      request.body.status_arr,
      request.body.created_at,
    );

    return SUCCESS(200, userLog, SUCCESSFULLY, 1, response);
  }

  //remove in DB
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete-user')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async delete(@Req() request, @Res() response: Response): Promise<any> {
    const userId = request.user.id;
    await this.usersLogService.deleteUser(parseInt(userId));

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }
}
