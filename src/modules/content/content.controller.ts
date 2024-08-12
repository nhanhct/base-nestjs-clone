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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { Admins, AdminsService } from './../admins';
import {
  UPDATE_SUCCESS,
  BAD_REQUEST,
  CREATE_SUCCESS,
  UNAUTHORIZED,
  SUCCESSFULLY,
  DELETESUCCESS,
} from 'utils/constants';
import { ContentService } from './content.service';
import { SUCCESS, SUCCESS_PAGING } from 'constants/response';

@Controller('api/content')
export class ContentsController {
  constructor(private readonly contentsService: ContentService) { }
  @UseGuards(AuthGuard('jwt'))
  @Get('all-content-app')
  async getAllContentApp(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const data = await this.contentsService.countNumberLikeContent(request.user.id);
    return SUCCESS(200, data, SUCCESSFULLY, 1, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('all-action-app')
  async getAllActionApp(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const data = await this.contentsService.countNumberLikeAction(request.user.id);
    return SUCCESS(200, data, SUCCESSFULLY, 1, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('detail-content-app/:id')
  async getDetailContentApp(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const data = await this.contentsService.getDetailContent(parseInt(id), request.user.id);
    return SUCCESS(200, data, SUCCESSFULLY, 1, response);
  }

  // detail
  @Get('detail-content/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getDetailUser(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const content = await this.contentsService.getById(parseInt(id));
    return SUCCESS(200, content, SUCCESSFULLY, 1, response);
  }

  //get paging
  @Get('all-content-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllContentPaging(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { data, count } = await this.contentsService.getAllContentPaging(
      request.query,
    );
    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 1, count, response);
  }


  //get content count like favorite
  // @UseGuards(AuthGuard('jwt'))
  // @Get('count-number-like')
  // @ApiResponse({ status: 201, description: SUCCESSFULLY })
  // @ApiResponse({ status: 400, description: BAD_REQUEST })
  // @ApiResponse({ status: 401, description: UNAUTHORIZED })
  // async countNumberLike(
  //   @Req() request,
  //   @Res() response: Response,
  // ): Promise<any> {
  //   const data = await this.contentsService.countNumberLike(request.user.id);
  //   return SUCCESS(200, data, SUCCESSFULLY, null, response);
  // }

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
    const content = await this.contentsService.create(request.body);

    return SUCCESS(200, content, CREATE_SUCCESS, 1, response);
  }

  //update
  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async update(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const content = await this.contentsService.update(parseInt(id), request.body);

    return SUCCESS(200, content, UPDATE_SUCCESS, 1, response);
  }

  // update status isdelete
  // @UseGuards(AuthGuard('jwt'))
  @Delete('delete-update/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async deleteUpdate(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    await this.contentsService.deleteUpdate(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }

  //remove in DB
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async delete(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    await this.contentsService.delete(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response);
  }
}
