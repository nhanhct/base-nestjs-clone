import { Body, Controller, Get, Post, UseGuards, Req, Res, NotFoundException, Put, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonCodesService } from '.';
import { Request, Response } from "express";
import {
  UPDATE_SUCCESS,
  BAD_REQUEST,
  CREATE_SUCCESS,
  UNAUTHORIZED,
  SUCCESSFULLY,
  DELETESUCCESS
} from 'utils/constants';
import { SUCCESS } from 'constants/response';

@Controller('api/common-code')
//@ApiTags('authentication')
export class CommonCodeController {
  constructor(
    private readonly commonCodeService: CommonCodesService,
  ) { }

  @Get('get-parent-codes')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getParentCode(@Req() request: Request, @Res() response: Response): Promise<any> {
    const commonCode = await this.commonCodeService.getParentCode(null)

    return SUCCESS(200, commonCode, SUCCESSFULLY, 1, response)
  }

  @Get('get-parent-id/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getParentId(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.id
    const commonCode = await this.commonCodeService.getParentId(parseInt(id), null)

    return SUCCESS(200, commonCode, SUCCESSFULLY, 1, response)
  }

  @Post('create')
  @ApiResponse({ status: 201, description: CREATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async create(@Req() request: Request, @Res() response: Response): Promise<any> {
    const commonCode = await this.commonCodeService.create(request.body);

    return SUCCESS(200, commonCode, CREATE_SUCCESS, 1, response)
  }

  @Put('update/:id')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async update(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.id
    const commonCode = await this.commonCodeService.update(parseInt(id), request.body);

    return SUCCESS(200, commonCode, UPDATE_SUCCESS, 1, response)
  }

  //update status
  @Put('update-status/:id')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateStatus(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.id
    const commonCode = await this.commonCodeService.updateStatus(parseInt(id), request.body);

    return SUCCESS(200, commonCode, UPDATE_SUCCESS, 1, response)
  }

  // update status isdelete 
  @Delete('delete-update/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async deleteUpdate(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.id
    await this.commonCodeService.deleteUpdate(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response)
  }

  //remove in DB
  @Delete('delete/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async delete(@Req() request: Request, @Res() response: Response): Promise<any> {
    const id = request.params.id
    await this.commonCodeService.delete(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 1, response)
  }
}
