import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SUCCESS } from 'constants/response';
import { SUCCESSFULLY, BAD_REQUEST, UNAUTHORIZED } from 'utils/constants';
import { Request, Response } from "express";
import { FavoritiesService } from '.';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';

@Controller('api/favorities')
export class FavoritiesController {
  constructor(
    private readonly favoritiesService: FavoritiesService,
  ) { }
  @Get('get-all')
  async getAll(@Req() request: Request, @Res() response: Response): Promise<any> {
    let fcm = await this.favoritiesService.getListByUser()

    return SUCCESS(200, fcm, SUCCESSFULLY, 1, response)
  }


  //get by user id
  @Get('get-by-user-id/:user_id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getDetail(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const user_id = request.params.user_id;
    let favorite = await this.favoritiesService.getByUser(parseInt(user_id));

    return SUCCESS(200, favorite, SUCCESSFULLY, 1, response);
  }

  //create-delete
  @UseGuards(AuthGuard('jwt'))
  @Post('create-delete')
  async createOrDetlete(@Req() request, @Res() response: Response): Promise<any> {
    let fcm = await this.favoritiesService.createOrDelete(request.body.content_id, request.user.id)

    return SUCCESS(200, fcm, SUCCESSFULLY, 1, response)
  }
}
