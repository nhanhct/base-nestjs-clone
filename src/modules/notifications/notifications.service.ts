import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UsersService } from 'modules/user';
import { IsNull, Like, Repository } from 'typeorm';
import { Notifications } from '.';
// import { Notices, NoticesFillableFields } from '.';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notifications)
        private readonly notificationsRepository: Repository<Notifications>,
        private readonly userService: UsersService, // @Inject(forwardRef(() => FcmTokenService)) // private readonly fcmTokenService: FcmTokenService,
    ) { }

    //get all
    async getAllNotifyPaging(query) {
        const take = parseInt(query.limit) || 10;
        const skip = parseInt(query.page) || 0;
        const keyword = query.keyword || '';
        const notice_type = query.notice_type || '';
        const gubun = query.gubun || '';
        let user = new User();
        if (gubun == 'nick_name') {
            user = await this.userService.getByLikeUserName(keyword);
        }

        const [result, total] = await this.notificationsRepository.findAndCount({
            where: [
                gubun == 'nick_name' && notice_type != ''
                    ? {
                        user_id: user != undefined ? user.id : 0,
                        notice_type: notice_type,
                        deleted_at: IsNull(),
                    }
                    : gubun == 'nick_name' && notice_type == ''
                        ? {
                            user_id: user != undefined ? user.id : 0,
                            deleted_at: IsNull(),
                        }
                        : gubun == 'title' && notice_type != ''
                            ? {
                                title: gubun == 'title' ? Like('%' + keyword + '%') : '',
                                notice_type: notice_type,
                                deleted_at: IsNull(),
                            }
                            : gubun == 'title' && notice_type == ''
                                ? {
                                    title: gubun == 'title' ? Like('%' + keyword + '%') : '',
                                    deleted_at: IsNull(),
                                }
                                : gubun == 'content' && notice_type != ''
                                    ? {
                                        title: gubun == 'content' ? Like('%' + keyword + '%') : '',
                                        notice_type: notice_type,
                                        deleted_at: IsNull(),
                                    }
                                    : gubun == 'content' && notice_type == ''
                                        ? {
                                            title: gubun == 'content' ? Like('%' + keyword + '%') : '',
                                            deleted_at: IsNull(),
                                        }
                                        : gubun == '' && notice_type != ''
                                            ? {
                                                notice_type: notice_type,
                                                deleted_at: IsNull(),
                                            }
                                            : { deleted_at: IsNull() },
            ],

            relations: ['user'],
            order: { id: 'DESC' },
            take: take,
            skip: skip * take,
        });
        return {
            data: result,
            count: total,
        };
    }

    //create
    async create(notifications: Notifications) {
        notifications.created_at = new Date();
        notifications.is_viewed = false;

        return await this.notificationsRepository.save(notifications);
    }

    async getByUserIdAndToday(user_id, notice_type) {
        return await this.notificationsRepository
            .createQueryBuilder()
            .where(
                'user_id = :userId and DATE_FORMAT(created_at,"%Y-%m-%d")= DATE_FORMAT(:date,"%Y-%m-%d") and notice_type = :notice_type',
                { userId: user_id, date: new Date(), notice_type: notice_type },
            )
            .getOne();
        //return await this.notificationsRepository.save(notifications)
    }

    // update
    async updateViewed(id: number) {
        const post = await this.notificationsRepository
            .createQueryBuilder()
            .update(Notifications)
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

}
