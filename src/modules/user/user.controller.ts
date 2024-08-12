import {
  Controller,
  Get, Post,
  UseGuards, Req,
  Res, Put,
  Delete, UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { User, UsersService } from './../user';
import { UserPasswordHistory, UserPasswordHistoryService } from './../user-password-history';
import { CommonCodesService } from './../common-codes';
import { Request, Response } from 'express';
import { UploadImage, TextHelper, DateHelper, Hash } from '../../utils';
import {
  UPDATE_SUCCESS, BAD_REQUEST, UNAUTHORIZED, SUCCESSFULLY, DELETESUCCESS, UPDATE_FAILED,
  COMMON_CODE, USER_STATUS, CURRENT_PASSWORD_REQUIRED, NEW_PASSWORD_REQUIRED,
  PASSWORD_SAME, CURRENT_PASSWORD_INCORRECT, PASSWORD_CHARACTERS, PASSWORD_SPECIAL_CHARACTERS, PASSWORD_MORE2_CHARACTERS,
  NEW_PASSWORD_NOT_OLD_PASSWORD, CHANGE_PASSWORD_SUCCESSFULLY, CHANGE_PASSWORD_FAILED, USER_NOT_EXIST, USER_SETTING_TYPE_NULL,
  REGISTER_SUCCESS, RESPONE_SUCCESS
} from 'utils/constants';
import { AuthGuard } from '@nestjs/passport';
import { SUCCESS, SUCCESS_NO_DATA, SUCCESS_PAGING } from 'constants/response';

@Controller('api/user')
//@ApiTags('authentication')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly userPasswordHistoryService: UserPasswordHistoryService,
    private readonly commonCodeService: CommonCodesService,
  ) { }

  @Get('all-user')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllUser(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const user = await this.userService.getAllUser();

    return SUCCESS(200, user, SUCCESSFULLY, 200, response)

  }

  @Get('all-user-paging')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getAllUserPaging(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { data, count } = await this.userService.getAllUserPaging(request.query);

    return SUCCESS_PAGING(200, data, SUCCESSFULLY, 200, count, response)
  }

  // detail
  @Get('detail-user/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getDetailUser(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const user = await this.userService.get(parseInt(id));

    return SUCCESS(200, user, SUCCESSFULLY, 200, response)

  }

  @Get('check-expiry-date-password/:id')
  @ApiResponse({ status: 201, description: SUCCESSFULLY })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async checkExpiryDatePassword(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    const checkExpiryDate = await this.userService.checkExpiryDatePassword(
      parseInt(id),
    );

    return SUCCESS(200, checkExpiryDate, SUCCESSFULLY, 200, response)

  }

  @Post('register')
  @ApiResponse({ status: 201, description: REGISTER_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async register(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const user = await this.userService.create(request.body);
    //const token= await this.authService.createToken(request.body.email);

    return SUCCESS(200, user, SUCCESSFULLY, 200, response)
  }

  //update
  @Put('update/:id')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async update(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const file = new UploadImage();
    const id = request.params.id;
    const user = await this.userService.update(parseInt(id), request.body);
    if (user == false) {
      return SUCCESS(405, false, UPDATE_FAILED, 405, response)
    }

    return SUCCESS(200, user, UPDATE_SUCCESS, 200, response)
  }

  //update profile
  @UseGuards(AuthGuard('jwt'))
  @Put('update-profile')
  @ApiResponse({ status: 201, description: UPDATE_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async updateProfile(@Req() request, @Res() response: Response): Promise<any> {
    const currentUser = request.user;
    const user = await this.userService.updateProfile(
      parseInt(currentUser.id),
      request.body,
    );
    if (user == false) {
      return response.status(405).json({ data: false, message: UPDATE_FAILED });
    }
    const userDetail = await this.userService.get(currentUser.id);
    if (userDetail == undefined) {
      return SUCCESS(405, false, UPDATE_FAILED, 405, response)
    }

    return SUCCESS(200, userDetail, UPDATE_SUCCESS, 200, response)
  }

  // update status isdelete
  @Delete('delete-update/:id')
  @ApiResponse({ status: 201, description: DELETESUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async deleteUpdate(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const id = request.params.id;
    await this.userService.deleteUpdate(parseInt(id));

    return SUCCESS(200, null, DELETESUCCESS, 200, response)
  }

  @ApiBearerAuth()
  //@UseGuards(AuthGuard())
  @Get('me')
  @ApiResponse({ status: 200, description: RESPONE_SUCCESS })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getLoggedInUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    let image = new UploadImage();
    const res = await image.upload(file);
    return { data: res, success: true };
  }

  //change pass
  @UseGuards(AuthGuard('jwt'))
  @Put('change-password')
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async changePassword(
    @CurrentUser() currentUser: User,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const oldPassword = request.body.old_pass;
    const newPassword = request.body.new_pass;

    if (!oldPassword)
      return SUCCESS_NO_DATA(200, CURRENT_PASSWORD_REQUIRED, response)

    if (!newPassword)
      return SUCCESS_NO_DATA(200, NEW_PASSWORD_REQUIRED, response)

    if (oldPassword == newPassword)
      return SUCCESS_NO_DATA(200, PASSWORD_SAME, response)

    // check old password
    var user = await this.userService.get(currentUser.id);
    if (!user || !Hash.compare(oldPassword, user.password))
      return SUCCESS_NO_DATA(200, CURRENT_PASSWORD_INCORRECT, response)

    let checkContainsUppercase = TextHelper.containsUppercase(newPassword);
    let checkContainsNumber = TextHelper.containsNumber(newPassword);
    let checkContainsSpecial = TextHelper.containsSpecial(newPassword);
    // Composed of at least 10 characters or more by combining 2 or more types of alphabets, numbers, and special characters,
    // or at least 8 characters in length by combining 3 or more types
    if (newPassword.length < 8)
      return SUCCESS_NO_DATA(200, PASSWORD_CHARACTERS, response)

    else if (newPassword.length >= 8 && newPassword.length < 10) {
      if (!checkContainsUppercase || !checkContainsNumber || !checkContainsSpecial)
        return SUCCESS_NO_DATA(200, PASSWORD_SPECIAL_CHARACTERS, response)
    } else {
      let numType = 0;
      if (checkContainsUppercase) numType++;
      if (checkContainsNumber) numType++;
      if (checkContainsSpecial) numType++;
      if (numType < 2)
        return SUCCESS_NO_DATA(200, PASSWORD_MORE2_CHARACTERS, response)
    }
    // check exists Password
    const lastPassword = await this.userPasswordHistoryService.getLastPasswordByUserPassword(user.id, newPassword);
    if (lastPassword)
      return SUCCESS_NO_DATA(200, NEW_PASSWORD_NOT_OLD_PASSWORD, response)

    const userUpdate = await this.userService.updatePassword(user.id, newPassword);
    if (userUpdate) {
      var userInfo = await this.userService.get(currentUser.id);
      var passwordHistory = new UserPasswordHistory();
      passwordHistory.user_id = user.id;
      passwordHistory.password = userInfo.password;
      passwordHistory.expiry_date = DateHelper.addMonths(new Date(), 6); // add 6 month
      if (await this.userPasswordHistoryService.create(passwordHistory))
        return SUCCESS_NO_DATA(200, CHANGE_PASSWORD_SUCCESSFULLY, response)
    }

    return SUCCESS_NO_DATA(200, CHANGE_PASSWORD_FAILED, response)
  }

  //change pass user
  @UseGuards(AuthGuard('jwt'))
  @Put('user-change-password')
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async userChangePassword(
    @CurrentUser() currentUser: User,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const newPassword = request.body.new_pass;
    if (!newPassword)
      return SUCCESS_NO_DATA(200, NEW_PASSWORD_REQUIRED, response)

    var user = await this.userService.get(currentUser.id);

    const lastPassword = await this.userPasswordHistoryService.getLastPasswordByUserPassword(user.id, newPassword);
    if (lastPassword) {
      return SUCCESS_NO_DATA(200, NEW_PASSWORD_NOT_OLD_PASSWORD, response)
    }
    const userUpdate = await this.userService.updatePassword(user.id, newPassword);
    if (userUpdate) {
      var userInfo = await this.userService.get(currentUser.id);
      var passwordHistory = new UserPasswordHistory();
      passwordHistory.user_id = user.id;
      passwordHistory.password = userInfo.password;
      passwordHistory.expiry_date = DateHelper.addMonths(new Date(), 6); // add 6 month
      if (await this.userPasswordHistoryService.create(passwordHistory))
        return SUCCESS_NO_DATA(200, CHANGE_PASSWORD_SUCCESSFULLY, response)
    }

    return SUCCESS_NO_DATA(200, CHANGE_PASSWORD_FAILED, response)
  }

  //change pass by email
  @Put('change-password-byemail')
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async changePasswordByEmail(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const newPassword = request.body.new_pass;
    if (!newPassword)
      return SUCCESS_NO_DATA(200, NEW_PASSWORD_REQUIRED, response)

    var user = await this.userService.getByPhone(request.body.phone);
    if (!user)
      return SUCCESS_NO_DATA(200, USER_NOT_EXIST, response)

    let checkContainsUppercase = TextHelper.containsUppercase(newPassword);
    let checkContainsNumber = TextHelper.containsNumber(newPassword);
    let checkContainsSpecial = TextHelper.containsSpecial(newPassword);
    // Composed of at least 10 characters or more by combining 2 or more types of alphabets, numbers, and special characters,
    // or at least 8 characters in length by combining 3 or more types
    if (newPassword.length < 8)
      return SUCCESS_NO_DATA(200, PASSWORD_CHARACTERS, response)

    else if (newPassword.length >= 8 && newPassword.length < 10) {
      if (!checkContainsUppercase || !checkContainsNumber || !checkContainsSpecial)
        return SUCCESS_NO_DATA(200, PASSWORD_SPECIAL_CHARACTERS, response)

    } else {
      let numType = 0;
      if (checkContainsUppercase) numType++;
      if (checkContainsNumber) numType++;
      if (checkContainsSpecial) numType++;
      if (numType < 2)
        return SUCCESS_NO_DATA(200, PASSWORD_MORE2_CHARACTERS, response)
    }

    // check exists Password
    const lastPassword = await this.userPasswordHistoryService.getLastPasswordByUserPassword(user.id, newPassword);
    if (lastPassword)
      return SUCCESS_NO_DATA(200, NEW_PASSWORD_NOT_OLD_PASSWORD, response)

    const userUpdate = await this.userService.updatePasswordByEmail(user.email, newPassword);
    if (userUpdate) {
      var userInfo = await this.userService.getByEmail(userUpdate.email);
      var passwordHistory = new UserPasswordHistory();
      passwordHistory.user_id = user.id;
      passwordHistory.password = userInfo.password;
      passwordHistory.expiry_date = DateHelper.addMonths(new Date(), 6); // add 6 month

      if (await this.userPasswordHistoryService.create(passwordHistory))
        return SUCCESS_NO_DATA(200, CHANGE_PASSWORD_SUCCESSFULLY, response)
    }

    return SUCCESS_NO_DATA(200, CHANGE_PASSWORD_FAILED, response)
  }

  //update type user
  @UseGuards(AuthGuard('jwt'))
  @Put('setting-update')
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async putSetting(@Req() request, @Res() response: Response): Promise<any> {
    const currentUser = request.user;
    const settingType = request.body.setting_type;
    if (settingType == null)
      return SUCCESS_NO_DATA(200, USER_SETTING_TYPE_NULL, response)
    await this.userService.updateSettingType(currentUser.id, settingType);

    return SUCCESS_NO_DATA(200, UPDATE_SUCCESS, response)
  }

  //update status
  @UseGuards(AuthGuard('jwt'))
  @Put('inactive')
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async putInactive(@Req() request, @Res() response: Response): Promise<any> {
    const currentUser = request.user;
    const userStatusInactive = (
      await this.commonCodeService.getCodeByParentCode(COMMON_CODE.UserStatus)
    ).find((m) => m.code == USER_STATUS.Inactive);
    if (userStatusInactive) {
      await this.userService.updateStatus(currentUser.id, userStatusInactive?.id);
      return SUCCESS_NO_DATA(200, UPDATE_SUCCESS, response)
    }

    return SUCCESS_NO_DATA(200, UPDATE_FAILED, response)
  }
}
