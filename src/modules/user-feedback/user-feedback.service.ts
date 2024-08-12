import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyRecordsService } from 'modules/daily-records';
import { EnvironmentRecordsService } from 'modules/environment-records';
import { SleepRecordsService } from 'modules/sleep-records';
import { User, UsersService } from 'modules/user';
import { IsNull, Raw, Repository } from 'typeorm';
import { DateHelper, RECORDS_TYPE } from 'utils';

import { UsersFeedback } from './user-feedback.entity';

@Injectable()
export class UsersFeedbackService {

  constructor(
    @InjectRepository(UsersFeedback)
    private readonly userFeedbackRepository: Repository<UsersFeedback>,
    private readonly userService: UsersService,
    private readonly dailyRecordsService: DailyRecordsService,
    private readonly environmentRecordsService: EnvironmentRecordsService,
    @Inject(forwardRef(() => SleepRecordsService))
    private readonly sleepRecordsService: SleepRecordsService,
  ) { }

  //get by id
  async getById(id: number) {
    return this.userFeedbackRepository.findOne({
      where: {
        id: id,
      },
      relations: ["user", "records_type", "details", "details.statusCode"]
    })
  }

  //get detail by date
  async getInfoByDate(userId: number, feedbackDate: Date) {
    const userFeedbacks = await this.userFeedbackRepository.find({
      where: {
        user_id: userId,
        feedback_date: DateHelper.getDate(feedbackDate)
      },
      relations: ["records_type"]
    });
    for (let index = 0; index < userFeedbacks.length; index++) {
      const element = userFeedbacks[index];
      if (element.records_type.code == RECORDS_TYPE.Daily) {
        element.detailViews = await this.dailyRecordsService.getDailyRecordByUserFeedback(element.id);
      }
      else if (element.records_type.code == RECORDS_TYPE.Environment) {
        element.detailViews = await this.environmentRecordsService.getDaiEnvironmentRecordByUserFeedback(element.id);
      }
      else if (element.records_type.code == RECORDS_TYPE.Sleep) {
        element.detailViews = await this.sleepRecordsService.getSleepRecordByUserFeedback(element.id);
      }
    }

    return userFeedbacks;
  }

  //get by user
  async getByUserId(userId: number, feedbackDate: Date) {
    return await this.userFeedbackRepository.findOne({
      where: {
        user_idr: userId,
        feedback_date: feedbackDate
      },
      relations: ["user", "records_type"]
    })
  }

  //get by record, record type
  async getByRecord(recordId: number, recordTypeId: number) {
    return this.userFeedbackRepository.findOne({
      where: {
        records_id: recordId,
        records_type_id: recordTypeId
      }
    });
  }

  //create
  async create(model: UsersFeedback) {
    model.created_at = new Date();
    return await this.userFeedbackRepository.save(model);
  }

  //get paging
  async getAllDailyPaging(query) {
    const take = parseInt(query.limit) || 10
    const skip = parseInt(query.page) || 0
    const keyword = query.keyword || ''
    const gubun = query.gubun || ''
    const fromDt = query.fromDt
    const toDt = query.toDt
    const recordsType = query.recordsType || ''
    let user = new User
    if (gubun == "user_name") {
      user = await this.userService.getByLikeUserName(keyword)
    }

    let feedbackDate = Raw((alias) => `${alias} >= :date and ${alias} <= :date1`, { date: fromDt != '' ? fromDt : '2020-11-15', date1: toDt != '' ? toDt : '2900-11-15' })
    let [result, total] = await this.userFeedbackRepository.findAndCount(
      {
        where: (gubun == "user_name" && fromDt == '' && toDt == '' && recordsType == '') ? {
          user_id: user != undefined ? user.id : 0,
          feedback_date: feedbackDate,
          deleted_at: IsNull()
        } : (gubun == "user_name" && fromDt == '' && toDt == '' && recordsType != '') ? {
          user_id: user != undefined ? user.id : 0,
          feedback_date: feedbackDate,
          records_type_id: recordsType,
          deleted_at: IsNull()
        } : (gubun == "user_name" && fromDt != '' && toDt != '' && recordsType != '') ? {
          user_id: user != undefined ? user.id : 0,
          feedback_date: feedbackDate,
          records_type_id: recordsType,
          deleted_at: IsNull()
        } : (gubun == "user_name" && fromDt != '' && toDt == '' && recordsType != '') ? {
          user_id: user != undefined ? user.id : 0,
          feedback_date: feedbackDate,
          records_type_id: recordsType,
          deleted_at: IsNull()
        } : (fromDt != '' && toDt != '' && recordsType == '') ? {
          feedback_date: feedbackDate,
          deleted_at: IsNull()
        } : (fromDt != '' && toDt == '' && recordsType != '') ? {
          feedback_date: feedbackDate,
          deleted_at: IsNull()
        } : (fromDt == '' && toDt == '' && recordsType != '') ? {
          feedback_date: feedbackDate,
          records_type_id: recordsType,
          deleted_at: IsNull()
        } : { deleted_at: IsNull() },
        relations: ["user", "records_type"],
        order: { id: "DESC" },
        take: take,
        skip: skip * take
      });


    return {
      data: result,
      count: total
    }
  }

  //get list user
  async getListByUser(userId: number) {
    return await this.userFeedbackRepository.find({
      where: {
        user_id: userId
      },
      relations: ["records_type"]
    })
  }

}
