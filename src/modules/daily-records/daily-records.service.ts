import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, IsNull, Like, Raw, Repository } from 'typeorm';
import { DailyRecords } from './daily-records.entity';
import { CommonCodesService } from './../common-codes/common-codes.service';
import { DailyRecordsFillableFields } from './daily-records.entity';
import { User, UsersService } from 'modules/user';
import { DailyRecordsDetailService } from 'modules/daily-records-detail/daily-records-detail.service';
import { COMMON_CODE, DateHelper, RECORDS_TYPE, RECORDS_TYPE_ID } from 'utils';
import { UsersFeedback, UsersFeedbackService } from 'modules/user-feedback';
import { DailyRecordsHistoryService } from 'modules/daily-records-history';
import { UserFeedbackDetail, UserFeedbackDetailService } from 'modules/user-feedback-detail';
import { DailyRecordsDetail, StatusDailyRecord } from 'modules/daily-records-detail/daily-records-detail.entity';
import { CommonCodes } from 'modules/common-codes';

@Injectable()
export class DailyRecordsService {
  constructor(
    @InjectRepository(DailyRecords)
    private readonly dailyRecordRepository: Repository<DailyRecords>,
    private readonly commonCodesService: CommonCodesService,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => DailyRecordsDetailService))
    private readonly dailyRecordDetailService: DailyRecordsDetailService,
    @Inject(forwardRef(() => UsersFeedbackService))
    private readonly usersFeedbackService: UsersFeedbackService,
    private readonly dailyRecordsHistoryService: DailyRecordsHistoryService,
    private readonly userFeedbackDetailService: UserFeedbackDetailService,
  ) { }

  async getAllDailyPaging(query) {
    const take = parseInt(query.limit) || 10;
    const skip = parseInt(query.page) || 0;
    const keyword = query.keyword || '';
    const gubun = query.gubun || '';
    const fromDt = query.fromDt;
    const toDt = query.toDt;
    let user = new User();
    if (gubun == 'user_name') {
      user = await this.userService.getByLikeUserName(keyword);
    }
    let recordDate = Raw(
      (alias) => `${alias} >= :date and ${alias} <= :date1`,
      {
        date: fromDt != '' ? fromDt : '2020-11-15',
        date1: toDt != '' ? toDt : '2900-11-15',
      },
    );
    let [result, total] = await this.dailyRecordRepository.findAndCount({
      where:
        gubun == 'user_name' && fromDt == '' && toDt == ''
          ? {
            user_id: user != undefined ? user.id : 0,
            record_date: recordDate,
            deleted_at: IsNull(),
          }
          : gubun == 'user_name' && fromDt != '' && toDt != ''
            ? {
              user_id: user != undefined ? user.id : 0,
              record_date: recordDate,
              deleted_at: IsNull(),
            }
            : gubun == 'user_name' && fromDt != '' && toDt == ''
              ? {
                user_id: user != undefined ? user.id : 0,
                record_date: recordDate,
                deleted_at: IsNull(),
              }
              : fromDt != '' && toDt != ''
                ? {
                  record_date: recordDate,
                  deleted_at: IsNull(),
                }
                : fromDt != '' && toDt == ''
                  ? {
                    record_date: recordDate,
                    deleted_at: IsNull(),
                  }
                  : { deleted_at: IsNull() },
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

  async getById(id: number) {
    const dailyRecords = await this.dailyRecordRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'user',
        'details',
        'details.daily_type',
        'details.time',
        'details.type',
      ],
    });
    return dailyRecords;
  }

  //get by user id
  async getByUserId(userId: number) {
    const dailyRecordList = await this.dailyRecordRepository.find({
      where: {
        user_id: userId,
      },
      relations: [
        'user',
        'details',
        'details.daily_type',
        'details.time',
        'details.type',
      ],
    });

    return dailyRecordList;
  }

  async getInfoByDate(userId: number, date: Date) {
    console.log("date", DateHelper.getDate(date));

    const dailyRecords = await this.dailyRecordRepository.findOne({
      where: {
        user_id: userId,
        record_date: DateHelper.getDate(date),
        deleted_at: null,
      },
      order: {
        created_at: 'DESC',
      },
      relations: [
        'user',
        'details',
        'details.daily_type',
        'details.time',
        'details.type',
      ],
    });
    return dailyRecords;
  }

  async getListByDate(date: Date) {
    const dailyRecordsList = await this.dailyRecordRepository.find({
      where: {
        record_date: DateHelper.getDate(date),
        deleted_at: null,
      },
      order: {
        created_at: 'DESC',
      },
    });
    return dailyRecordsList;
  }

  //get all 
  async getAllList() {
    const dailyRecordsList = await this.dailyRecordRepository.find({
      where: {
        deleted_at: null,
      },
    });
    return dailyRecordsList;
  }

  //get info by day and type
  async getInfoByDailyType(userId: number, date: Date, dailyTypeId: number) {
    const dailyRecords = await this.dailyRecordRepository.findOne({
      where: {
        user_id: userId,
        record_date: DateHelper.getDate(date),
      },
      order: {
        created_at: 'DESC',
      },
      relations: ['user'],
    });
    if (dailyRecords)
      dailyRecords.details = await this.dailyRecordDetailService.getByDailyRecordType(dailyRecords.id, dailyTypeId);

    return dailyRecords;
  }

  async updateByUser(userId: number, model: DailyRecordsFillableFields) {
    const dailyRecords = await this.dailyRecordRepository.findOne({ user_id: userId, record_date: DateHelper.getDate(model.record_date) });
    if (dailyRecords) {
      dailyRecords.updated_at = new Date();
      if (await this.dailyRecordRepository.save(dailyRecords)) {
        //
        const details = await this.dailyRecordDetailService.updateRange(dailyRecords, model.details);
        await this.dailyRecordsHistoryService.createByDailyRecords(dailyRecords, details);

        //update user feedback
        var dailyRecordsTypeId = (
          await this.commonCodesService.getCodeByParentCode(COMMON_CODE.RecordsType)
        ).find((m) => m.code == RECORDS_TYPE.Daily)?.id;
        var usersFeedback = await this.usersFeedbackService.getByRecord(dailyRecords.id, dailyRecordsTypeId);
        if (usersFeedback) {
          await this.userFeedbackDetailService.deletedRange(usersFeedback);
          await this.addFeedbackDetail(usersFeedback);
        } else {
          var usersFeedback = new UsersFeedback();
          usersFeedback.records_id = dailyRecords.id;
          usersFeedback.feedback_date = dailyRecords.record_date;
          usersFeedback.user_id = dailyRecords.user_id;
          usersFeedback.records_type_id = dailyRecordsTypeId;
          if (await this.usersFeedbackService.create(usersFeedback)) {
            await this.addFeedbackDetail(usersFeedback);
          }
        }
      }
      return dailyRecords;
    } else {
      const dailyRecordsNew = new DailyRecords();
      dailyRecordsNew.user_id = userId;
      dailyRecordsNew.record_date = DateHelper.getDate(model.record_date);
      dailyRecordsNew.created_at = new Date();
      if (await this.dailyRecordRepository.save(dailyRecordsNew)) {
        const details = await this.dailyRecordDetailService.createRange(dailyRecordsNew, model.details);
        await this.dailyRecordsHistoryService.createByDailyRecords(dailyRecordsNew, details);
        //add user feedback
        var dailyRecordsTypeId = (
          await this.commonCodesService.getCodeByParentCode(COMMON_CODE.RecordsType)
        ).find((m) => m.code == RECORDS_TYPE.Daily)?.id;

        var usersFeedback = new UsersFeedback();
        usersFeedback.records_id = dailyRecordsNew.id;
        usersFeedback.feedback_date = dailyRecordsNew.record_date;
        usersFeedback.user_id = dailyRecordsNew.user_id;
        usersFeedback.records_type_id = dailyRecordsTypeId;
        if (await this.usersFeedbackService.create(usersFeedback)) {
          await this.addFeedbackDetail(usersFeedback);
        }
      }

      return dailyRecordsNew;
    }
  }

  //add user feedback detail
  async addFeedbackDetail(usersFeedback: UsersFeedback): Promise<void> {
    const dailyRecordsDetails = await this.dailyRecordDetailService.getByDailyRecordId(usersFeedback.records_id);
    if (dailyRecordsDetails.length > 0) {
      for (let index = 0; index < dailyRecordsDetails.length; index++) {
        const element = dailyRecordsDetails[index];
        const statusDailyRecord = await this.dailyRecordDetailService.getDailyRecordStatusByUser(usersFeedback.user_id, element.created_at)

        var detail = new UserFeedbackDetail();
        detail.records_detail_id = element.id;
        if (statusDailyRecord != undefined) {
          if (element.daily_type_id == RECORDS_TYPE_ID.Alcohol)
            detail.status = statusDailyRecord?.alcolStatus;
          if (element.daily_type_id == RECORDS_TYPE_ID.Caffeine)
            detail.status = statusDailyRecord?.cafeStatus;
          if (element.daily_type_id == RECORDS_TYPE_ID.Nap)
            detail.status = statusDailyRecord?.napStatus;
          if (element.daily_type_id == RECORDS_TYPE_ID.Stress)
            detail.status = statusDailyRecord?.stressStatus;
        } else
          detail.status = null;

        detail.created_at = new Date();
        detail.userFeedback = usersFeedback;

        //add feedback detail
        await this.userFeedbackDetailService.create(detail);
      }
    }
  }

  async deleteUpdate(id: number) {
    const post = await this.dailyRecordRepository
      .createQueryBuilder()
      .update(DailyRecords)
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
  async deleteDetailByUser(userId: number, model: DailyRecordsFillableFields) {
    const dailyRecords = await this.dailyRecordRepository.findOne({
      user_id: userId,
      record_date: DateHelper.getDate(model.record_date),
    });
    if (dailyRecords) {
      dailyRecords.updated_at = new Date();
      if (await this.dailyRecordRepository.save(dailyRecords)) {
        await this.dailyRecordDetailService.deleteRange(
          dailyRecords,
          model.details,
        );
        var dailyRecordsTypeId = (
          await this.commonCodesService.getCodeByParentCode(
            COMMON_CODE.RecordsType,
          )
        ).find((m) => m.code == RECORDS_TYPE.Daily)?.id;
        var usersFeedback = await this.usersFeedbackService.getByRecord(
          dailyRecords.id,
          dailyRecordsTypeId,
        );
        if (usersFeedback) {
          await this.userFeedbackDetailService.deletedRange(usersFeedback);
          await this.addFeedbackDetail(usersFeedback);
        }
      }
    }
  }
  async getDailyRecordByUserFeedback(userFeedbackId: number) {
    return await createQueryBuilder(UserFeedbackDetail, 'd')
      .leftJoin(DailyRecordsDetail, 'daily', 'daily.id = d.records_detail_id')
      .leftJoin(
        CommonCodes,
        'daily_type',
        'daily_type.id = daily.daily_type_id',
      )
      .leftJoin(CommonCodes, 'time', 'time.id = daily.time_id')
      .leftJoin(CommonCodes, 'type', 'type.id = daily.type_id')
      .leftJoin(CommonCodes, 'st', 'st.id = d.status')
      .where('d.user_feedback_id = :user_feedback_id', {
        user_feedback_id: userFeedbackId,
      })
      .select([
        'd.user_feedback_id as user_feedback_id',
        'd.records_detail_id as records_detail_id',
        'd.status as status',
        'daily.daily_type_id as daily_type_id',
        'daily.time_id as time_id',
        'daily.type_id as type_id',
        'daily.vol as vol',
        'daily_type.name as daily_type_name',
        'time.name as time_name',
        'type.name as type_name',
        'st.name as status_name',
        'st.value as status_value',
      ])
      .getRawMany();
  }
}
