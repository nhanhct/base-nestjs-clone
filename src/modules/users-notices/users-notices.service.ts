import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmTokenService } from 'modules/fcm-token';
import { Notices, NoticesService } from 'modules/notices';
import { User, UsersService } from 'modules/user';
import { IsNull, Repository } from 'typeorm';
import { UsersNotices, UsersNoticesFillableFields } from '.';
import { Cron } from '@nestjs/schedule';
import { SleepRecordsService } from 'modules/sleep-records';
import {
    NOTIFICATION_TYPE_MARKETING_ALARM,
    NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION,
    NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_CONTENT,
    NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_TITLE,
    NOTIFICATION_TYPE_SLEEP_START_ALARM,
    NOTIFICATION_TYPE_SLEEP_START_ALARM_CONTENT,
    NOTIFICATION_TYPE_SLEEP_START_ALARM_TITLE,
} from 'utils';
import { Notifications, NotificationsService } from 'modules/notifications';

@Injectable()
export class UsersNoticesService {
    constructor(
        @InjectRepository(UsersNotices)
        private readonly usersNoticesRepository: Repository<UsersNotices>,
        private readonly userService: UsersService,
        private readonly sleepService: SleepRecordsService,
        private readonly noticeService: NoticesService,
        private readonly fcmTokenService: FcmTokenService,
        private readonly notificationsService: NotificationsService,
    ) { }
    //test cron
    @Cron('1 * * * * *')
    async handleCron() {
        const notification = new Notifications();
        let usersNoticeStart = await this.userService.getUserNoticeStart();
        let arrToken = [];
        // let payload = await this.noticeService.getByType(181);
        usersNoticeStart.map(async (user, index) => {
            let userSleep = await this.sleepService.getByUserIdOne(user.id);
            let date = new Date();
            let sumMinuteDB =
                userSleep?.start_time?.getHours() * 60 +
                userSleep?.start_time?.getMinutes();
            let sumMinuteNow = date.getHours() * 60 + date.getMinutes();
            let totalTimeNotice = sumMinuteDB - sumMinuteNow;
            if (totalTimeNotice >= 0 && sumMinuteNow <= 30) {
                //send notice
                let checkExistNotice = await this.notificationsService.getByUserIdAndToday(
                    user.id,
                    NOTIFICATION_TYPE_SLEEP_START_ALARM,
                );
                if (!checkExistNotice) {
                    let fcmUser = await this.fcmTokenService.getUserById(user.id);
                    arrToken.push(fcmUser?.token);
                    notification.user_id = user?.id;
                    notification.target_id = userSleep?.id;
                    notification.title = NOTIFICATION_TYPE_SLEEP_START_ALARM_TITLE;//payload.title;
                    notification.content = NOTIFICATION_TYPE_SLEEP_START_ALARM_CONTENT;//payload.content;
                    notification.notice_type = NOTIFICATION_TYPE_SLEEP_START_ALARM; //before 30 minute ago

                    if (notification != undefined) {
                        await this.notificationsService.create(notification);
                    }
                }
            }
        });
        if (arrToken.length > 0) {
            this.fcmTokenService.sendNotification(
                arrToken,
                NOTIFICATION_TYPE_SLEEP_START_ALARM_TITLE,
                NOTIFICATION_TYPE_SLEEP_START_ALARM_CONTENT,
                0,
            );
        }
    }

    //send notice when sleep more 10h
    async sendNotice10h(user_id) {
        let fcmData = await this.fcmTokenService.getUserById(user_id);
        let usersNoticeEnd = await this.userService.getUserById(user_id);
        // let payload = await this.noticeService.getByType(182);
        if (usersNoticeEnd.is_notice_end) {
            let checkExistNotice =
                await this.notificationsService.getByUserIdAndToday(user_id, NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION);

            if (!checkExistNotice) {
                this.fcmTokenService.sendNotificationToOneUser(
                    fcmData?.token,
                    NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_TITLE,
                    NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_CONTENT,
                    usersNoticeEnd?.id,
                );
                //add notifications to db
                const notification = new Notifications();
                notification.user_id = user_id;
                notification.target_id = 0;
                notification.title = NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_TITLE;//payload.title;
                notification.content = NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_CONTENT;//payload.content;
                notification.notice_type = NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION; //send notice when sleep more 10h

                if (notification != undefined) {
                    await this.notificationsService.create(notification);
                }
            }
        }
    }

    //getById
    async getById(id: number) {
        const noticeUser = await this.usersNoticesRepository.findOne({
            where: {
                id: id,
                deleted_at: IsNull(),
            },
            relations: ['user', 'notice'],
        });

        //update views
        this.updateIsView(id);
        return noticeUser;
    }

    //getByNoticeId
    async getByNoticeId(notice_id: number) {
        const userNotices = await this.usersNoticesRepository.find({
            where: {
                notice_id: notice_id,
                deleted_at: IsNull(),
            },
            relations: ['user', 'notice'],
        });

        return userNotices;
    }

    //getByUserId
    async getByUserId(user_id: number) {
        const userNotices = await this.usersNoticesRepository.findOne({
            where: {
                user_id: user_id,
                deleted_at: IsNull(),
            },
        });

        return userNotices;
    }

    //getByUserIdAndNoticeID
    async getByUserIdAndNoticeID(user_id: number, notice_id: number) {
        const userNotices = await this.usersNoticesRepository.findOne({
            where: {
                user_id: user_id,
                notice_id: notice_id,
                deleted_at: IsNull(),
            },
        });

        return userNotices;
    }

    //getByUserId
    async getListByUser(user_id: number) {
        const userNotices = await this.usersNoticesRepository.find({
            where: {
                user_id: user_id,
                deleted_at: IsNull(),
            },
            relations: ['notice'],
        });

        return userNotices;
    }

    //get all
    async getAllUsersNoticesPaging(query) {
        const take = parseInt(query.limit) || 10;
        const skip = parseInt(query.page) || 0;
        const keyword = query.keyword || '';
        const gubun = query.gubun || '';
        let user = new User();
        let notice = new Notices();
        if (gubun == 'user_name') {
            user = await this.userService.getByLikeUserName(keyword);
        }

        if (gubun == 'notice') {
            notice = await this.noticeService.getByLikeTitle(keyword);
        }
        const [result, total] = await this.usersNoticesRepository.findAndCount({
            where: [
                gubun == 'user_name'
                    ? {
                        user_id: user != undefined ? user.id : 0,
                        deleted_at: IsNull(),
                    }
                    : gubun == 'notice'
                        ? {
                            notice_id: notice != undefined ? notice.id : 0,
                            deleted_at: IsNull(),
                        }
                        : { deleted_at: IsNull() },
            ],

            relations: ['user', 'notice'],
            order: { id: 'DESC' },
            take: take,
            skip: skip * take,
        });
        return {
            data: result,
            count: total,
        };
    }

    //delete in DB
    async delete(id: number) {
        return await this.usersNoticesRepository.delete(id);
    }

    //create
    async create(userNotices: UsersNotices) {
        if (userNotices != null) {
            const listUserNotices = Array<UsersNotices>();
            const listUserNoticesNew = Array<UsersNotices>();
            if (userNotices.user_list.length > 0) {
                console.log(
                    'userNotices.user_list.length',
                    userNotices.user_list.length,
                );
                for (var i = 0; i < userNotices.user_list.length; i++) {
                    const notice = await this.noticeService.getById(
                        userNotices.notice_id,
                    );
                    const check = await this.getByUserIdAndNoticeID(
                        userNotices.user_list[i],
                        userNotices.notice_id,
                    );
                    if (check == undefined) {
                        let userNotice = new UsersNotices();
                        userNotice.created_at = new Date();
                        userNotice.is_viewed = false;
                        userNotice.user_id = userNotices.user_list[i];
                        userNotice.notice_id = userNotices.notice_id;
                        console.log('i', i, userNotices.user_list[i]);
                        await this.usersNoticesRepository.save(userNotice);
                        listUserNotices.push(userNotice);
                        listUserNoticesNew.push(userNotice);

                        //add notifications
                        const notification = new Notifications();
                        notification.user_id = userNotices.user_list[i];
                        notification.target_id = userNotices.notice_id;
                        notification.title = notice?.title;
                        notification.content = notice?.content;
                        notification.notice_type = NOTIFICATION_TYPE_MARKETING_ALARM;
                        await this.notificationsService.create(notification);
                    } else {
                        let userNotice = new UsersNotices();
                        userNotice.created_at = new Date();
                        userNotice.is_viewed = false;
                        userNotice.user_id = userNotices.user_list[i];
                        userNotice.notice_id = userNotices.notice_id;
                        listUserNoticesNew.push(userNotice);
                    }
                }
                if (listUserNoticesNew.length > 0) {
                    const usersNoticesList = await this.getByNoticeId(
                        userNotices.notice_id,
                    );
                    if (usersNoticesList.length > 0) {
                        for (var i = 0; i < usersNoticesList.length; i++) {
                            await this.delete(usersNoticesList[i].id);
                        }
                    }
                    for (var i = 0; i < listUserNoticesNew.length; i++) {
                        let userNoticeModel = new UsersNotices();
                        userNoticeModel.created_at = new Date();
                        userNoticeModel.is_viewed = false;
                        userNoticeModel.user_id = listUserNoticesNew[i].user_id;
                        userNoticeModel.notice_id = listUserNoticesNew[i].notice_id;
                        await this.usersNoticesRepository.save(userNoticeModel);
                    }
                }
            } else {
                // delete all by notice_id
                if (userNotices.notice_id != undefined) {
                    const usersNotices = await this.getByNoticeId(userNotices.notice_id);
                    if (usersNotices.length > 0) {
                        for (var i = 0; i < usersNotices.length; i++) {
                            await this.delete(usersNotices[i].id);
                        }
                    }
                }
            }

            console.log('listUserNotices.length', listUserNotices.length);
            console.log('listUserNoticesNew.length', listUserNoticesNew.length);

            //send notifi new user
            if (listUserNotices.length > 0) {
                await this.fcmTokenService.sendNotificationsToUserGroup(
                    listUserNotices,
                );
            }

            return listUserNotices;
        }
    }
    async createtest() {
        await this.fcmTokenService.sendNotificationToUser(
            [
                'd-48laY1TK--_RGVJcgWWN:APA91bEL5Ui7fMpHUGHZVMtyTsLRg0lYsevU23z1CQooi3qJj_XG1gLDPFVTrqnFylkLsdFgb_2ICkpYg2exDBioGySnQEjqMc4dqr6WGM5n92hqAC2p_GXUpUIrlrFtN8D1br5BCrvL',
                'cXiJwFN6SVKrgG-11BJRZc:APA91bGCe9vW6yruyhBVRnClTKRkI6Yy873UtoUOmEDuR9sshZT7D3oL7K9h9f4YV7TMiCUP2DAUPMPq0N54ialbFNcZL0nQGCN9l3Z7yZXgd3l3qSEg9mzEq7P8P0CzR_jsj08Aw_2t',
            ],
            'Nhan test',
            'test post notice',
        );
    }

    //update
    async update(id: number, postData: UsersNoticesFillableFields) {
        const post = await this.usersNoticesRepository
            .createQueryBuilder()
            .update(UsersNotices)
            .set({
                user_id: postData.user_id,
                notice_id: postData.notice_id,
                is_viewed: postData.is_viewed,
                updated_at: new Date(),
            })
            .where('id = :id', { id })
            .execute();
        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }

    // update viewed
    async updateIsView(id: number) {
        const post = await this.usersNoticesRepository
            .createQueryBuilder()
            .update(UsersNotices)
            .set({
                is_viewed: true,
            })
            .where('id = :id', { id })
            .execute();
        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }

    //delete update
    async deleteUpdate(id: number) {
        const post = await this.usersNoticesRepository
            .createQueryBuilder()
            .update(UsersNotices)
            .set({
                deleted_at: new Date(),
            })
            .where('id = :id', { id })
            .execute();
        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }
}
