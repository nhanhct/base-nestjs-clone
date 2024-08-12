import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from './';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { User, UsersService } from './../user';
import { Request, Response } from 'express';
import {
  FAIL,
  SUCCESS,
  SUCCESS_DATA,
  SUCCESS_NO_DATA,
  SUCCESS_LOGIN,
  SUCCESS_OTP,
} from 'constants/response';
import { TextHelper } from 'utils/TextHelper';
import { CommonCodesService } from './../common-codes';
import {
  LOGINSUCCESS,
  COMMON_CODE,
  USER_STATUS,
  DELETESUCCESS,
  DELETEFAILED,
  ACCOUNT_NOT_MEMBER,
  SUCCESS_TOKEN,
  BAD_REQUEST,
  LOGIN_SUCCESS,
  UNAUTHORIZED,
  REGISTER_SUCCESS,
  RESPONE_SUCCESS,
  USER_EMAIL_EXIST,
  PHONE_EXIST,
  USERNAME_EXIST,
  EMAIL_EXIST,
  PROFILE_SUCCESS,
  POST_TOKEN_FAILED,
  LOGIN_FAILED,
  CREATE_SUCCESS,
  APPLEID_EXIST
} from 'utils/constants';
import { FcmTokenService } from 'modules/fcm-token';
import { SleepRecordsService } from 'modules/sleep-records';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';
@Controller('api/auth')
//@ApiTags('authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly fcmTokenService: FcmTokenService,
    private readonly commonCodeService: CommonCodesService,
    private readonly sleepService: SleepRecordsService,
    private httpService: HttpService,
  ) { }

  @Post('login')
  @ApiResponse({ status: 201, description: LOGIN_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async login(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const user = await this.authService.validateUser(request.body);
    const userStatusInactive = (
      await this.commonCodeService.getCodeByParentCode(COMMON_CODE.UserStatus)
    ).find((m) => m.code == USER_STATUS.Inactive);
    if (
      user.userExist == true &&
      (userStatusInactive == null || user.user.status != userStatusInactive?.id)
    ) {
      const token = await this.authService.createToken(user.user);
      //save fcm db
      //await this.fcmTokenService.postFcmToken(user.user, token.accessToken);

      return SUCCESS(200, token, LOGINSUCCESS, 1, response);
    } else {
      return FAIL(400, null, LOGIN_FAILED, response);
    }
  }

  //login-fcm-token
  @UseGuards(AuthGuard('jwt'))
  @Post('login-fcm-token')
  @ApiResponse({ status: 201, description: LOGIN_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async loginFcmToken(
    @CurrentUser() currentUser: User,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const user = await this.userService.getUserByIdActive(currentUser.id);
    if (user != undefined) {
      const token = request?.body.token;
      //save fcm db
      const fcm = await this.fcmTokenService.postFcmToken(user, token);
      if (fcm) {
        return SUCCESS(200, fcm, LOGINSUCCESS, 1, response);
      } else {
        return FAIL(500, null, POST_TOKEN_FAILED, response);
      }
    }
  }

  //login-fcm-token
  @UseGuards(AuthGuard('jwt'))
  @Post('logout-fcm-token')
  @ApiResponse({ status: 201, description: LOGIN_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async logoutFcmToken(
    @CurrentUser() currentUser: User,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const success = await this.fcmTokenService.deleteFcm(
      currentUser.id,
      request.body.token,
    );
    if (success) {
      return SUCCESS(200, null, DELETESUCCESS, 1, response);
    } else return FAIL(500, null, DELETEFAILED, response);
  }

  //
  @Post('login-admin')
  @ApiResponse({ status: 201, description: LOGIN_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async loginAdmin(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const admin = await this.authService.validateAdmin(request.body);
    const token = await this.authService.createTokenAdmin(admin);

    return SUCCESS(200, token, LOGINSUCCESS, 200, response);
  }

  @Post('register')
  @ApiResponse({ status: 201, description: REGISTER_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async register(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const success = await this.userService.create(request.body);
    if (success === 1) {
      return FAIL(202, null, '이미 등록된 이메일 입니다.', response);
    } else if (success === 2) {
      return FAIL(202, null, '이미 등록된 전화번호 입니다.', response);
    } else {
      const token = await this.authService.createToken(request.body);
      return SUCCESS(200, token, 'Register Successfully', 1, response);
    }
  }

  @Get('check-phone')
  async checkPhone(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { phone } = request.query;
    const checkPhone = await this.userService.checkPhone(phone.toString());
    if (checkPhone == true) {
      return FAIL(202, null, PHONE_EXIST, response);
    } else {
      return SUCCESS(200, null, 'Ok', 1, response);
    }
  }
  @Get('check-username')
  async checkUserName(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { phone } = request.query;
    const checkUserName = await this.userService.checkUserName(
      phone.toString(),
    );
    if (checkUserName == true) {
      return FAIL(202, null, USERNAME_EXIST, response);
    } else {
      return SUCCESS(200, null, 'Ok', 1, response);
    }
  }
  @Get('check-email')
  async checkEmail(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const { phone } = request.query;
    const checkEmail = await this.userService.checkEmail(phone.toString());
    if (checkEmail == true) {
      return FAIL(202, null, EMAIL_EXIST, response);
    } else {
      return SUCCESS(200, null, 'Ok', 1, response);
    }
  }
  @Post('social-register')
  @ApiResponse({ status: 201, description: REGISTER_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  async socialRegister(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const body = request.body;
    const success = await this.userService.createSocial(body);
    if (success === 2) {
      return FAIL(202, null, '이미 등록된 이메일 입니다.', response);
    } else {
      const token = await this.authService.createToken(request.body);
      return response.status(200).json({ token, success: true });
    }
  }

  @Post('social-login')
  @ApiResponse({ status: 201, description: REGISTER_SUCCESS })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  async socialLogin(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const data = await this.authService.validateUserSocial(request.body);
    if (data.user) {
      const token = await this.authService.createToken(data.user);

      return response
        .status(200)
        .json({ data: token, success: 1, message: LOGINSUCCESS });
    } else {
      return response
        .status(200)
        .json({ data: null, success: 0, message: ACCOUNT_NOT_MEMBER });
    }
  }

  @Post('send-otp')
  async sendOtp(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    let otpCode = TextHelper.randomNumericCharacters(6);
    const data = await this.authService.sendSMSAxios(request, otpCode);
    console.log(data);
    if (data.result_code == '1') {
      return response
        .status(200)
        .json({ success: 1, message: SUCCESS_TOKEN, otp: otpCode });
    } else {
      return response.status(200).json({ success: 0, message: data.message });
    }
  }

  @Post('test-auto-cal')
  async sendMesSleep(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
   await this.sleepService.getSumTimeSleep()
    return response.status(200).json({ success: 0, message: 0 });
  }

  @Post('test-auto-send')
  async sendMessned(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    console.log("request.params.fcm_token",request.body.fcm_token)
    let rs= await this.fcmTokenService.sendNotificationToOneUser(request.body.fcm_token,"Test","Test send android",10)
    return response.status(200).json({ success: 0, message: rs.data });
  }
  

  @Post('send-otp-findpass')
  async sendOtpFindPass(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    let otpCode = TextHelper.randomNumericCharacters(6);
    const data = await this.authService.sendFindPassWord(request, otpCode);
    if (data == false) {
      return response.status(200).json({ success: 0, message: data.message });
    }
    console.log('data.=====', data);
    console.log('data.result_code=====', data.result_code);
    if (data.result_code == '1') {
      return response
        .status(200)
        .json({ success: 1, message: SUCCESS_TOKEN, otp: otpCode });
    } else {
      return response.status(200).json({ success: 0, message: data.message });
    }
  }

  //@ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiResponse({ status: 200, description: RESPONE_SUCCESS })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getLoggedInUser(@Req() req, @Res() response: Response): Promise<any> {
    const id = req.user.id;
    let user = await this.userService.getUserById(id);
    if (user != undefined) {
      return SUCCESS(200, user, PROFILE_SUCCESS, 200, response);
    } else return FAIL(401, null, UNAUTHORIZED, response);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin')
  @ApiResponse({ status: 200, description: RESPONE_SUCCESS })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async getLoggedInAdmin(
    @Req() request,
    @Res() response: Response,
  ): Promise<any> {
    return SUCCESS(200, request.user, LOGINSUCCESS, 200, response);
  }


}
