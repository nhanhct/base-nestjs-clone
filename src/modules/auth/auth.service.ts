import { HttpService } from '@nestjs/axios';
import {
  ConsoleLogger,
  Injectable,
  UnauthorizedException,
  Req, Res
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { Admins, AdminsService } from 'modules/admins';
import { lastValueFrom, map } from 'rxjs';
import { Hash } from '../../utils/Hash';
import { ConfigService } from './../config';
import { User, UsersService } from './../user';
import { LoginPayload } from './login.payload';
import { Request } from 'express';
import { DateHelper, END_NOTI_TEXT, START_NOTI_TEXT } from 'utils';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { FcmTokenService } from 'modules/fcm-token';
var FormData = require('form-data');
const aligoapi = require('aligoapi');
const qs = require('querystring');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly adminService: AdminsService,
    private readonly fcmTokenService: FcmTokenService,
    private httpService: HttpService,

  ) { }

  async createToken(user: User) {
    return {
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
      accessToken: this.jwtService.sign({ user: user, role: 'user' }),
      user,
    };
  }

  async createTokenAdmin(admin: Admins) {
    return {
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
      accessToken: this.jwtService.sign({ user: admin, role: 'admin' }),
      admin,
    };
  }

  // @Cron('0 */5 * * * *')
  // async autoSendNoticeTestCron(){
  //   console.log("cron in",new Date())
  // }
  @Cron('0 */5 * * * *')
  async autoSendNotice(){
    let currentTime = DateHelper.changeDateToMinute(new Date())
    let users= await this.userService.getAllUser()
    let arrNoticeStart = []
    let arrNoticeEnd =[]

    await Promise.all(
    users.map(async(user)=>{
      let subStartTime= currentTime-user.start_time_notice
      let subEndTime =currentTime-user.end_time_notice
      let fcmData = await this.fcmTokenService.getAllbyUserID(user.id);
      let fcmTokenByUser = fcmData.map((fcm)=>{
        return fcm.token
      })
      if(subStartTime<=0 && subStartTime >-5 && user.is_notice_start){
        //send start here
       arrNoticeStart.push(...fcmTokenByUser)
      }
      if(subEndTime<=0 && subEndTime >-5 && user.is_notice_end){
        //send end here
        arrNoticeEnd.push(...fcmTokenByUser)
      }
    })
    )
    if (arrNoticeStart.length>0){
      this.fcmTokenService.sendNotification(arrNoticeStart,
        "SomDay",
        START_NOTI_TEXT,
        10)
    }
    if (arrNoticeEnd.length>0){
      this.fcmTokenService.sendNotification(arrNoticeEnd,
        "SomDay",
        END_NOTI_TEXT,
        10)
    }
     
  }

  async sendSMS(phone: string, otp_code: string): Promise<any> {
    // const body={
    //   key:this.configService.get('SMS_SIGN_KEY'),
    //   user_id:this.configService.get('SMS_USERID'),
    //   sender:this.configService.get('SMS_SENDER'),
    //   receiver:phone,
    //   msg:"Somday 회원 가입을 위한 인증번호는 "+"["+otp_code+"]"+"입니다.",
    //   smg_type:this.configService.get('SMS_TYPE'),
    //   title:otp_code,
    //   testmode_yn:"Y",
    //   destination:phone + "|홍길동"
    // }
    const form = new FormData();
    form.append('key', this.configService.get('SMS_SIGN_KEY'));
    form.append('user_id', this.configService.get('SMS_USERID'));
    form.append('sender', this.configService.get('SMS_SENDER'));
    form.append('receiver', phone);
    form.append(
      'msg',
      'Somday 회원 가입을 위한 인증번호는 ' + '[' + otp_code + ']' + '입니다.',
    );
    form.append('smg_type', this.configService.get('SMS_TYPE'));
    form.append('title', otp_code);
    form.append('testmode_yn', 'Y');
    form.append('destination', phone + '|홍길동');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=something',
      },
    };
    console.log('=============', form);
    let res = this.httpService.post(
      'https://apis.aligo.in/send/',
      form,
      config,
    );
    return res;
  }
  async getDataTemp(): Promise<any> {
    let res = await this.httpService.get(
      'https://api.openweathermap.org/data/2.5/weather?lat=10.8353913&lon=106.6698266&appid=aaaa8c0a7db71df5fd6c3c34d1f27182',
    );
    return res;
  }
  async sendSMSAxios(req: Request, otp_code: string): Promise<any> {
    let phone = req.body.phone;
    var AuthData = {
      key: this.configService.get('SMS_SIGN_KEY'),
      user_id: this.configService.get('SMS_USERID'),
    };
    req.body = {
      sender: this.configService.get('SMS_SENDER'),
      receiver: phone,
      msg:
        'Somday 회원 가입을 위한 인증번호는 ' +
        '[' +
        otp_code +
        ']' +
        '입니다.',
      smg_type: this.configService.get('SMS_TYPE'),
      title: otp_code,
      testmode_yn: 'N',
      destination: phone + '|홍길동',
    };
    let res = await aligoapi.send(req, AuthData);
    return res;
  }


//auto send notice

async sendNoticeStartEnd(phone:any, mes: string): Promise<any> {
const requestConfig= {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  params: {
    key: this.configService.get('SMS_SIGN_KEY'),
    user_id: this.configService.get('SMS_USERID'),
    sender: this.configService.get('SMS_SENDER'),
    receiver: phone,
    msg:mes,
    smg_type: this.configService.get('SMS_TYPE'),
    title: "SOMDAY",
    testmode_yn: 'N',
    destination: phone + '|홍길동',
  },
  body:{
    key: this.configService.get('SMS_SIGN_KEY'),
    user_id: this.configService.get('SMS_USERID'),
    sender: this.configService.get('SMS_SENDER'),
    receiver: phone,
    msg:mes,
    smg_type: this.configService.get('SMS_TYPE'),
    title: "SOMDAY",
    testmode_yn: 'N',
    destination: phone + '|홍길동',
  }
};

  let res =await lastValueFrom( this.httpService.post(
    'https://apis.aligo.in/send',
    null,
    requestConfig,
  ).pipe(map((axiosResponse: AxiosResponse)=>{
    return axiosResponse.data;
  }))
  )
  return res;
}

  async sendFindPassWord(req: Request, otp_code: string): Promise<any> {
    let phone = req.body.phone;
    let checkPhoneExist = await this.userService.checkPhoneStatus(phone);
    if (!checkPhoneExist) {
      return false;
    }
    var AuthData = {
      key: this.configService.get('SMS_SIGN_KEY'),
      user_id: this.configService.get('SMS_USERID'),
    };
    req.body = {
      sender: this.configService.get('SMS_SENDER'),
      receiver: phone,
      msg:
        'Somday 비밀번호 찾기를 위한 인증번호는 ' +
        '[' +
        otp_code +
        ']' +
        '입니다.',
      smg_type: this.configService.get('SMS_TYPE'),
      title: otp_code,
      testmode_yn: 'N',
      destination: phone + '|홍길동',
    };
    let res = await aligoapi.send(req, AuthData);
    return res;
  }

  async sendMesWhenSleep(req: Request, otp_code: string): Promise<any> {
    let phone = req.body.phone;
    let checkPhoneExist = await this.userService.checkPhoneStatus(phone);
    if (!checkPhoneExist) {
      return false;
    }
    var AuthData = {
      key: this.configService.get('SMS_SIGN_KEY'),
      user_id: this.configService.get('SMS_USERID'),
    };
    req.body = {
      sender: this.configService.get('SMS_SENDER'),
      receiver: phone,
      msg:
        'Somday 비밀번호 찾기를 위한 인증번호는 ' +
        '[' +
        otp_code +
        ']' +
        '입니다.',
      smg_type: this.configService.get('SMS_TYPE'),
      title: otp_code,
      testmode_yn: 'N',
      destination: phone + '|홍길동',
    };
    let res = await aligoapi.send(req, AuthData);
    return res;
  }

  async validateUser(userBody): Promise<any> {
    console.log('userBody', userBody.email);
    const user = await this.userService.getByEmail(userBody.email);
    if (!user || !Hash.compare(userBody.password, user.password)) {
      //throw new UnauthorizedException('Invalid credentials!');
      return { user: null, userExist: false };
    }
    return { user: user, userExist: true };
  }
  async validateUserSocial(userBody: User): Promise<any> {
    const user = await this.userService.getBySocialInfo(
      userBody.social_type,
      userBody.social_id,
    );
    if (!user) {
      return { user: null, userExist: false };
    }
    return { user: user, userExist: true };
  }

  async validateAdmin(payload: LoginPayload): Promise<any> {
    const admin = await this.adminService.getByName(payload.username);

    if (!admin || !Hash.compare(payload.password, admin.password)) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    return admin;
  }



}
