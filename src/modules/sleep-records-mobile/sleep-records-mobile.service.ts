import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Raw, Repository } from 'typeorm';
import {
  SleepRecordsLog,
  SleepRecordsLogFillableFields,
} from 'modules/sleep-records-mobile';
import { SleepRecords, SleepRecordsService } from 'modules/sleep-records';
import { DateHelper } from 'utils';
import { SleepRecordsDetailService } from 'modules/sleep-records-fitbit';
import { User, UsersService } from 'modules/user';

@Injectable()
export class SleepRecordsLogService {
  constructor(
    @InjectRepository(SleepRecordsLog)
    private readonly sleepRecordLogRepository: Repository<SleepRecordsLog>,
    @Inject(forwardRef(() => SleepRecordsService))
    private readonly sleepRecordsService: SleepRecordsService,
    @Inject(forwardRef(() => SleepRecordsDetailService))
    private readonly sleepRecordsDetailService: SleepRecordsDetailService,
    private readonly userService: UsersService, // private readonly usersFeedbackService: UsersFeedbackService,
  ) { }

  //get paging
  async getAllSleepLogPaging(query) {
    const take = parseInt(query.limit) || 10;
    const skip = parseInt(query.page) || 0;
    const keyword = query.keyword || '';
    const gubun = query.gubun || '';
    const fromDt = query.fromDt;
    const toDt = query.toDt;
    console.log(
      'take,skipkeywordgubunfromDttoDt',
      take,
      skip,
      keyword,
      gubun,
      fromDt,
      toDt,
    );
    let user = new User();
    if (gubun == 'user_name') {
      user = await this.userService.getByLikeUserName(keyword);
    }
    let startTime = Raw((alias) => `${alias} >= :date and ${alias} <= :date1`, {
      date: fromDt != '' ? fromDt : '2020-11-15',
      date1: toDt != '' ? toDt : '2900-11-15',
    });
    let [result, total] = await this.sleepRecordLogRepository.findAndCount({
      where:
        gubun == 'user_name' && fromDt == '' && toDt == ''
          ? {
            user_id: user != undefined ? user.id : 0,
            start_time: startTime,
            deleted_at: IsNull(),
          }
          : gubun == 'user_name' && fromDt != '' && toDt != ''
            ? {
              user_id: user != undefined ? user.id : 0,
              start_time: startTime,
              deleted_at: IsNull(),
            }
            : gubun == 'user_name' && fromDt != '' && toDt == ''
              ? {
                user_id: user != undefined ? user.id : 0,
                start_time: startTime,
                deleted_at: IsNull(),
              }
              : fromDt != '' && toDt != ''
                ? { start_time: startTime, deleted_at: IsNull() }
                : fromDt != '' && toDt == ''
                  ? { start_time: startTime, deleted_at: IsNull() }
                  : { deleted_at: IsNull() },
      relations: ['sleepRecords'],
      order: { id: 'DESC' },
      take: take,
      skip: skip * take,
    });
    return {
      data: result,
      count: total,
    };
  }

  async getByDate(userId: number, date: Date) {
    const sleepRecordLogs = await this.sleepRecordLogRepository.find({
      relations: ['sleepRecords'],
      where: {
        sleepRecords: {
          user_id: userId,
          date: DateHelper.getDate(date),
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
    return sleepRecordLogs;
  }

  async getBySleepRecordId(sleepRecordsId: number) {
    const sleepRecordLogs = await this.sleepRecordLogRepository.find({
      where: {
        sleep_records_id: sleepRecordsId,
      },
      order: {
        created_at: 'DESC',
      },
    });
    return sleepRecordLogs;
  }

  async create(userId: number, model: SleepRecordsLogFillableFields) {
    var sleepRecords = await this.sleepRecordsService.getDateNhan(
      userId,
      new Date(),
    );
    if (sleepRecords) {
      const sleepRecordsLog = new SleepRecordsLog();
      sleepRecordsLog.start_time = model.start_time;
      sleepRecordsLog.end_time = model.end_time;
      sleepRecordsLog.created_at = new Date();
      sleepRecordsLog.sleepRecords = sleepRecords;
      sleepRecordsLog.awake_count = model.awake_count;
      sleepRecordsLog.sleep_time = model.sleep_time;
      sleepRecordsLog.url = model.url;
      const resultLog = await this.sleepRecordLogRepository.save(
        sleepRecordsLog,
      );
      // if (resultLog) {
      //     this.sleepRecordsDetailService.updateByLog(sleepRecords, sleepRecordsLog);
      // }
      return resultLog;
    } else {
      const sleepRecordsNew = new SleepRecords();
      sleepRecordsNew.user_id = userId;
      sleepRecordsNew.date = DateHelper.getDate(new Date());
      sleepRecordsNew.created_at = new Date();
      const result = await this.sleepRecordsService.create(sleepRecordsNew);
      if (result) {
        const sleepRecordsLog = new SleepRecordsLog();
        sleepRecordsLog.start_time = model.start_time;
        sleepRecordsLog.end_time = model.end_time;
        sleepRecordsLog.created_at = new Date();
        sleepRecordsLog.sleepRecords = sleepRecordsNew;
        sleepRecordsLog.awake_count = model.awake_count;
        sleepRecordsLog.sleep_time = model.sleep_time;
        sleepRecordsLog.url = model.url;
        const resultLog = await this.sleepRecordLogRepository.save(
          sleepRecordsLog,
        );
        // if (resultLog) {
        //   this.sleepRecordsDetailService.updateByLog(
        //     sleepRecordsNew,
        //     sleepRecordsLog,
        //   );
        // }
        return resultLog;
      }
    }
    return null;
  }

  async getBySleepRecordLogId(Id: number) {
    const sleepRecordLogs = await this.sleepRecordLogRepository.findOne({
      where: {
        id: Id,
      },
      relations: ['sleepRecords', 'sleepRecords.user'],
    });
    return sleepRecordLogs;
  }

  //delete in DB
  async delete(id: number) {
    const sleepRecordsLog = await this.sleepRecordLogRepository.delete(id);

    return sleepRecordsLog;
  }

  //update record mobile
  async update(id: number, url: string) {
    const sleepRecordsLog = new SleepRecordsLog();
    sleepRecordsLog.id = id;
    sleepRecordsLog.url = url;

    const resultLog = await this.sleepRecordLogRepository.createQueryBuilder()
      .update(SleepRecordsLog).set({
        url: url,
        updated_at: new Date()
      })
      .where("id = :id", { id }).execute();
    if (!resultLog) {
      throw new NotFoundException();
    }

    return resultLog;
  }
}
