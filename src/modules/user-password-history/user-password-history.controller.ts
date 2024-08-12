import { Controller, Delete, Get, Req, Res } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { BAD_REQUEST, DELETESUCCESS, SUCCESSFULLY, UNAUTHORIZED } from "utils";
import { Request, Response } from "express";
import { SUCCESS } from "constants/response";
import { UserPasswordHistoryService } from ".";

@Controller('api/user-password-history')
export class UserPasswordHistoryController {
    constructor(
        private readonly userPasswordService: UserPasswordHistoryService,
    ) { }

    //get by id
    @Get('get-by-user/:user_id')
    @ApiResponse({ status: 201, description: SUCCESSFULLY })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async getDetail(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.user_id
        const userPassword = await this.userPasswordService.getPasswordByUser(parseInt(id))

        return SUCCESS(200, userPassword, SUCCESSFULLY, 1, response)
    }

    //remove in DB
    // @UseGuards(AuthGuard('jwt'))
    @Delete('delete/:id')
    @ApiResponse({ status: 201, description: DELETESUCCESS })
    @ApiResponse({ status: 400, description: BAD_REQUEST })
    @ApiResponse({ status: 401, description: UNAUTHORIZED })
    async delete(@Req() request: Request, @Res() response: Response): Promise<any> {
        const id = request.params.id
        await this.userPasswordService.delete(parseInt(id));

        return SUCCESS(200, null, DELETESUCCESS, 1, response)
    }
}