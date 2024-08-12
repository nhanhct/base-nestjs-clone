import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { int } from 'aws-sdk/clients/datapipeline';
import { time } from 'console';
import { CommonCodes, CommonCodesService } from 'modules/common-codes';
import {
  UserPasswordHistory,
  UserPasswordHistoryService,
} from 'modules/user-password-history';
import moment from 'moment';
import { IsNull, Like, Repository } from 'typeorm';
import { DateHelper } from 'utils';

import { User, UserFillableFields } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commonCodesService: CommonCodesService,
    private readonly userPasswordHistoryService: UserPasswordHistoryService,
  ) { }

  async get(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: [
        'status_name',
        'state_mind_name',
        'physical_condition_name',
        'propensity_information_name',
        'kind_person_name',
      ],
    });

    return user;
  }
  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id, status: 2, deleted_at: null },
    });

    return user;
  }
  async getUserByIdActive(id: number) {
    return this.userRepository.findOne({
      where: { id: id, status: 2, deleted_at: null },
    });
  }
  async getAllUser() {
    return this.userRepository.find({
      where: { deleted_at: IsNull() },
      order: { id: 'DESC' },
    });
  }
  //get user notice start is true
  async getUserNoticeStart() {
    return this.userRepository.find({
      where: { is_notice_start: true },
    });
  }
  //get user notice end is true
  async getUserNoticeEnd() {
    return this.userRepository.find({
      where: { is_notice_end: true },
    });
  }

  async getAllUserPaging(query) {
    const take = parseInt(query.limit) || 10;
    const skip = parseInt(query.page) || 0;
    const status = query.status || '';
    const keyword = query.keyword || '';
    const gubun = query.gubun || '';

    let [result, total] = await this.userRepository.findAndCount({
      where:
        gubun == 'nick_name' && status != ''
          ? {
            nick_name: gubun == 'nick_name' ? Like('%' + keyword + '%') : '',
            status: status,
            deleted_at: IsNull(),
          }
          : gubun == 'nick_name' && status == ''
            ? {
              nick_name: gubun == 'nick_name' ? Like('%' + keyword + '%') : '',
              deleted_at: IsNull(),
            }
            : gubun == 'email' && status != ''
              ? {
                email: gubun == 'email' ? Like('%' + keyword + '%') : '',
                status: status,
                deleted_at: IsNull(),
              }
              : gubun == 'email' && status == ''
                ? {
                  email: gubun == 'email' ? Like('%' + keyword + '%') : '',
                  deleted_at: IsNull(),
                }
                : gubun == 'phone_no' && status != ''
                  ? {
                    phone_no: gubun == 'phone_no' ? Like('%' + keyword + '%') : '',
                    status: status,
                    deleted_at: IsNull(),
                  }
                  : gubun == 'phone_no' && status == ''
                    ? {
                      phone_no: gubun == 'phone_no' ? Like('%' + keyword + '%') : '',
                      deleted_at: IsNull(),
                    }
                    : gubun == '' && status != ''
                      ? {
                        status: status,
                        deleted_at: IsNull(),
                      }
                      : { deleted_at: IsNull() },
      relations: ['status_name'],
      order: { id: 'DESC' },
      take: take,
      skip: skip * take, // skip==0?0:skip
    });
    return {
      data: result,
      count: total,
    };
  }

  async getByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async getByPhone(phone: string) {
    return await this.userRepository.findOne({ phone_no: phone });
  }
  async getByPhoneStatus(phone: string) {
    return await this.userRepository.findOne({
      phone_no: phone,
      status: 2,
      social_type: null,
    });
  }

  async getByUserName(user_name: string) {
    return await this.userRepository.findOne({ user_name: user_name });
  }

  async getBySocialInfo(social_type: string, social_id: string) {
    return await this.userRepository.findOne({
      social_type: social_type,
      social_id: social_id,
      status: 2,
    });
  }

  async checkPhone(phone: string) {
    const checkPhone = await this.getByPhone(phone);
    if (checkPhone) {
      return true;
    }
    return false;
  }
  async checkPhoneStatus(phone: string) {
    const checkPhone = await this.getByPhoneStatus(phone);
    if (checkPhone) {
      return true;
    }
    return false;
  }
  async getByLikeUserName(user_name: string) {
    return await this.userRepository.findOne({
      user_name: Like('%' + user_name + '%'),
    });
  }

  async checkEmail(email: string) {
    const checkEmail = await this.getByEmail(email);
    if (checkEmail) {
      return true;
    }
    return false;
  }

  async checkUserName(userName: string) {
    const checkUserName = await this.checkUserName(userName);
    if (checkUserName) {
      return true;
    }
    return false;
  }

  //
  async checkExpiryDatePassword(user_id: int) {
    const checkUserPassHistory =
      await this.userPasswordHistoryService.getLastPasswordByUser(user_id);
    if (checkUserPassHistory.length > 0) {
      const date = checkUserPassHistory[0].expiry_date.getDate();
      const month = checkUserPassHistory[0].expiry_date.getMonth() + 1;
      const year = checkUserPassHistory[0].expiry_date.getFullYear();
      if (
        date <= new Date().getDate() &&
        month <= new Date().getMonth() + 1 &&
        year <= new Date().getFullYear()
      ) {
        return true;
      }
    }

    return false;
  }

  async create(body) {
    const checkEmail = await this.getByEmail(body.email);
    const checkPhone = await this.getByPhone(body.phone_no);

    if (checkEmail) {
      return 1;
    } else if (checkPhone) {
      return 2;
    }
    body.status = 2;
    body.is_ads = false;
    body.is_notice_start = false;
    body.is_notice_end = false;
    body.created_at = new Date();
    body.id_device = false;
    const user = await this.userRepository.save(body);

    //create password history
    if (user) {
      var passwordHistory = new UserPasswordHistory();
      passwordHistory.user_id = user.id;
      passwordHistory.password = user.password;
      passwordHistory.created_at = new Date();
      passwordHistory.expiry_date = DateHelper.addMonths(new Date(), 3); // add 3 month

      await this.userPasswordHistoryService.create(passwordHistory);
    }

    return true;
  }

  async createSocial(body) {
    const checkPhone = await this.getByPhone(body.phone_no);
    // const checkEmail = await this.getByEmail(body.email);

    if (checkPhone) {
      return 2;
    }
    body.status = 2;
    body.is_ads = false;
    body.is_notice_start = false;
    body.is_notice_end = false;
    body.created_at = new Date();
    await this.userRepository.save(body);

    return true;
  }

  async add(body) {
    body.created_at = new Date();
    var result = await this.userRepository.save(body);
    return result;
  }

  //update
  async update(id: number, postData: UserFillableFields) {
    console.log('id', id);

    let checkEmail = new User();
    let checkUserName = new User();
    let checkPhone = new User();
    const user = await this.get(id);
    if (user.id > 0) {
      if (user.email != postData.email) {
        checkEmail = await this.getByEmail(postData.email);
        if (checkEmail) {
          return false;
        }
      }
      if (user.user_name != postData.user_name) {
        checkUserName = await this.getByUserName(postData.user_name);
        if (checkUserName) {
          return false;
        }
      }
      if (user.phone_no != postData.phone_no) {
        checkPhone = await this.getByPhone(postData.phone_no);
        if (checkPhone) {
          return false;
        }
      }
    }

    const post = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        user_name: postData.user_name,
        nick_name: postData.nick_name,
        email: postData.email,
        phone_no: postData.phone_no,
        birthday: postData.birthday,
        status: postData.status,
        avatar: postData.avatar,
        gender: postData.gender,
        state_mind: postData.state_mind,
        physical_condition: postData.physical_condition,
        propensity_information: postData.propensity_information,
        kind_person: postData.kind_person,
        updated_at: new Date(),
      })
      .where('id = :id', { id })
      .execute();
    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  //update Profile
  async updateProfile(id: number, postData: UserFillableFields) {
    let checkPhone = new User();
    const user = await this.get(id);
    if (user.id > 0) {
      if (user.phone_no != postData.phone_no) {
        checkPhone = await this.getByPhone(postData.phone_no);
        if (checkPhone) {
          return false;
        }
      }
    }

    const post = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        nick_name: postData.nick_name,
        phone_no: postData.phone_no,
        email: user.email,
        status: user.status,
        avatar: user.avatar,
        birthday: postData.birthday,
        gender: postData.gender,
        updated_at: new Date(),
      })
      .where('id = :id', { id })
      .execute();
    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }
  //  //delete in DB
  //  async delete(id: number) {
  //   return await this.userRepository.delete(id);
  // }

  //delete update
  async deleteUpdate(id: number) {
    const post = await this.userRepository
      .createQueryBuilder()
      .update(User)
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

  async updatePassword1(id: number, password: string) {
    const user = await this.userRepository.findOne({ id });
    if (user) {
      user.password = password;
      user.updated_at = new Date();
      return await this.userRepository.save(user);
    }

    return null;
  }

  async updateStartTimeNotice(id: number, time: number) {
    const user = await this.userRepository.findOne({ id });
    if (user) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          start_time_notice: time,
          updated_at: new Date(),
        })
        .where('id = :id', { id })
        .execute();
      return
      // user.start_time_notice = time;
      // user.updated_at = new Date();
      // return await this.userRepository.save(user);
    }
    return null;
  }
  async updateEndTimeNotice(id: number, time: number) {
    const user = await this.userRepository.findOne({ id });
    if (user) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          end_time_notice: time,
          updated_at: new Date(),
        })
        .where('id = :id', { id })
        .execute();
      return
      // user.end_time_notice = time;
      // user.updated_at = new Date();
      // return await this.userRepository.save(user);
    }
    return null;
  }


  async updatePasswordByEmail1(email: string, password: string) {
    const user = await this.userRepository.findOne({ email: email });
    if (user) {
      user.password = password;
      user.updated_at = new Date();
      return await this.userRepository.save(user);
    }

    return null;
  }

  async updatePassword(id: number, password: string) {
    const user = await this.userRepository.findOne({ id });
    if (user) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          password: password,
          updated_at: new Date(),
        })
        .where('id = :id', { id })
        .execute();
    }

    return true;
  }

  async updatePasswordByEmail(email: string, password: string) {
    const user = await this.userRepository.findOne({ email });
    if (user) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          password: password,
          updated_at: new Date(),
        })
        .where('email = :email', { email })
        .execute();
    }

    return user;
  }

  async updateSettingType(id: number, settingType: string) {
    const user = await this.userRepository.findOne({ id });
    if (user) {
      switch (settingType) {
        case 'is_notice_start':
          await this.userRepository
            .createQueryBuilder()
            .update(User)
            .set({
              is_notice_start: !user.is_notice_start,
              updated_at: new Date(),
            })
            .where('id = :id', { id })
            .execute();
          break;
        case 'is_notice_end':
          await this.userRepository
            .createQueryBuilder()
            .update(User)
            .set({
              is_notice_end: !user.is_notice_end,
              updated_at: new Date(),
            })
            .where('id = :id', { id })
            .execute();
          break;
        case 'is_ads':
          await this.userRepository
            .createQueryBuilder()
            .update(User)
            .set({
              is_ads: !user.is_ads,
              updated_at: new Date(),
            })
            .where('id = :id', { id })
            .execute();
          break;
        case 'is_device':
          await this.userRepository
            .createQueryBuilder()
            .update(User)
            .set({
              is_device: !user.is_device,
              updated_at: new Date(),
            })
            .where('id = :id', { id })
            .execute();
          break;
      }
    }
  }

  async updateStatus(id: number, status: number) {
    const user = await this.userRepository.findOne({ id });
    if (user) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          status: status,
          updated_at: new Date(),
        })
        .where('id = :id', { id })
        .execute();
    }

    return null;
  }
}
