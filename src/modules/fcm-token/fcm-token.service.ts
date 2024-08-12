import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notices, NoticesService } from 'modules/notices';
import { User, UsersService } from 'modules/user';
import { UsersNotices } from 'modules/users-notices';
import { Repository } from 'typeorm';
import { FcmToken } from '.';
// import { FcmService } from '../../services/fcm.service';
// import { messaging } from './firebaseInit';
import axios from 'axios';
import { ConfigService } from './../config';

@Injectable()
export class FcmTokenService {
  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
    private readonly noticeService: NoticesService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) { }

  async getListByUser(userId: number) {
    return await this.fcmTokenRepository.find({
      where: {
        user_id: userId,
      },
      relations: ['user'],
    });
  }
  async getUserById(userId: number) {
    return await this.fcmTokenRepository.findOne({
      where: {
        user_id: userId,
      },
    });
  }

  async getAllbyUserID(userId: number) {
    return await this.fcmTokenRepository.find({
      where: {
        user_id: userId,
      },
    });
  }
  //check token
  async checkToken(token: string) {
    const tokenModel = await this.fcmTokenRepository.findOne({ token });

    return tokenModel;
  }

  //check token by user
  async checkTokenUser(userId: number, token: string) {
    const tokenModel = await this.fcmTokenRepository.findOne({
      where: {
        user_id: userId,
        token: token,
      },
    });

    return tokenModel;
  }

  //create fcm-token
  async postFcmToken(user: User, token: string) {
    const tokenModel = new FcmToken();
    if (token != null) {
      tokenModel.user_id = user?.id;
      tokenModel.role = 'user';
      tokenModel.token = token;
      tokenModel.created_at = new Date();

      const checkToken = await this.checkTokenUser(user.id, token);

      if (checkToken != undefined) {
        if (checkToken.token != '') {
          return false;
        }
      }

      await this.fcmTokenRepository.save(tokenModel);
    }

    return tokenModel;
  }

  //delete in DB
  async delete(id: number) {
    return await this.fcmTokenRepository.delete(id);
  }

  //delete in DB
  async deleteFcm(id: number, fcm: string) {
    const checkToken = await this.checkTokenUser(id, fcm);
    if (checkToken != undefined) {
      if (checkToken.token != '') {
        await this.fcmTokenRepository.delete(checkToken.id);
        return true;
      }
    }

    return false;
  }

  //send notice
  async sendNotificationsToUserGroup(noticeUserList: Array<UsersNotices>) {
    console.log('noticeUserList', noticeUserList);
    if (noticeUserList.length > 0) {
      for (let index = 0; index < noticeUserList.length; index++) {
        if (noticeUserList[index].deleted_at == null) {
          const tokenRes = await this.getListByUser(
            noticeUserList[index].user_id,
          );
          console.log('tokenRes', tokenRes);
          var notice = await this.noticeService.getById(
            noticeUserList[index].notice_id,
          );
          const array = Array<string>();

          if (notice != null) {
            noticeUserList[index].title = notice.title;
            noticeUserList[index].content = notice.content;
          }
          for (let i = 0; i < noticeUserList.length; i++) {
            if (tokenRes[i] != undefined) array.push(tokenRes[i]?.token);
          }

          // Get user
          const user = await this.usersService.getUserById(
            noticeUserList[index].user_id,
          );
          if (user?.is_ads && notice.status == 2)
            //active notice
            await this.sendNotification(
              array,
              noticeUserList[index].title,
              noticeUserList[index].content,
              noticeUserList[index].notice_id,
            );
        }
      }
    }
  }

  //send notice all user
  async sendNotificationsToAllUser(userList: Array<User>, notices: Notices) {
    if (userList.length > 0) {
      for (let index = 0; index < userList.length; index++) {
        if (userList[index].deleted_at == null) {
          // Get user
          const array = Array<string>();
          const tokenRes = await this.getListByUser(userList[index].id);
          if (tokenRes.length > 0) {
            for (let i = 0; i < tokenRes.length; i++) {
              array.push(tokenRes[i]?.token);
            }
            await this.sendNotification(
              array,
              notices.title,
              notices.content,
              notices.id,
            );
          }
        }
      }
    }
  }
  async sendNotificationToUser(
    deviceIds: Array<string>,
    title: string,
    content: string, // notice_id: number,
  ) {
    const keyFcm = this.configService.get('FCM_API_KEY');
    const linkFcm = this.configService.get('FCM_LINK');
    try {
      const result = await axios.post(
        linkFcm,
        {
          registration_ids: deviceIds,
          notification: {
            title: title,
            body: content,
            sound: 'default',
          },
          data: {
            title: title,
            body: content,
            targetId: 2082,
          },
          priority: 'high',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${keyFcm}`,
          },
        },
      );
      return result;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async sendNotificationToOneUser(
    deviceIds: string,
    title: string,
    content: string, // notice_id: number,
    target_id: number,
  ) {
    const keyFcm = this.configService.get('FCM_API_KEY');
    const linkFcm = this.configService.get('FCM_LINK');
    try {
      const result = await axios.post(
        linkFcm,
        {
          to: deviceIds,
          notification: {
            title: title,
            body: content,
            sound: 'default',
          },
          data: {
            title: title,
            body: content,
            targetId: target_id,
          },
          priority: 'high',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${keyFcm}`,
          },
        },
      );
      return result;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }
  //sent notice
  async sendNotification(
    deviceIds: Array<string>,
    title: string,
    content: string,
    notice_id: number,
  ) {
    console.log('deviceIds.length', deviceIds.length);
    console.log('deviceIdss', deviceIds);
    const keyFcm = this.configService.get('FCM_API_KEY');
    const linkFcm = this.configService.get('FCM_LINK');
    try {
      const result = axios.post(
        linkFcm,
        {
          registration_ids: deviceIds,
          priority: 'high',
          notification: {
            body: content,
            title: title,
            sound: 'default',
          },
          data: {
            body: content,
            title: title,
            targetId: notice_id,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${keyFcm}`,
          },
        },
      );
      return result;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  // async SendNotificationWithDataV2(fcmTokenArray: Array<String>, title: string, content: string, targetId: number) {
  //   // Create the message to be sent.
  //   const msg = sen{
  //     RegistrationIDs: fcmTokenArray,
  //     Data: map[string]interface{}{
  //       "title":        title,
  //       "text":         content,
  //       "badge":        1,
  //       "targetId":     targetId,
  //     },
  //     Notification: &fcm.Notification{
  //       Title: title,
  //       Body:  content,
  //     },
  //     //Foreground: false,
  //   }

  //   // Create a FCM client to send the message.
  //   client, err := fcm.NewClient(config.Config("FCM_API_KEY"))
  //   if err == nil {
  //     client.Send(msg)
  //   }
  // }
}
