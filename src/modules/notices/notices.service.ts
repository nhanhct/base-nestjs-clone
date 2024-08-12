import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmTokenService } from 'modules/fcm-token';
import { UsersService } from 'modules/user';
import { IsNull, Like, Repository } from 'typeorm';
import { NOTICE_TYPE, STATUS_NOTICE } from 'utils/constants';
import { Notices, NoticesFillableFields } from '.';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notices)
    private readonly noticesRepository: Repository<Notices>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => FcmTokenService))
    private readonly fcmTokenService: FcmTokenService,
  ) { }

  //getById
  async getById(id: number) {
    const notice = await this.noticesRepository.findOne({
      where: {
        id: id,
        deleted_at: IsNull(),
      },
      relations: ['status_name', 'admin_name', 'type_name'],
    });

    return notice;
  }

  async getByLikeTitle(title: string) {
    return await this.noticesRepository.findOne({
      title: Like('%' + title + '%'),
    });
  }

  //get all
  async getAllNotices() {
    const notice = await this.noticesRepository.find({
      where: { deleted_at: IsNull() },
      order: { id: 'DESC' },
    });

    return notice;
  }
  //get all
  async getByType(type_id) {
    const notice = await this.noticesRepository.findOne({
      where: { type: type_id },
    });

    return notice;
  }

  //get all
  async getAllNoticesPaging(query) {
    const take = parseInt(query.limit) || 10;
    const skip = parseInt(query.page) || 0;
    const status = query.status || '';
    const keyword = query.keyword || '';
    const gubun = query.gubun || '';
    const [result, total] = await this.noticesRepository.findAndCount({
      where: [
        gubun == 'title' && status != ''
          ? {
            title: gubun == 'title' ? Like('%' + keyword + '%') : '',
            status: status,
            deleted_at: IsNull(),
          }
          : gubun == 'title' && status == ''
            ? {
              title: gubun == 'title' ? Like('%' + keyword + '%') : '',
              deleted_at: IsNull(),
            }
            : gubun == 'content' && status != ''
              ? {
                content: gubun == 'content' ? Like('%' + keyword + '%') : '',
                status: status,
                deleted_at: IsNull(),
              }
              : gubun == 'content' && status == ''
                ? {
                  content: gubun == 'content' ? Like('%' + keyword + '%') : '',
                  deleted_at: IsNull(),
                }
                : gubun == '' && status != ''
                  ? {
                    status: status,
                    deleted_at: IsNull(),
                  }
                  : { deleted_at: IsNull() },
      ],

      relations: ['status_name', 'type_name'],
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
  async create(notices: Notices) {
    notices.created_at = new Date();
    const noticeModel = await this.noticesRepository.save(notices);
    if (notices.type == NOTICE_TYPE && notices.status == STATUS_NOTICE) {
      // sent all user token
      const userModelList = await this.userService.getAllUser();
      if (userModelList.length > 0) {
        await this.fcmTokenService.sendNotificationsToAllUser(
          userModelList,
          noticeModel,
        );
      }
    }

    return noticeModel;
  }

  //update
  async update(id: number, postData: NoticesFillableFields) {
    const post = await this.noticesRepository
      .createQueryBuilder()
      .update(Notices)
      .set({
        title: postData.title,
        content: postData.content,
        html_content: postData.html_content,
        status: postData.status,
        create_by: postData?.create_by,
        updated_at: new Date(),
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
    const post = await this.noticesRepository
      .createQueryBuilder()
      .update(Notices)
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
