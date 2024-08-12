import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCodes, CommonCodesService } from 'modules/common-codes';
import { DailyRecords, DailyRecordsService } from 'modules/daily-records';
import { DailyRecordsDetailService } from 'modules/daily-records-detail/daily-records-detail.service';
import {
  EnvironmentRecords,
  EnvironmentRecordsService,
} from 'modules/environment-records';
import {
  SleepRecordsDetail,
  SleepRecordsDetailService,
} from 'modules/sleep-records-fitbit';
import {
  SleepRecordsLog,
  SleepRecordsLogService,
} from 'modules/sleep-records-mobile';
import { SurveyRecords } from 'modules/survey-records';
import { User, UsersService } from 'modules/user';
import * as moment from 'moment';
import { createQueryBuilder, IsNull, Raw, Repository } from 'typeorm';
import {
  DateHelper,
  ENVIRONMENT_FITBIT_TYPE,
  ENVIRONMENT_TYPE_DETAIL,
  ENVIRONMENT_TYPE_ID,
  ENVIRONMENT_TYPE_VALUE,
  NAP_TIME_ID,
  RECORDS_SLEEP_TYPE_FITBIT,
  RECORDS_TYPE_ID,
  RECORDS_TYPE_PARENT,
  SLEEP_TIP,
  SLEEP_TIP_TYPE_ID,
  SLEEP_TYPE,
  STATUS_RECORD,
  STRESS_ID,
  TIME_ID,
  TIME_VALUE,
} from 'utils';
import {
  EnvironmentRecordFitbit,
  EnvironmentRecordMobile,
  RecordValue,
  SleepRecord,
  SleepRecordDataHomeHistory,
  SleepRecordOverallAverage,
  SleepRecordUserAverage,
  TotalAverage,
} from '.';
import {
  UserFeedbackDetail,
  UserFeedbackDetailService,
} from '../user-feedback-detail';
import {
  SleepRecords,
  SleepRecordFillableFields,
  RecordsMobile,
} from './sleep-records.entity';
import { EnvironmentRecordsDetailService } from 'modules/environment-records-detail';
import { float } from 'aws-sdk/clients/lightsail';
import { bool } from 'aws-sdk/clients/signer';
import { UsersFeedback, UsersFeedbackService } from 'modules/user-feedback';
import {
  TOTAL_SCORE, TYPEID_END_TIME, TYPEID_START_TIME
} from 'utils/constants';
import { async } from 'rxjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SleepRecordsService {
  constructor(
    @InjectRepository(SleepRecords)
    private readonly sleepRecordRepository: Repository<SleepRecords>,
    private readonly dailyRecordService: DailyRecordsService,
    private readonly dailyRecordDetailService: DailyRecordsDetailService,
    private readonly environmentRecordService: EnvironmentRecordsService,
    private readonly environmentRecordDetailService: EnvironmentRecordsDetailService,
    //private readonly sleepRecordDetailRepository: Repository<SleepRecordsDetail>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => SleepRecordsDetailService))
    private readonly sleepRecordsDetailService: SleepRecordsDetailService,
    @Inject(forwardRef(() => SleepRecordsLogService))
    private readonly sleepRecordsLogService: SleepRecordsLogService,
    private readonly commonCodesService: CommonCodesService,
    @Inject(forwardRef(() => UsersFeedbackService))
    private readonly usersFeedbackService: UsersFeedbackService,
    private readonly userFeedbackDetailService: UserFeedbackDetailService,
  ) { }

  //getUpdateByUser
  async getUpdateByUser(userId: number, date: Date) {
    return await this.sleepRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(date),
        deleted_at: null,
      },
      relations: ['details'],
    });
  }

  //add, update fitbit
  async createUpdateFitbit(user_id: number, date: Date, arrBody) {
    let sleepRecord = await this.getUpdateByUser(user_id, date);
    if (sleepRecord) {
      arrBody.map(async (item) => {
        let detailSleep = await this.sleepRecordsDetailService.getBySleepIDAndTypeId(sleepRecord.id, item.type_id,);
        if (detailSleep) {
          //update
          item.sleep_records_id = sleepRecord.id;
          item.updated_at = new Date();
          await this.sleepRecordsDetailService.update(item);
        } else {
          item.sleep_records_id = sleepRecord.id;
          await this.sleepRecordsDetailService.create(item);
        }
      });

      //add feedback
      var usersFeedback = await this.usersFeedbackService.getByRecord(sleepRecord.id, RECORDS_TYPE_PARENT.SleepRecord,);
      if (usersFeedback) {
        //check exists
        await this.userFeedbackDetailService.deletedRange(usersFeedback);
        await this.addFeedbackDetail(usersFeedback, sleepRecord);
      } else {
        //add
        var usersFeedbackNew = new UsersFeedback();
        usersFeedbackNew.records_id = sleepRecord.id;
        usersFeedbackNew.feedback_date = sleepRecord.date;
        usersFeedbackNew.user_id = sleepRecord.user_id;
        usersFeedbackNew.records_type_id = RECORDS_TYPE_PARENT.SleepRecord;
        if (await this.usersFeedbackService.create(usersFeedbackNew)) {
          await this.addFeedbackDetail(usersFeedbackNew, sleepRecord);
        }
      }
    } else {
      let sleepRecordNew = new SleepRecords();
      sleepRecordNew.user_id = user_id;
      sleepRecordNew.date = DateHelper.getDate(date);
      sleepRecordNew.created_at = new Date();
      let sleepRCdata = await this.sleepRecordRepository.save(sleepRecordNew);
      arrBody.map(async (item) => {
        item.sleep_records_id = sleepRCdata.id;
        await this.sleepRecordsDetailService.create(item);
      });
    }


  }

  //get full date record
  async getFullDateRecordByMonth(userId, date: Date) {
    let arrDate = [];
    const sleep = await createQueryBuilder(SleepRecords)
      .where('MONTH(date) = MONTH(:date) and user_id = :userID', {
        date: date,
        userID: userId,
      })
      .select('date')
      .execute()
      .then((res) => {
        res.map((date) => arrDate.push(date.date));
      });

    const daily = await createQueryBuilder(DailyRecords)
      .where('MONTH(record_date) = MONTH(:date) and user_id = :userID', {
        date: date,
        userID: userId,
      })
      .select('record_date')
      .execute()
      .then((res) => {
        res.map((date) => arrDate.push(date.record_date));
      });

    const env = await createQueryBuilder(EnvironmentRecords)
      .where('MONTH(date) = MONTH(:date) and user_id = :userID', {
        date: date,
        userID: userId,
      })
      .select('date')
      .execute()
      .then((res) => {
        res.map((date) => arrDate.push(date.date));
      });

    const survey = await createQueryBuilder(SurveyRecords)
      .where('MONTH(date) = MONTH(:date) and user_id = :userID', {
        date: date,
        userID: userId,
      })
      .select('date')
      .execute()
      .then((res) => {
        res.map((date) => arrDate.push(date.date));
      });
    const dataparse = '2022-01-12 17:05:00';
    const dataparse1 = '2022-01-12 18:05:00';
    var duration = moment.duration(
      moment(dataparse1).diff(moment(dataparse, 'YYYY-MM-DDThh:mm:ss')),
    );

    const unique = await arrDate.reduce((result, element) => {
      return result.includes(element) ? result : [...result, element];
    }, []);

    return unique;
  }

  //get paging
  async getAllSleepPaging(query) {
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
    let startTime = Raw((alias) => `${alias} >= :date and ${alias} <= :date1`, {
      date: fromDt != '' ? fromDt : '2020-11-15',
      date1: toDt != '' ? toDt : '2900-11-15',
    });
    let [result, total] = await this.sleepRecordRepository.findAndCount({
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
      relations: ['user', 'statusleep_records_lvl_name', 'details', 'logs'],
      order: { id: 'DESC' },
      take: take,
      skip: skip * take,
    });

    return {
      data: result,
      count: total,
    };
  }

  //get by id
  async get(id: number) {
    const sleepRecords = await this.sleepRecordRepository.findOne({
      where: { id: id },
      relations: [
        'user',
        'details',
        'logs',
        'details.type',
        'statusleep_records_lvl_name',
      ],
    });
    return sleepRecords;
  }

  async getDetailByID(id: number) {
    const sleepRecords = await this.sleepRecordRepository.findOne({
      where: { id: id },
      relations: [
        'user',
        'details',
        'logs',
        'details.type',
        'statusleep_records_lvl_name',
      ],
    });
    // if (!sleepRecords.start_time) {
    //   if (sleepRecords.logs.length !== 0) {
    //     sleepRecords.start_time = sleepRecords.logs[0].start_time;
    //     sleepRecords.end_time = sleepRecords.logs[sleepRecords.logs.length - 1].end_time;
    //     let awakeTemp=0
    //     sleepRecords.logs.map((item)=>{
    //       awakeTemp +=item.awake_count
    //     })
    //     sleepRecords.awake_count = awakeTemp+sleepRecords.logs.length;
    //   }else{
    //     sleepRecords.start_time = sleepRecords.details[2].sub_value;
    //     sleepRecords.end_time = sleepRecords.details[3].sub_value;
    //   }
    // }
    if (sleepRecords.details.length !== 0) {
      sleepRecords.start_time = sleepRecords?.details[2]?.sub_value;
      sleepRecords.end_time = sleepRecords?.details[3]?.sub_value;
      sleepRecords.awake_count = sleepRecords?.details[5]?.value;
    } else {
      if (sleepRecords.logs.length !== 0) {
        sleepRecords.start_time = sleepRecords?.logs[0]?.start_time;
        sleepRecords.end_time =
          sleepRecords?.logs[sleepRecords?.logs.length - 1]?.end_time;
        let awakeTemp = 0;
        sleepRecords.logs.map((item) => {
          awakeTemp += item.awake_count;
        });
        sleepRecords.awake_count = awakeTemp + sleepRecords?.logs?.length;
      }
    }
    return sleepRecords;
  }

  //get by user id
  async getByUserId(userId: number) {
    const sleepRecords = await this.sleepRecordRepository.find({
      // user_id:userId
      where: { user_id: userId },
      relations: ['user', 'details', 'logs',]
    });
    return sleepRecords;
  }
  //get by user id get one
  async getByUserIdOne(userId: number) {
    const sleepRecords = await this.sleepRecordRepository.findOne({
      // user_id:userId
      where: { user_id: userId },
      order: { id: 'DESC' },
    });
    return sleepRecords;
  }

  async getByDate(userId: number, date: Date) {
    const sleepRecords = await this.sleepRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(date),
        deleted_at: null,
      },
    });

    return sleepRecords;
  }

  async getDateNhan(userId: number, date: Date) {
    return await this.sleepRecordRepository
      .createQueryBuilder()
      .where(
        'user_id = :userId and DATE_FORMAT(date,"%Y-%m-%d")= DATE_FORMAT(:date,"%Y-%m-%d")',
        { userId: userId, date: date },
      )
      .getOne();
  }

  async getByDateQuery(userId: number, date: Date) {
    const sleepRecords = await this.sleepRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(date),
        deleted_at: null,
      },
    });

    return sleepRecords;
  }

  //get data result by date
  async getAllByDate(userId: number, date: Date) {
    console.log('userId-date', userId, date);
    const totalAverageList = Array<TotalAverage>();
    const totalAverage = new TotalAverage();

    //get sleepRecordUserAverage user input
    const sleepRecordUserAverage = await this.sleepRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(date),
        deleted_at: null,
      },
      relations: ['details'],
    });

    //get sleepRecordsOverallAverageList
    const sleepRecordsOverallAverageList =
      await this.sleepRecordRepository.find({
        where: {
          date: DateHelper.getDate(date),
          deleted_at: null,
        },
        relations: ['details'],
      });
    const getEnvironmentList = await this.environmentRecordService.getByDateAndUser(userId, date);
    // console.log('sleepRecordUserAverage==sssss=======================', sleepRecordUserAverage, date, DateHelper.getDate(date),);
    // console.log('sleepRecordsOverallAverageList', sleepRecordsOverallAverageList.length,);

    // 1:add Sleep Record UserAverage
    if (sleepRecordUserAverage != undefined) {
      const listSleepRecordsLog = await this.sleepRecordsLogService.getBySleepRecordId(sleepRecordUserAverage.id,);
      // console.log('listSleepRecordsLog', listSleepRecordsLog.length);

      // 1.1 get data result from Fitbit
      if (sleepRecordUserAverage?.details?.length > 0) {
        const dailyRecordFitbit = await this.getSelectionTodayUserAverageByFitbit(sleepRecordUserAverage, false, date,);
        // console.log('----------------------dailyRecordFitbit', dailyRecordFitbit,);
        if (dailyRecordFitbit != undefined) {
          //add daily fitbit to total list
          totalAverage.alcol_record = dailyRecordFitbit.alcol_record;
          totalAverage.cafe_record = dailyRecordFitbit.cafe_record;
          totalAverage.nap_record = dailyRecordFitbit.nap_record;
          totalAverage.stress_record = dailyRecordFitbit.stress_record;
          totalAverage.sleep_record = dailyRecordFitbit.sleep_record;
          totalAverage.user_average = dailyRecordFitbit.user_average;
          totalAverage.overall_average = dailyRecordFitbit.overall_average;
        }

        //get daily record by date and user
        const dailyRecord = await this.getDailyRecordByDateAndUser(userId, date,);
        if (dailyRecord != null) {
          totalAverage.alcol_record = dailyRecord.alcol_record;
          totalAverage.cafe_record = dailyRecord.cafe_record;
          totalAverage.nap_record = dailyRecord.nap_record;
          totalAverage.stress_record = dailyRecord.stress_record;
        }
        //add list total
        totalAverageList.push(totalAverage);
      }
      // 1.2 get data result from user input
      else if (sleepRecordUserAverage?.details?.length == 0 && sleepRecordUserAverage.start_time != null) {
        // console.log('----------------------get data result from user input==================');

        const totalAverageModel = await this.getSelectionTodayUserAverage(sleepRecordUserAverage, sleepRecordsOverallAverageList, date);
        if (totalAverageModel != undefined) {
          totalAverage.user_average = totalAverageModel.user_average;
          totalAverage.overall_average = totalAverageModel.overall_average;
          totalAverage.sleep_record = totalAverageModel.sleep_record;
        }

        //get daily records by date and user
        const dailyRecord = await this.getDailyRecordByDateAndUser(userId, date,);
        if (dailyRecord != null) {
          totalAverage.alcol_record = dailyRecord.alcol_record;
          totalAverage.cafe_record = dailyRecord.cafe_record;
          totalAverage.nap_record = dailyRecord.nap_record;
          totalAverage.stress_record = dailyRecord.stress_record;
        }

        //add list total
        totalAverageList.push(totalAverage);
      }
      //1.3 get data result from record sound
      else {//if (listSleepRecordsLog.length > 0) {
        // console.log('----------------------dailyRecordSOUND==================');
        const totalAverageModel = await this.getSelectionTodayUserAverageBySoundRecord(sleepRecordUserAverage, sleepRecordsOverallAverageList, listSleepRecordsLog, date);
        if (totalAverageModel != undefined) {
          // console.log('totalAverageModel', totalAverageModel);
          totalAverage.user_average = totalAverageModel.user_average;
          totalAverage.overall_average = totalAverageModel.overall_average;
          totalAverage.sleep_record = totalAverageModel.sleep_record;
        }
        //get daily records by date and user
        const dailyRecord = await this.getDailyRecordByDateAndUser(userId, date);
        if (dailyRecord != null) {
          totalAverage.alcol_record = dailyRecord.alcol_record;
          totalAverage.cafe_record = dailyRecord.cafe_record;
          totalAverage.nap_record = dailyRecord.nap_record;
          totalAverage.stress_record = dailyRecord.stress_record;
        }

        //add list total
        totalAverageList.push(totalAverage);
      }
    } else {
      //get daily records by date and user
      const dailyRecord = await this.getDailyRecordByDateAndUser(userId, date);
      if (dailyRecord != null) {
        totalAverage.alcol_record = dailyRecord.alcol_record;
        totalAverage.cafe_record = dailyRecord.cafe_record;
        totalAverage.nap_record = dailyRecord.nap_record;
        totalAverage.stress_record = dailyRecord.stress_record;
      }

      //add list total
      totalAverageList.push(totalAverage);
    }

    //  2: add Sleep Record OverallAverage
    let overallAverage = new SleepRecordOverallAverage();
    overallAverage.start_time = 0;
    overallAverage.end_time = 0;
    overallAverage.sleep_time = 0;
    overallAverage.awake_count = 0;
    overallAverage.sleep_quality = 0;
    // console.log('sleepRecordsOverallAverageList============lenght=============', sleepRecordsOverallAverageList.length,);
    if (sleepRecordsOverallAverageList.length > 0 || getEnvironmentList) {
      //sum sleep quality
      //let sumOverallSleepQuality = await this.sumSleepQuality(sleepRecordsOverallAverageList, sleepRecordUserAverage != undefined ? sleepRecordUserAverage.sleep_eval : 0);

      for (let i = 0; i < sleepRecordsOverallAverageList.length; i++) {
        // console.log('sleepRecordsOverallAverageList[i].details.length', sleepRecordsOverallAverageList[i].details.length);
        // const listSleepRecordsLog = await this.sleepRecordsLogService.getBySleepRecordId(sleepRecordsOverallAverageList[i].id);

        //2.1get data result from fitbit
        if (sleepRecordsOverallAverageList[i].details.length > 0) {
          const dataFitbit = await this.getSelectionTodayUserAverageByFitbit(sleepRecordsOverallAverageList[i], true, date,);
          // console.log('-------------dataFitbit--------------------------------', dataFitbit,);
          // console.log('----------1-----------overallAverage------------------------', overallAverage,);

          if (dataFitbit != undefined) {
            // add to overallAverage
            overallAverage.start_time += parseFloat((dataFitbit?.user_average?.start_time).toFixed(2),);
            overallAverage.end_time += parseFloat((dataFitbit?.user_average?.end_time).toFixed(2),);
            overallAverage.sleep_time += parseFloat((dataFitbit?.user_average?.sleep_time).toFixed(2),);
            overallAverage.awake_count += dataFitbit?.user_average?.awake_count;

            // start_time += parseFloat((dataFitbit?.user_average?.start_time).toFixed(2),);
            // end_time += parseFloat((dataFitbit?.user_average?.end_time).toFixed(2),);
            // sleep_time += parseFloat((dataFitbit?.user_average?.sleep_time).toFixed(2),);
            // awake_count += dataFitbit?.user_average?.awake_count;

            // overallAverage.start_time = overallAverage.start_time + parseFloat((dataFitbit?.user_average?.start_time).toFixed(2),);
            // overallAverage.end_time = overallAverage.end_time + parseFloat((dataFitbit?.user_average?.end_time).toFixed(2),);
            // overallAverage.sleep_time = overallAverage.sleep_time + parseFloat((dataFitbit?.user_average?.sleep_time).toFixed(2),);
            // overallAverage.awake_count = overallAverage.awake_count + dataFitbit?.user_average?.awake_count;

            // overallAverage.start_time = start_time;
            // overallAverage.end_time = end_time;
            // overallAverage.sleep_time = sleep_time;
            // overallAverage.awake_count = awake_count;

            totalAverage.overall_average = overallAverage;
            // console.log('-------------dataFitbit--------overallAverage------------------------', overallAverage,);
            // set status like - unlike in sleep record
            if (totalAverage?.sleep_record != undefined) {
              //get status like or unlike sleep_time
              // const sleepTimeAll = Math.round((totalAverage?.sleep_record?.sleep_time / (overallAverage.sleep_time / sleepRecordsOverallAverageList.length)) * 100);
              const sleepTimeRecord = totalAverage?.sleep_record?.sleep_time;
              const sleepTimeAll = overallAverage.sleep_time;

              // console.log('sleepTimeAll', sleepTimeAll);
              // console.log('totalAverage?.sleep_record?.sleep_time', totalAverage?.sleep_record?.sleep_time,);
              if (sleepTimeRecord > sleepTimeAll)
                totalAverage.sleep_record.sleep_time_status = false;
              else totalAverage.sleep_record.sleep_time_status = true;

              //get status like or unlike awake_count
              // const awakeCount = Math.round((totalAverage?.sleep_record?.awake_count / (overallAverage.awake_count / sleepRecordsOverallAverageList.length)) * 100);
              const awakeCountAll = overallAverage.awake_count;
              const awakeCountRecord = totalAverage?.sleep_record?.awake_count;
              // console.log('awakeCountAll', awakeCountAll);
              // console.log('awakeCountRecord', awakeCountRecord);

              if (awakeCountRecord > awakeCountAll)
                totalAverage.sleep_record.awake_count_status = false;
              else totalAverage.sleep_record.awake_count_status = true;

              const recordDetails =
                await this.sleepRecordsDetailService.getDetailAll();
              //get status like or unlike awake_time
              let sumAwakeTime = recordDetails.reduce((a, v) => (a = a + (v.type_id == RECORDS_SLEEP_TYPE_FITBIT.TimeAwake ? v.value : 0)), 0,);
              const awakeTime = Math.round((totalAverage?.sleep_record?.awake_time / (sumAwakeTime / sleepRecordsOverallAverageList.length)) * 100,);
              if (awakeTime > totalAverage?.sleep_record?.awake_count)
                totalAverage.sleep_record.awake_time_status = true;
              else totalAverage.sleep_record.awake_time_status = false;
            }
          }
        }
        //2.2 get data result from user input
        else if (sleepRecordsOverallAverageList[i].details.length == 0 && sleepRecordsOverallAverageList[i].start_time != null) {
          // console.log('=======================i=========================', i);
          const startTimeOverall = await this.calHour(sleepRecordsOverallAverageList[i].start_time);
          const endTimeOverall = await this.calHour(sleepRecordsOverallAverageList[i].end_time);
          // const sleepTimeOverall = endTimeOverall - startTimeOverall;
          var duration = moment.duration(
            moment(sleepRecordsOverallAverageList[i].end_time, 'YYYY-MM-DDThh:mm:ss',).diff(moment(sleepRecordsOverallAverageList[i]?.start_time, 'YYYY-MM-DDThh:mm:ss',),),
          );
          const sleepTimeOverall = duration.asMinutes() / 60;

          // console.log('=======================overallAverage=========================', overallAverage.start_time,);
          // console.log('=======================overallAverage===========start_time==============', overallAverage.start_time,);
          // console.log('startTimeOverall', startTimeOverall);
          // console.log('endTimeOverall', endTimeOverall);
          // console.log('sleepTimeOverall', sleepTimeOverall);
          // console.log('overallAverage', overallAverage);
          // console.log('sumOverallSleepQuality', sumOverallSleepQuality);

          if (overallAverage.start_time == undefined) {
            //add overallAverage
            overallAverage.start_time += parseFloat(startTimeOverall.toFixed(2));
            overallAverage.end_time += parseFloat(endTimeOverall.toFixed(2));
            overallAverage.sleep_time += parseFloat(sleepTimeOverall.toFixed(2));
            overallAverage.awake_count += sleepRecordsOverallAverageList[i].awake_count;
            overallAverage.sleep_quality += sleepRecordsOverallAverageList[i].sleep_eval;//= parseFloat(sumOverallSleepQuality.toFixed(2),);

            totalAverage.overall_average = overallAverage;
          } else {
            //add to overallAverage
            overallAverage.start_time = overallAverage.start_time + parseFloat(startTimeOverall.toFixed(2),);
            overallAverage.end_time = overallAverage.end_time + parseFloat(endTimeOverall.toFixed(2));
            overallAverage.sleep_time = overallAverage.sleep_time + parseFloat(sleepTimeOverall.toFixed(2),);
            overallAverage.awake_count = overallAverage.awake_count + sleepRecordsOverallAverageList[i].awake_count;
            overallAverage.sleep_quality += sleepRecordsOverallAverageList[i].sleep_eval;;//= parseFloat(sumOverallSleepQuality.toFixed(2),);

            totalAverage.overall_average = overallAverage;
            // console.log('overallAverage', overallAverage);
          }
          // console.log('=============totalAverage.overall_average========================i', totalAverage.overall_average, i);
        }
        //2.3 get data result from record sound
        else {//if (listSleepRecordsLog.length) {
          const listSleepRecordsLog = await this.sleepRecordsLogService.getBySleepRecordId(sleepRecordsOverallAverageList[i].id);
          // console.log("=============listSleepRecordsLog========================", listSleepRecordsLog)
          const totalAverageModel = await this.getSelectionTodayUserAverageBySoundRecord(sleepRecordUserAverage, sleepRecordsOverallAverageList, listSleepRecordsLog, date);
          // console.log("=============totalAverageModel========================", totalAverageModel)
          // console.log("=============totalAverageModel?.user_average ========================", totalAverageModel?.user_average)

          if (totalAverageModel?.user_average != undefined) {
            // console.log("=============totalAverageModel?.user_average?.start_time ========================", totalAverageModel?.user_average?.start_time)
            // console.log("=============totalAverageModel?.user_average ?.end_time========================", totalAverageModel?.user_average?.end_time)
            // console.log("=============totalAverageModel?.user_average?.sleep_time ========================", totalAverageModel?.user_average?.sleep_time)
            // console.log("=============totalAverageModel?.user_average?.awake_count ========================", totalAverageModel?.user_average?.awake_count)

            // start_time += parseFloat((totalAverageModel?.user_average?.start_time).toFixed(2),);
            // end_time += parseFloat((totalAverageModel?.user_average?.end_time).toFixed(2),);
            // sleep_time += parseFloat((totalAverageModel?.user_average?.sleep_time).toFixed(2),);
            // awake_count +=  totalAverageModel?.user_average?.awake_count;

            overallAverage.start_time = 0;// parseFloat((totalAverageModel?.user_average?.start_time).toFixed(2));
            overallAverage.end_time = 0;//parseFloat((totalAverageModel?.user_average?.end_time).toFixed(2));
            overallAverage.sleep_time += parseFloat((totalAverageModel?.user_average?.sleep_time).toFixed(4));
            overallAverage.awake_count += totalAverageModel?.user_average?.awake_count ?? 0;

            totalAverage.overall_average = overallAverage;
          }
        }
      }
      // console.log('=============totalAverage.overall_average========================', totalAverage.overall_average,);

      //get data result overallAverage
      totalAverage.overall_average = overallAverage;
      //if data null
      if (sleepRecordUserAverage == undefined) {
        totalAverage.user_average = new SleepRecordUserAverage();
      }
      if (totalAverage.alcol_record == undefined)
        totalAverage.alcol_record = new RecordValue();
      if (totalAverage.cafe_record == undefined)
        totalAverage.cafe_record = new RecordValue();
      if (totalAverage.nap_record == undefined)
        totalAverage.nap_record = new RecordValue();
      if (totalAverage.stress_record == undefined)
        totalAverage.stress_record = new RecordValue();
      if (totalAverage.sleep_record == undefined)
        totalAverage.sleep_record = new SleepRecord();

      //get Data MobileAndFitbit By User
      const getDataMobileAndFitbitByUser = await this.getEnvironmentMobileAndFitbitByUser(userId, date);
      if (getDataMobileAndFitbitByUser != null) {
        totalAverage.environment_record_fitbit = getDataMobileAndFitbitByUser.environment_record_fitbit;
        totalAverage.environment_record_mobile = getDataMobileAndFitbitByUser.environment_record_mobile;
      }
      if (totalAverage.environment_record_fitbit == null)
        totalAverage.environment_record_fitbit = new EnvironmentRecordFitbit();
      if (totalAverage.environment_record_mobile == null)
        totalAverage.environment_record_mobile = new EnvironmentRecordMobile();

      // console.log('=============overallAverage======2==================', overallAverage,);

      //average overallAverage
      overallAverage.start_time = parseFloat(((overallAverage.start_time != null ? overallAverage.start_time : 0) / sleepRecordsOverallAverageList.length).toFixed(2),);
      overallAverage.end_time = parseFloat(((overallAverage.end_time != null ? overallAverage.end_time : 0) / sleepRecordsOverallAverageList.length).toFixed(2),);
      overallAverage.sleep_time = parseFloat(((overallAverage.sleep_time != null ? overallAverage.sleep_time : 0) / sleepRecordsOverallAverageList.length).toFixed(2),);
      overallAverage.sleep_quality = parseFloat(((overallAverage.sleep_quality != null ? overallAverage.sleep_quality : 0) / sleepRecordsOverallAverageList.length).toFixed(2));//parseFloat(sumOverallSleepQuality.toFixed(2),);
      overallAverage.awake_count = parseFloat(((overallAverage.awake_count != null ? overallAverage.awake_count : 0) / sleepRecordsOverallAverageList.length).toFixed(2),);

      totalAverage.overall_average = overallAverage;
      // console.log('=============totalAverage.overall_average==========overallAverage==============', totalAverage.overall_average,);
      // console.log('=============totalAverage.user_average========================', totalAverage.user_average,);
      // console.log('=============totalAverage?.sleep_record========================', totalAverage?.sleep_record);

      ////////////////////////
      if (totalAverage?.sleep_record != undefined) {
        //get status like or unlike sleep_time
        // const sleepTimeAll = Math.round((totalAverage?.sleep_record?.sleep_time / (overallAverage.sleep_time / sleepRecordsOverallAverageList.length)) * 100);
        const sleepTimeRecord = totalAverage?.sleep_record?.sleep_time;
        const sleepTimeAll = overallAverage.sleep_time;

        // console.log('sleepTimeAll', sleepTimeAll);
        // console.log('totalAverage?.sleep_record?.sleep_time', totalAverage?.sleep_record?.sleep_time,);
        if (sleepTimeRecord > sleepTimeAll)
          totalAverage.sleep_record.sleep_time_status = false;
        else totalAverage.sleep_record.sleep_time_status = true;

        //get status like or unlike awake_count
        // const awakeCount = Math.round((totalAverage?.sleep_record?.awake_count / (overallAverage.awake_count / sleepRecordsOverallAverageList.length)) * 100);
        const awakeCountAll = overallAverage.awake_count;
        const awakeCountRecord = totalAverage?.sleep_record?.awake_count;
        // console.log('awakeCountAll', awakeCountAll);
        // console.log('awakeCountRecord', awakeCountRecord);

        if (awakeCountRecord > awakeCountAll)
          totalAverage.sleep_record.awake_count_status = false;
        else totalAverage.sleep_record.awake_count_status = true;

        const recordDetails =
          await this.sleepRecordsDetailService.getDetailByDate(date);
        // console.log('recordDetails------', recordDetails.length);
        //get status like or unlike awake_time
        let sumAwakeTime = recordDetails.reduce((a, v) => (a = a + (v.type_id == RECORDS_SLEEP_TYPE_FITBIT.TimeAwake ? v.value : 0)), 0,);
        const awakeTime = Math.round((totalAverage?.sleep_record?.awake_time / (sumAwakeTime / sleepRecordsOverallAverageList.length)) * 100,);
        if (totalAverage?.sleep_record?.awake_count > awakeTime)
          totalAverage.sleep_record.awake_time_status = false;
        else totalAverage.sleep_record.awake_time_status = true;
      }
      if (sleepRecordUserAverage == undefined) {
        totalAverage.sleep_record.records_mobile = new Array<RecordsMobile>()
        totalAverage.sleep_record.awake_count = 0;
        totalAverage.sleep_record.awake_time = 0;
        totalAverage.sleep_record.sleep_time = 0;
        totalAverage.sleep_record.sleep_point = 0;
      }

      if (totalAverage.user_average == undefined) {
        let overallAverageMobile = new SleepRecordOverallAverage();
        overallAverageMobile.start_time = 0;
        overallAverageMobile.end_time = 0;
        overallAverageMobile.sleep_time = 0;
        overallAverageMobile.sleep_quality = 0; //parseFloat(sumSleepQuality.toFixed(2));
        overallAverageMobile.awake_count = 0;
        overallAverageMobile.change_awake_count = 0;
        overallAverageMobile.change_sleep_time = 0;
        totalAverage.user_average = overallAverageMobile;
      }
      /////////////////////////
      //add sleep tip
      const sleepTip = await this.sleepTip(totalAverage);
      totalAverage.sleep_tip = sleepTip;

      //add list total
      totalAverageList.push(totalAverage);
    }
    if (totalAverageList.length > 0) return totalAverageList[0];
  }

  //sum sleep quality
  async sumSleepQuality(sleepRecordsOverallAverageList: SleepRecords[], sleep_eval: number,) {
    let sumAllRecord = sleepRecordsOverallAverageList.reduce((a, v) => (a = a + v.sleep_eval), 0,);
    let sumSleepQuality = sumAllRecord / sleepRecordsOverallAverageList.length;

    return sumSleepQuality;
  }

  //get user average by user input
  async getSelectionTodayUserAverage(sleepRecordUserAverage: SleepRecords, sleepRecordsOverallAverageList: Array<SleepRecords>, date) {
    const listSleepRecordsLog = Array<SleepRecordsLog>();
    const userAverage = new SleepRecordUserAverage();
    const totalAverage = new TotalAverage();

    const startTime = await this.calHour(sleepRecordUserAverage?.start_time);
    const endTime = await this.calHour(sleepRecordUserAverage?.end_time);

    var duration = moment.duration(
      moment(sleepRecordUserAverage?.end_time, 'YYYY-MM-DDThh:mm:ss').diff(
        moment(sleepRecordUserAverage?.start_time, 'YYYY-MM-DDThh:mm:ss'),
      ),
    );
    // console.log('+++++duration=============', duration);
    const sleepTime = duration.asMinutes() / 60;

    // console.log('startTime', startTime);
    // console.log('endTime', endTime);
    // console.log('+++++sleepTime=============', sleepTime);/
    // console.log('userAverage.start_time', userAverage.start_time);

    userAverage.start_time = parseFloat(startTime.toFixed(2));
    userAverage.end_time = parseFloat(endTime.toFixed(2));
    userAverage.sleep_time = parseFloat(sleepTime.toFixed(2));
    userAverage.sleep_quality = sleepRecordUserAverage.sleep_eval; //parseFloat(sumSleepQuality.toFixed(2));
    userAverage.awake_count = sleepRecordUserAverage.awake_count;
    totalAverage.user_average = userAverage;
    // console.log('userAverage=================', userAverage);

    if (userAverage != undefined) {
      totalAverage.is_record_sleep = true;

      // //sleepRecords
      // let sleepTimeDuration = DateHelper.getSecondsDuration(
      //   sleepRecordUserAverage.end_time,
      //   sleepRecordUserAverage.start_time,
      // );
      // console.log('sleepTimeDuration=========getSelectionTodayUserAverage', sleepTimeDuration,);

      //sum sleep index
      const sumSleepIndex = await this.calSleepIndex(userAverage, listSleepRecordsLog, sleepRecordUserAverage.date,);
      // console.log('sumSleepIndex', sumSleepIndex);

      const arrRecordsMobile = Array<RecordsMobile>();

      // console.log('===========sleepTimeDuration=========', sleepTimeDuration);
      //sleep record
      const sleepRecord = await this.getSleepRecord(
        userAverage?.start_time,
        userAverage?.end_time,
        sleepTime,
        sleepTime,
        false,
        sleepRecordUserAverage.awake_count,
        false,
        0,
        false,
        sumSleepIndex > 100 ? sumSleepIndex : sumSleepIndex ? sumSleepIndex : 0,
        arrRecordsMobile
      );
      if (sleepRecord != undefined) totalAverage.sleep_record = sleepRecord;
      else totalAverage.sleep_record = new SleepRecord();
    } else {
      // userAverage = null
      totalAverage.is_record_sleep = false;
      totalAverage.sleep_record = new SleepRecord();
    }

    return totalAverage;
  }

  //get data result from sound record
  async getSelectionTodayUserAverageBySoundRecord(
    sleepRecordUserAverage: SleepRecords,
    sleepRecordsOverallAverageList: Array<SleepRecords>,
    sleepRecordsLogList: Array<SleepRecordsLog>,
    date: Date,
  ) {
    const userAverage = new SleepRecordUserAverage();
    const totalAverage = new TotalAverage();
    const arrRecordsMobile = Array<RecordsMobile>();

    let startTime = 0;
    let endTime = 0;
    let sleepTime = 0.0;
    let sleep_eval = 0;
    let awake_count = 0;
    // console.log('sleepRecordsLogList.length ========= SOUND', sleepRecordsLogList.length,);
    // console.log('sleepRecordsLogList.length ========= SOUND', sleepRecordsLogList.length,);

    let start_Time = 0.0;
    let end_Time = 0.0;
    let sleep_Time = 0.0;
    let sleepTimeDuration = 0;
    //list result record
    if (sleepRecordsLogList.length > 0) {
      for (let i = 0; i < sleepRecordsLogList.length; i++) {
        if (sleepRecordsLogList[i].sleep_time >= 3600) {
          // console.log('sleepTimeDuration ========= SOUND', sleepTimeDuration, i,);
          if (sleepTimeDuration <= sleepRecordsLogList[i].sleep_time) {
            sleepTimeDuration = sleepRecordsLogList[i].sleep_time;
            start_Time = await this.calHour(sleepRecordsLogList[i].start_time);
            // console.log('startTime_________________ ========= SOUND', start_Time, i,);
            end_Time = await this.calHour(sleepRecordsLogList[i].end_time);
            // console.log('end_Time_________________ ========= SOUND', end_Time, i,);
          }
          startTime += await this.calHour(sleepRecordsLogList[i].start_time);
          // console.log('startTime ========= SOUND', startTime, i);
          endTime += await this.calHour(sleepRecordsLogList[i].end_time);
          // console.log('endTime ========= SOUND', endTime, i);
          sleepTime += sleepRecordsLogList[i].sleep_time;
          sleep_eval += sleep_eval;
          awake_count += sleepRecordsLogList[i].awake_count;

          // console.log('startTime ========= SOUND', startTime);
          // console.log('endTime ========= SOUND', endTime);
          sleep_Time = sleepTime / 3600;
          // console.log('sleep_Time ===3600000000====== SOUND', sleep_Time);
          // console.log('sleepTime ========= SOUND', sleepTime);

          userAverage.start_time = parseFloat((startTime).toFixed(2));
          userAverage.end_time = parseFloat((endTime).toFixed(2));
          userAverage.sleep_time = parseFloat(sleep_Time.toFixed(4));
          userAverage.sleep_time_seconds = sleepTime;
          userAverage.sleep_quality = 0; //parseFloat((sleep_eval).toFixed(2));
          userAverage.awake_count = awake_count //!= undefined ? awake_count : 0;

          //add record mobile array
          // const RecordsMobiles = Array<RecordsMobile>();
          const records_Mobile = new RecordsMobile();
          records_Mobile.start_hour = await this.calHour(sleepRecordsLogList[i].start_time);
          records_Mobile.end_hour = await this.calHour(sleepRecordsLogList[i].end_time);
          records_Mobile.time_seconds = sleepRecordsLogList[i].sleep_time;
          // console.log('records_Mobile ========= records_Mobile', records_Mobile);

          arrRecordsMobile.push(records_Mobile)

          //add total average
          totalAverage.user_average = userAverage;
        } else {
          userAverage.awake_count = 0
        }
      }
    }
    // console.log('user_average ========= SOUND', userAverage);

    if (userAverage != undefined) {
      totalAverage.is_record_sleep = true;
      // console.log('listSleepRecordsLog.lllll', sleepRecordsLogList.length);

      //sum sleep index
      const sumSleepIndex = await this.calSleepIndex(
        userAverage,
        sleepRecordsLogList,
        date,
      );
      // console.log('sumSleepIndex===================SOUND', sumSleepIndex);

      start_Time = parseFloat(start_Time.toFixed(2));
      end_Time = parseFloat(end_Time.toFixed(2));

      //sleepRecords
      //   let sleepTimeDuration = DateHelper.getSecondsDuration(sleepRecordUserAverage.end_time, sleepRecordUserAverage.start_time);

      //sleep record
      const sleepRecord = await this.getSleepRecord(
        0, //start_Time,
        0, //end_Time,
        userAverage?.sleep_time,
        userAverage?.sleep_time_seconds,
        false,
        userAverage?.awake_count,
        false,
        0,
        false,
        sumSleepIndex > 100 ? sumSleepIndex : sumSleepIndex ? sumSleepIndex : 0,
        arrRecordsMobile
      );
      // console.log('sleepRecord===================SOUND', sleepRecord);
      // console.log('arrRecordsMobile===================SOUND', arrRecordsMobile);

      if (sleepRecord != undefined) totalAverage.sleep_record = sleepRecord;
      else totalAverage.sleep_record = new SleepRecord();
    } else {
      // userAverage = null
      totalAverage.is_record_sleep = false;
      totalAverage.sleep_record = new SleepRecord();
    }

    return totalAverage;
  }

  //get user average by fitbit
  async getSelectionTodayUserAverageByFitbit(
    sleepRecordUserAverageFitbit: SleepRecords,
    all: bool,
    date: Date,
  ) {
    const listSleepRecordsLog = Array<SleepRecordsLog>();
    const userAverage = new SleepRecordUserAverage();
    const totalAverage = new TotalAverage();
    let startTimeFitbit = 0;
    let endTimeFitbit = 0;
    let sleepTimeFitbit = 0;
    let sleepQualityFitbit = 0;
    let numberOfWakesFitbit = 0;
    let timeAwakeFitbit = 0;
    // get fitbit
    if (sleepRecordUserAverageFitbit.details.length > 0) {
      for (let i = 0; i < sleepRecordUserAverageFitbit.details.length; i++) {
        const commonCode = await this.commonCodesService.getByid(
          sleepRecordUserAverageFitbit.details[i].type_id,
        );
        if (commonCode != null) {
          if (commonCode.code == SLEEP_TYPE.StartTime) {
            startTimeFitbit = sleepRecordUserAverageFitbit.details[i].value;
          }
          if (commonCode.code == SLEEP_TYPE.EndTime) {
            endTimeFitbit = sleepRecordUserAverageFitbit.details[i].value;
          }
          if (commonCode.code == SLEEP_TYPE.SleepTime) {
            sleepTimeFitbit = sleepRecordUserAverageFitbit.details[i].value;
          }
          if (commonCode.code == SLEEP_TYPE.SleepQuality) {
            sleepQualityFitbit = sleepRecordUserAverageFitbit.details[i].value;
          }
          if (commonCode.code == SLEEP_TYPE.NumberOfWakes) {
            numberOfWakesFitbit = sleepRecordUserAverageFitbit.details[i].value;
          }
          if (commonCode.code == SLEEP_TYPE.TimeAwake) {
            timeAwakeFitbit = sleepRecordUserAverageFitbit.details[i].value;
          }
        }
      }

      userAverage.start_time = parseFloat(startTimeFitbit?.toFixed(2));
      userAverage.end_time = parseFloat(endTimeFitbit?.toFixed(2));
      userAverage.sleep_time = parseFloat((sleepTimeFitbit / 60)?.toFixed(2));
      userAverage.sleep_time_seconds = sleepTimeFitbit * 60;
      userAverage.sleep_quality = parseFloat(sleepQualityFitbit?.toFixed(2));
      userAverage.awake_count = numberOfWakesFitbit;
      totalAverage.user_average = userAverage;
      // console.log('-----------------==========userAverage', userAverage);

      const arrRecordsMobile = Array<RecordsMobile>();


      //
      if (all == false) {
        if (userAverage != undefined) {
          totalAverage.is_record_sleep = true;
          //sum sleep index
          const sumSleepIndex = await this.calSleepIndex(
            userAverage,
            listSleepRecordsLog,
            date,
          );
          // console.log('-----------------==========sumSleepIndex', sumSleepIndex);
          // console.log('-----------------==========sleepTimeFitbit', sleepTimeFitbit);

          //sleepRecords
          const sleepRecord = await this.getSleepRecord(
            userAverage?.start_time,
            userAverage?.end_time,
            sleepTimeFitbit / 60,
            userAverage.sleep_time_seconds,
            false,
            numberOfWakesFitbit,
            false,
            timeAwakeFitbit,
            false,
            sumSleepIndex > 100 ? sumSleepIndex : sumSleepIndex ? sumSleepIndex : 0,
            arrRecordsMobile
          );
          if (sleepRecord != undefined) totalAverage.sleep_record = sleepRecord;
          else totalAverage.sleep_record = new SleepRecord();
        } else {
          // userAverage = null
          totalAverage.is_record_sleep = false;
          totalAverage.sleep_record = new SleepRecord();
        }
      }
    }

    return totalAverage;
  }

  //get sleep record
  async getSleepRecord(
    start_time: float,
    end_time: float,
    sleep_time: float,
    sleep_time_seconds: float,
    sleep_time_status: bool,
    awake_count: number,
    awake_count_status: bool,
    awake_time: number,
    awake_time_status: bool,
    sleep_point: number,
    records_mobile: Array<RecordsMobile>
  ) {
    const sleepRecord = new SleepRecord();
    //sleepRecords
    sleepRecord.start_time = start_time;
    sleepRecord.end_time = end_time;
    sleepRecord.sleep_time_seconds = sleep_time != undefined ? parseFloat((sleep_time * 3600).toFixed(4)) : 0;

    sleepRecord.sleep_time = sleep_time != undefined ? parseFloat(sleep_time.toFixed(4)) : 0;
    sleepRecord.sleep_time_status = sleep_time_status;
    sleepRecord.awake_count = awake_count;
    sleepRecord.awake_count_status = awake_count_status;
    sleepRecord.awake_time = awake_time;
    sleepRecord.awake_time_status = awake_time_status;
    sleepRecord.sleep_point = Math.round(sleep_point);
    sleepRecord.records_mobile = records_mobile;

    let awakeCountChange = await this.changeAwakened(awake_count)
    let sleepTimeChange = await this.changeSleepTime(sleep_time)
    // console.log("++++++awakeCountChange", awakeCountChange);
    // console.log("++++++sleepTimeChange", sleepTimeChange);

    // console.log("++++++awake_count", awake_count);
    // console.log("++++++sleep_time", sleep_time);

    return sleepRecord;
  }

  //get daily records by date and user
  async getDailyRecordByDateAndUser(userId: number, date: Date) {
    const alcolRecord = new RecordValue();
    const cafeRecord = new RecordValue();
    const napRecord = new RecordValue();
    const stressRecord = new RecordValue();
    const totalAverage = new TotalAverage();

    //get daily records by date and user
    const dailyRecord = await this.dailyRecordService.getInfoByDate(userId, date,);
    // console.log('dailyRecord', dailyRecord);
    if (dailyRecord != undefined) {
      const dailyRecordlList = await this.dailyRecordService.getListByDate(date);
      // console.log('dailyRecordlList', dailyRecordlList.length);

      const dailyRecordDetailList =
        await this.dailyRecordDetailService.getByDailyRecordId(dailyRecord.id);
      //get list daily detail by type alcol
      const dailyRecordDetailByTypeAlcols =
        await this.dailyRecordDetailService.getListByDailyRecordTypeAndDate(
          RECORDS_TYPE_ID.Alcohol,
          date,
        );
      //get list daily detail by type cafe
      const dailyRecordDetailByTypeCafes =
        await this.dailyRecordDetailService.getListByDailyRecordTypeAndDate(
          RECORDS_TYPE_ID.Caffeine,
          date,
        );

      // console.log('dailyRecordDetailByTypeAlcols', dailyRecordDetailByTypeAlcols, date,);
      // console.log('dailyRecordDetailByTypeCafes', dailyRecordDetailByTypeCafes, date,);

      if (dailyRecordDetailList.length > 0) {
        //sum alcol by list
        const sumAlcolVol = dailyRecordDetailByTypeAlcols.reduce((a, v) => (a = a + v.DailyRecordsDetail_vol), 0,);
        //sum cafe by list
        const sumCafeVol = dailyRecordDetailByTypeCafes.reduce((a, v) => (a = a + v.DailyRecordsDetail_vol), 0,);

        // console.log('sumAlcolVol', sumAlcolVol);
        // console.log('sumCafeVol', sumCafeVol);

        for (let index = 0; index < dailyRecordDetailList.length; index++) {
          //get by daily type record
          const commonCodeType = await this.commonCodesService.getByid(dailyRecordDetailList[index].type_id,);
          //get by time record
          const commonCodeTime = await this.commonCodesService.getByid(dailyRecordDetailList[index].time_id,);

          //Alcol
          if (
            dailyRecordDetailList[index].daily_type_id ==
            RECORDS_TYPE_ID.Alcohol
          ) {
            // console.log('dailyRecordDetailList[index].vol', dailyRecordDetailList[index].vol,);

            let sumAlcol =
              (dailyRecordDetailList[index].vol /
                (sumAlcolVol / dailyRecordlList.length)) *
              100; //total average alcol vol
            // console.log('sumAlcol', sumAlcol.toFixed(2));
            alcolRecord.name = commonCodeType?.name;
            alcolRecord.time = commonCodeTime?.name;
            alcolRecord.vol = dailyRecordDetailList[index].vol;
            if (
              dailyRecordDetailList[index].time_id ==
              TIME_ID.before_going_to_bed
            ) {
              // before_going_to_bed
              alcolRecord.status = false;
            } else {
              if (sumAlcol <= dailyRecordDetailList[index].vol)
                //total ancol vol > total average ancol vol
                alcolRecord.status = false;
              else alcolRecord.status = true;
            }
          }

          //Caffeine
          if (
            dailyRecordDetailList[index].daily_type_id ==
            RECORDS_TYPE_ID.Caffeine
          ) {
            let sumCafe =
              (dailyRecordDetailList[index].vol /
                (sumCafeVol / dailyRecordlList.length)) *
              100; // total average coffe vol
            // console.log(
            //   'dailyRecordDetailList[index].vol-cafe',
            //   dailyRecordDetailList[index].vol,
            // );
            // console.log('sumCafe', sumCafe.toFixed(2));
            cafeRecord.time = commonCodeTime?.name;
            cafeRecord.vol = dailyRecordDetailList[index].vol;
            if (
              dailyRecordDetailList[index].time_id ==
              TIME_ID.before_going_to_bed
            ) {
              // drink coffe before go to bed
              cafeRecord.status = false;
            } else {
              if (sumCafe <= dailyRecordDetailList[index].vol)
                // total coffe > total average coffe
                cafeRecord.status = false;
              else cafeRecord.status = true;
            }
          }
          //Nap time
          if (
            dailyRecordDetailList[index].daily_type_id == RECORDS_TYPE_ID.Nap
          ) {
            napRecord.name = commonCodeType?.name;
            napRecord.time = commonCodeTime?.name;
            if (
              dailyRecordDetailList[index].time_id ==
              TIME_ID.before_going_to_bed || //nap time before go to bed
              commonCodeType?.id == NAP_TIME_ID.more_2hour || // nap time more than 2 hour
              commonCodeType?.id == NAP_TIME_ID.more_than // nap time > 2h
            ) {
              napRecord.status = false;
            } else {
              if (
                commonCodeType?.id == NAP_TIME_ID.one_hour ||
                commonCodeType?.id == NAP_TIME_ID.two_hour
              )
                // nap time from 1-> < 2 hour
                napRecord.status = true;
            }
          }
          //stress
          if (
            dailyRecordDetailList[index].daily_type_id == RECORDS_TYPE_ID.Stress
          ) {
            stressRecord.name = commonCodeType?.name;
            stressRecord.time = commonCodeTime?.name;
            if (
              dailyRecordDetailList[index].time_id ==
              TIME_ID.before_going_to_bed ||
              commonCodeType.id == STRESS_ID.strong
            ) {
              //stress strong and stress before go to bed
              stressRecord.status = false;
            } else {
              if (
                commonCodeType?.id == STRESS_ID.weak ||
                commonCodeType?.id == STRESS_ID.usually
              )
                // stress: week and usually
                stressRecord.status = true;
            }
          }
        }
      }
      totalAverage.alcol_record = alcolRecord;
      totalAverage.cafe_record = cafeRecord;
      totalAverage.nap_record = napRecord;
      totalAverage.stress_record = stressRecord;
    }

    return totalAverage;
  }

  //get Data MobileAndFitbit By User
  async getEnvironmentMobileAndFitbitByUser(userId: number, date: Date) {
    const environmentRecordFitbit = new EnvironmentRecordFitbit();
    const environmentRecordMobile = new EnvironmentRecordMobile();
    const totalAverage = new TotalAverage();

    let environmentRecord =
      await this.environmentRecordService.getByDateAndUser(userId, date);
    let sumAll = 0;
    // console.log('environmentRecord', 'sumValue', environmentRecord);
    if (environmentRecord != null) {
      //get list detail
      if (environmentRecord.details.length > 0) {
        for (let i = 0; i < environmentRecord.details.length; i++) {
          //get evironment by type : mobile or fitbit
          const commonCode = await this.commonCodesService.getByid(
            environmentRecord.details[i].type_id,
          );
          // console.log('commonCode', 'sumValue', commonCode);
          if (commonCode != null) {
            // sum total average
            sumAll = await this.sumAverageValueEvironmentDetailByType(
              environmentRecord.details[i].type_id,
              environmentRecord.date,
            );
            const sumValue =
              (environmentRecord.details[i]?.value / sumAll) * 100; // sum total average
            // console.log('environment', 'sumValue', sumValue);
            //get data result from mobile
            if (
              environmentRecord.details[i].records_type_id ==
              ENVIRONMENT_TYPE_ID.Mobile
            ) {
              //get from mobile and type: number_of_steps
              if (
                commonCode.code == ENVIRONMENT_TYPE_DETAIL.mobile_step &&
                commonCode.parent_id == 80
              ) {
                // console.log(
                //   'environmentRecordMobile.mobile_step=========================',
                //   environmentRecord.details[i].value,
                // );
                environmentRecordMobile.mobile_step =
                  environmentRecord.details[i].value;
                if (environmentRecord.details[i].value > sumValue)
                  environmentRecordMobile.mobile_step_status = true;
                else environmentRecordMobile.mobile_step_status = false;
              }
              //get type: ambient_temperature
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.mobile_tem) {
                // console.log(
                //   'environment',
                //   'mobile_tem',
                //   environmentRecord.details[i].value,
                // );
                environmentRecordMobile.mobile_tem =
                  environmentRecord.details[i].value;
                if (
                  environmentRecord.details[i].value >=
                  ENVIRONMENT_TYPE_VALUE.TemperatureFrom &&
                  environmentRecord.details[i].value <=
                  ENVIRONMENT_TYPE_VALUE.TemperatureTo
                )
                  // Temperature ENVIRONMENT from 16-18 ^0
                  environmentRecordMobile.mobile_tem_status = true;
                else environmentRecordMobile.mobile_tem_status = false;
              }
              //get type: ambient_temperature
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.mobile_time) {
                // console.log(
                //   'environment',
                //   'mobile_time',
                //   environmentRecord.details[i].value,
                // );
                environmentRecordMobile.mobile_time =
                  environmentRecord.details[i].value;
                if (environmentRecord.details[i].value > sumValue)
                  environmentRecordMobile.mobile_time_status = false;
                else environmentRecordMobile.mobile_time_status = true;
              }
            }
            //get data result from fitbit
            if (
              environmentRecord.details[i].records_type_id ==
              ENVIRONMENT_TYPE_ID.Fitbit
            ) {
              //get type: number_of_steps
              if (
                commonCode.code == ENVIRONMENT_TYPE_DETAIL.fitbit_step &&
                commonCode.parent_id == ENVIRONMENT_FITBIT_TYPE
              ) {
                // console.log(
                //   'fitbit_step=========',
                //   environmentRecord.details[i].value,
                // );
                const sumValue =
                  (environmentRecord.details[i].value / sumAll) * 100;
                // console.log('fitbit_step======sumValue===', sumValue);
                environmentRecordFitbit.fitbit_step =
                  environmentRecord.details[i].value;
                if (environmentRecord.details[i].value > sumValue)
                  environmentRecordFitbit.fitbit_step_status = true;
                else environmentRecordFitbit.fitbit_step_status = false;
              }
              //get type: activity_time
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.fitbit_time) {
                // console.log(
                //   'fitbit_time=========',
                //   ENVIRONMENT_TYPE_DETAIL.fitbit_time,
                //   commonCode.code,
                // );
                environmentRecordFitbit.fitbit_time =
                  environmentRecord.details[i].value;
                //fitbit_time < total fitbit_time
                if (environmentRecord.details[i].value > sumValue)
                  environmentRecordFitbit.fitbit_time_status = false;
                else environmentRecordFitbit.fitbit_time_status = true;
              }
              //get type: distance_traveled
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.fitbit_distance) {
                // console.log(
                //   'fitbit_distance=========',
                //   ENVIRONMENT_TYPE_DETAIL.fitbit_distance,
                //   commonCode.code,
                // );
                environmentRecordFitbit.fitbit_distance =
                  environmentRecord.details[i].value;
                //fitbit_distance compare total distance
                if (environmentRecord.details[i].value > sumValue)
                  environmentRecordFitbit.fitbit_distance_status = true;
                else environmentRecordFitbit.fitbit_distance_status = false;
              }
              //get type: heart_rate
              if (
                commonCode.code == ENVIRONMENT_TYPE_DETAIL.fitbit_heart_rate
              ) {
                // console.log(
                //   'fitbit_heart_rate=========',
                //   ENVIRONMENT_TYPE_DETAIL.fitbit_heart_rate,
                //   commonCode.code,
                // );
                environmentRecordFitbit.fitbit_heart_rate =
                  environmentRecord.details[i].value;
                if (environmentRecord.details[i].value > sumValue)
                  environmentRecordFitbit.fitbit_heart_rate_status = true;
                else environmentRecordFitbit.fitbit_heart_rate_status = false;
              }
              //get type:sleep_score
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.sleep_score) {
                environmentRecordFitbit.sleep_score =
                  environmentRecord.details[i].value;
              }
              //get type:sleep_stages
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.sleep_stages) {
                environmentRecordFitbit.sleep_stages =
                  environmentRecord.details[i].value;
              }
              //get type:sleep_time
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.sleep_time) {
                environmentRecordFitbit.sleep_time =
                  environmentRecord.details[i].value;
                if (sumValue > environmentRecord.details[i].value)
                  environmentRecordFitbit.sleep_time_status = true;
                else environmentRecordFitbit.sleep_time_status = false;
              }
              //get type:nap_time
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.nap_time) {
                environmentRecordFitbit.nap_time =
                  environmentRecord.details[i].value;
              }
              //get type:un_known_time
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.un_known_time) {
                environmentRecordFitbit.un_known_time =
                  environmentRecord.details[i].value;
              }
              //get type:awake_time
              if (commonCode.code == ENVIRONMENT_TYPE_DETAIL.awake_time) {
                environmentRecordFitbit.awake_time =
                  environmentRecord.details[i].value;
              }
            }
          }
        }

        //add to mobile and fitbit
        totalAverage.environment_record_mobile = environmentRecordMobile;
        totalAverage.environment_record_fitbit = environmentRecordFitbit;
      }
    }

    return totalAverage;
  }

  //sum average value environment detail by type
  async sumAverageValueEvironmentDetailByType(typeId: number, date: Date) {
    let sumAll = 0;

    let environmentRecordAll = await this.environmentRecordService.getByDate(
      date,
    );
    if (environmentRecordAll.length > 0) {
      for (let i = 0; i < environmentRecordAll.length; i++) {
        const getListRecordType =
          await this.environmentRecordDetailService.getListRecordType(
            environmentRecordAll[i].id,
            typeId,
          );
        if (getListRecordType.length) {
          for (let j = 0; j < getListRecordType.length; j++) {
            sumAll += getListRecordType[j].value;
          }
        }
      }
    }

    let sumAverage = sumAll / environmentRecordAll.length;
    // console.log('sumAverage', sumAverage);
    return sumAverage;
  }

  //update by user
  async updateByUser(userId: number, model: SleepRecordFillableFields) {
    const sleepRecords = await this.sleepRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(model.date),
        deleted_at: null,
      },
    });
    if (sleepRecords) {
      sleepRecords.start_time = model.start_time;
      sleepRecords.end_time = model.end_time;
      sleepRecords.awake_count = model.awake_count;
      sleepRecords.sleep_eval = model.sleep_eval;
      sleepRecords.updated_at = new Date();

      return await this.sleepRecordRepository.save(sleepRecords);
    } else {
      const sleepRecordsNew = new SleepRecords();
      sleepRecordsNew.user_id = userId;
      sleepRecordsNew.date = DateHelper.getDate(model.date);
      sleepRecordsNew.created_at = new Date();
      sleepRecordsNew.start_time = model.start_time;
      sleepRecordsNew.end_time = model.end_time;
      sleepRecordsNew.awake_count = model.awake_count;
      sleepRecordsNew.sleep_eval = model.sleep_eval;
      return await this.sleepRecordRepository.save(sleepRecordsNew);
    }
  }

  //create
  async create(sleepRecord: SleepRecords) {
    sleepRecord.created_at = new Date();

    return await this.sleepRecordRepository.save(sleepRecord);
  }

  //delete in DB
  async delete(id: number) {
    const sleepRecordsDetailList =
      await this.sleepRecordsDetailService.getBySleepRecordId(id);
    const sleepRecordsLogList =
      await this.sleepRecordsLogService.getBySleepRecordId(id);
    //delete sleepRecordsLogList
    if (sleepRecordsLogList.length > 0) {
      for (let i = 0; i < sleepRecordsLogList.length; i++) {
        await this.sleepRecordsLogService.delete(sleepRecordsLogList[i].id);
      }
    }
    //delete sleepRecordsDetailList
    if (sleepRecordsDetailList.length > 0) {
      for (let j = 0; j < sleepRecordsDetailList.length; j++) {
        await this.sleepRecordsDetailService.delete(
          sleepRecordsDetailList[j].id,
        );
      }
    }
    //delete sleepRecords
    const sleepRecords = await this.sleepRecordRepository.delete(id);

    return sleepRecords;
  }

  //delete update
  async deleteUpdate(id: number) {
    // const deleteDetail = await this.sleepRecordsDetailService
    //   .createQueryBuilder()
    //   .delete()
    //   .from(SleepRecordsDetail)
    //   .where('sleep_records_id = :id', { id })
    //   .execute();
    // const post = await this.sleepRecordRepository
    //   .createQueryBuilder()
    //   .delete()
    //   .from(SleepRecords)
    //   .where('id = :id', { id })
    //   .execute();
    // if (!post) {
    //   throw new NotFoundException();
    // }

    const post = await this.sleepRecordRepository
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
  }

  async getSleepRecordByUserFeedback(userFeedbackId: number) {
    return await createQueryBuilder(UserFeedbackDetail, 'd')
      .leftJoin(SleepRecordsDetail, 'env', 'env.id = d.records_detail_id')
      .leftJoin(CommonCodes, 'type', 'type.id = env.type_id')
      .where('d.user_feedback_id = :user_feedback_id', {
        user_feedback_id: userFeedbackId,
      })
      .select([
        'd.user_feedback_id as user_feedback_id',
        'd.records_detail_id as records_detail_id',
        'env.type_id as type_id',
        'env.value as type_id',
        'type.name as type_name',
      ])
      .getRawMany();
  }

  //get data home screen sleep record history
  async getRecordDataHomeHistory(userId: number) {
    console.log("userId", userId);

    const sleepRecordHistoryList = new Array<SleepRecordDataHomeHistory>();
    const userAverage = new SleepRecordUserAverage();
    const sleeprecordsUserInput = await this.sleepRecordRepository.find({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      relations: ['details'],
      order: { id: 'DESC' },
      take: 10,
    });
    // console.log(
    //   '==============sleeprecordsUserInput.length=========1=====================',
    //   sleeprecordsUserInput,
    // );
    sleeprecordsUserInput.reverse();
    // console.log(
    //   '==============sleeprecordsUserInput.length==========2====================',
    //   sleeprecordsUserInput,
    // );
    //sleeprecordsUserInput.reverse()

    let startTime = 0;
    let endTime = 0;
    let sleepTime = 0;
    let sleep_eval = 0;
    let awake_count = 0;
    let sleep_Time = 0.0;

    if (sleeprecordsUserInput.length > 0) {
      for (let i = 0; i < sleeprecordsUserInput.length; i++) {
        const sleepTip = await this.getAllByDate(userId, sleeprecordsUserInput[i].date,);
        //console.log('==============sleepTip==============================', sleepTip);
        const listSleepRecordsLog = await this.sleepRecordsLogService.getBySleepRecordId(sleeprecordsUserInput[i].id,);
        // console.log('listSleepRecordsLog', listSleepRecordsLog.length);

        const sleepRecordHistory = new SleepRecordDataHomeHistory();

        // 1. get data fitbit
        if (sleeprecordsUserInput[i].details.length > 0) {
          // console.log('get data fitbit');
          // console.log('get data fitbit', sleeprecordsUserInput[i].id);
          //get data fitbit
          const sleepReciordDetailBySleepIdList = await this.sleepRecordsDetailService.getBySleepRecordId(sleeprecordsUserInput[i].id,);
          // console.log('get data fitbit======sleepReciordDetailBySleepIdList', sleepReciordDetailBySleepIdList,);
          //
          if (sleepReciordDetailBySleepIdList.length > 0) {
            let startTimeFitbit = 0;
            let endTimeFitbit = 0;
            let sleepTimeFitbit = 0;
            let sleepQualityFitbit = 0;
            let numberOfWakesFitbit = 0;
            for (let i = 0; i < sleepReciordDetailBySleepIdList.length; i++) {
              const commonCode = await this.commonCodesService.getByid(
                sleepReciordDetailBySleepIdList[i].type_id,
              );
              if (commonCode != null) {
                if (commonCode.code == SLEEP_TYPE.StartTime) {
                  startTimeFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.EndTime) {
                  endTimeFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.SleepTime) {
                  sleepTimeFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.SleepQuality) {
                  sleepQualityFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.NumberOfWakes) {
                  numberOfWakesFitbit =
                    sleepReciordDetailBySleepIdList[i].value;
                }
              }
            }
            //
            const startTime = parseFloat(startTimeFitbit.toFixed(2));
            const endTime = parseFloat(endTimeFitbit.toFixed(2));
            const sleepTime = parseFloat((sleepTimeFitbit / 60).toFixed(2));

            const userAverage = new SleepRecordUserAverage();
            userAverage.start_time = 0;// parseFloat(startTime.toFixed(2));
            userAverage.end_time = 0;//parseFloat(endTime.toFixed(2));
            userAverage.sleep_time = parseFloat(sleepTime.toFixed(2));
            userAverage.sleep_quality = parseFloat(
              sleepQualityFitbit.toFixed(2),
            );
            userAverage.awake_count = numberOfWakesFitbit;

            // sum sleep index fitbit
            const sumSleepIndexFitbit = await this.calSleepIndex(
              userAverage,
              listSleepRecordsLog,
              sleeprecordsUserInput[i].date,
            );
            // console.log('sumSleepIndexFitbit', sumSleepIndexFitbit);

            const startTime1 = moment(sleeprecordsUserInput[i].date).format(
              'YYYY-MM-DD HH:mm',
            );
            //add data
            sleepRecordHistory.date = startTime1;
            sleepRecordHistory.sleepTip = sleepTip.sleep_tip;
            sleepRecordHistory.sleepScore = Math.round(
              sumSleepIndexFitbit > 100
                ? sumSleepIndexFitbit
                : sumSleepIndexFitbit,
            );

            sleepRecordHistoryList.push(sleepRecordHistory);
          }
        }
        // 2. get data user input
        else if (sleeprecordsUserInput[i].details.length == 0 && sleeprecordsUserInput[i].start_time != null) {
          // console.log('-------------listSleepRecords===========USER=------------',);
          const startTime = await this.calHour(sleeprecordsUserInput[i].start_time,);
          const endTime = await this.calHour(sleeprecordsUserInput[i].end_time);
          // const sleepTime = parseFloat(endTime.toFixed(2)) - parseFloat(startTime.toFixed(2));

          var duration = moment.duration(
            moment(
              sleeprecordsUserInput[i]?.end_time,
              'YYYY-MM-DDThh:mm:ss',
            ).diff(
              moment(
                sleeprecordsUserInput[i]?.start_time,
                'YYYY-MM-DDThh:mm:ss',
              ),
            ),
          );
          // console.log('+++++duration=============', duration);
          const sleepTime = duration.asMinutes() / 60;

          //add model userAverage
          const userAverage = new SleepRecordUserAverage();
          userAverage.start_time = parseFloat(startTime.toFixed(2));
          userAverage.end_time = parseFloat(endTime.toFixed(2));
          userAverage.sleep_time = parseFloat(sleepTime.toFixed(2));
          userAverage.sleep_quality = sleeprecordsUserInput[i].sleep_eval;
          userAverage.awake_count = sleeprecordsUserInput[i].awake_count;

          // console.log('startTime', startTime);
          // console.log('endTime', endTime);
          // console.log('sleepTime', sleepTime);
          // console.log('userAverage=========USERINPUT', userAverage);/

          // sum sleep index
          const sumSleepIndex = await this.calSleepIndex(
            userAverage,
            listSleepRecordsLog,
            sleeprecordsUserInput[i].date,
          );
          // console.log('sumSleepIndex', sumSleepIndex);
          const startTime1 = moment(sleeprecordsUserInput[i].date).format(
            'YYYY-MM-DD HH:mm',
          );

          //add data
          sleepRecordHistory.date = startTime1;
          sleepRecordHistory.sleepTip = sleepTip.sleep_tip;
          sleepRecordHistory.sleepScore = Math.round(
            sumSleepIndex > 100 ? sumSleepIndex : sumSleepIndex,
          );

          sleepRecordHistoryList.push(sleepRecordHistory);
        }
        // 3. get data from record result  Sound
        else {//if (listSleepRecordsLog.length > 0) {
          // get data from record result  Sound
          // console.log('-------------listSleepRecords===========LOG=------------',);
          // record sound
          if (listSleepRecordsLog.length > 0) {
            // for (let i = 0; i < listSleepRecordsLog.length; i++) {
            //   startTime += await this.calHour(listSleepRecordsLog[i].start_time);
            //   endTime += await this.calHour(listSleepRecordsLog[i].end_time);
            //   sleepTime += listSleepRecordsLog[i].sleep_time;
            //   sleep_eval += sleep_eval;
            //   awake_count += listSleepRecordsLog[i].awake_count;

            // }

            for (let i = 0; i < listSleepRecordsLog.length; i++) {
              if (listSleepRecordsLog[i].sleep_time >= 3600) {
                startTime += await this.calHour(listSleepRecordsLog[i].start_time,);
                // console.log('startTime ========= SOUND', startTime, i);
                endTime += await this.calHour(listSleepRecordsLog[i].end_time);
                // console.log('endTime ========= SOUND', endTime, i);
                sleepTime += listSleepRecordsLog[i].sleep_time;
                sleep_eval += sleep_eval;
                awake_count += listSleepRecordsLog[i].awake_count;

                sleep_Time = sleepTime / 3600;
                // console.log('sleep_Time ===3600000000====== SOUND', sleep_Time);
                // console.log('sleepTime ========= SOUND', sleepTime);

                userAverage.start_time = 0; //parseFloat((startTime / sleepRecordsLogList.length).toFixed(2));
                userAverage.end_time = 0; //parseFloat((endTime / sleepRecordsLogList.length).toFixed(2));
                userAverage.sleep_time = parseFloat(sleep_Time.toFixed(2));
                userAverage.sleep_time_seconds = sleepTime;
                userAverage.sleep_quality = 0; //parseFloat((sleep_eval).toFixed(2));
                userAverage.awake_count = awake_count; // != undefined ? parseFloat((awake_count).toFixed(2)) : 0;
              }
            }
          }

          // console.log('listSleepRecordsLog====startTime', startTime);
          // console.log('listSleepRecordsLog====endTime', endTime);
          // console.log('listSleepRecordsLog====sleepTime', sleepTime);
          // console.log('listSleepRecordsLog====sleep_eval', sleep_eval);
          // console.log('listSleepRecordsLog====awake_count', awake_count);

          // const userAverage = new SleepRecordUserAverage();
          // userAverage.start_time = parseFloat(startTime.toFixed(2));
          // userAverage.end_time = parseFloat(endTime.toFixed(2));
          // userAverage.sleep_time = parseFloat((sleepTime / 3600).toFixed(2));
          // userAverage.sleep_quality = sleep_eval;
          // userAverage.awake_count = awake_count;

          // console.log('startTime', startTime);
          // console.log('endTime', endTime);
          // console.log('sleepTime', sleepTime);
          // console.log('userAverage', userAverage);

          // sum sleep index
          const sumSleepIndex = await this.calSleepIndex(
            userAverage,
            listSleepRecordsLog,
            sleeprecordsUserInput[i].date,
          );
          // console.log('sumSleepIndex', sumSleepIndex);
          const startTime1 = moment(sleeprecordsUserInput[i].date).format('YYYY-MM-DD HH:mm');

          if (isNaN(sumSleepIndex)) {
            // console.log('==========================sumSleepIndex==========================',);
          }
          //add data
          else sleepRecordHistory.date = startTime1;
          sleepRecordHistory.sleepTip = sleepTip.sleep_tip;
          sleepRecordHistory.sleepScore = Math.round(sumSleepIndex);
          sleepRecordHistoryList.push(sleepRecordHistory);
        }
      }
    }
    const sleepRecordNewHistoryList = new Array<SleepRecordDataHomeHistory>();
    // console.log('==========================sleepRecordHistoryList==========================', sleepRecordHistoryList,);

    for (let i = 0; i < sleepRecordHistoryList.length; i++) {
      if (isNaN(sleepRecordHistoryList[i].sleepScore)) {
        sleepRecordHistoryList
          .slice(0, i)
          .concat(
            sleepRecordHistoryList.slice(i + 1, sleepRecordHistoryList.length),
          );
      } else {
        sleepRecordNewHistoryList.push(sleepRecordHistoryList[i]);
      }
    }
    // console.log('==========================sleepRecordNewHistoryList==========================', sleepRecordNewHistoryList);
    let temp = []
    if (sleepRecordNewHistoryList.length > 0) {
      if (sleepRecordNewHistoryList.length < 4) {
        temp = sleepRecordNewHistoryList;
      } else {
        temp = sleepRecordNewHistoryList.slice(sleepRecordNewHistoryList.length - 4, sleepRecordNewHistoryList.length);
      }
    }
    // console.log('==========================temp==========================', temp);

    return temp;
  }

  // caculate date
  async calDate(date: Date) {
    // console.log('date============', date);
    let startTime = date != null ? parseFloat(moment(date).format('HH.mm')) : 0;
    // console.log('date_===', startTime);
    return startTime;
  }

  // caculate date
  async calHour(date: Date) {
    // console.log('date============', date);
    const hour = +moment(date).hour();
    // console.log('hour===============================>', hour);
    const minnute = +moment(date).minute();
    const duration = hour + minnute / 60;
    // console.log(
    //   'convert time:======================================== ',
    //   duration,
    // );

    return duration;
  }

  // duration date
  async durationTime(startDate: Date, endDate: Date) {
    var difference = endDate.getTime() - startDate.getTime();
    var duration = Math.round(difference / 60000);

    // console.log('duration============', duration);

    return duration;
  }
  // sum sleep score
  async calSleepScore(
    startTime: float,
    endTime: float,
    sleepTime: float,
    sleepQuality: float,
    awakeCount: number,
  ) {
    let awakeCountChange = await this.changeAwakened(awakeCount)
    let sleepTimeChange = sleepTime//await this.changeSleepTime(sleepTime)
    // const sleepPoint =  sleepTime + sleepQuality + awakeCount;
    let sleepPoint = sleepTimeChange + sleepQuality + awakeCountChange;

    // console.log('startTime============', startTime);
    // console.log('endTime============', endTime);
    // console.log('sleepTime============', sleepTime);
    // console.log('sleepQuality============', sleepQuality);
    // console.log('awakeCount============', awakeCount);

    // console.log('===========awakeCountChange============', awakeCountChange);
    // console.log('===============sleepTimeChange============', sleepTimeChange);

    // console.log('Math.round(sleepPoint)', Math.round(sleepPoint));
    // console.log('sleepPoint', sleepPoint);

    return sleepPoint;
  }

  // sum sleep index
  async calSleepIndex(userAverage: SleepRecordUserAverage, listSleepRecordsLog: SleepRecordsLog[], date: Date,) {
    //get sleepRecordsOverallAverageList
    const sleepRecordsOverallAverageList =
      await this.sleepRecordRepository.find({
        where: {
          date: DateHelper.getDate(date),
          deleted_at: null,
        },
        relations: ['details'],
      });

    let startTimeUserInputAll = 0;
    let endTimeUserInputAll = 0;
    let sleepTimeUserInputAll = 0;
    let sleepQualityUserInputAll = 0;
    let awakeCountUserInputAll = 0;

    let startTimeFitbitAll = 0;
    let endTimeFitbitAll = 0;
    let sleepTimeFitbitAll = 0;
    let sleepQualityFitbitAll = 0;
    let awakeCountFitbitAll = 0;

    // console.log('sleepRecordsOverallAverageList.length', sleepRecordsOverallAverageList.length, date,);
    // console.log('sleepRecordsOverallAverageList', sleepRecordsOverallAverageList,);
    // console.log('listSleepRecordsLog.length.length', listSleepRecordsLog.length,);
    // console.log('listSleepRecordsLog.userAverage', userAverage);

    if (sleepRecordsOverallAverageList.length > 0) {
      for (let i = 0; i < sleepRecordsOverallAverageList.length; i++) {
        const SleepRecordsLogs = await this.sleepRecordsLogService.getBySleepRecordId(sleepRecordsOverallAverageList[i].id,);

        // 1. get data result from fitbit
        if (sleepRecordsOverallAverageList[i].details.length > 0) {
          // console.log('get data fitbit');
          const sleepReciordDetailBySleepIdList = await this.sleepRecordsDetailService.getBySleepRecordId(sleepRecordsOverallAverageList[i].id,);
          //
          if (sleepReciordDetailBySleepIdList.length > 0) {
            let startTimeFitbit = 0;
            let endTimeFitbit = 0;
            let sleepTimeFitbit = 0;
            let sleepQualityFitbit = 0;
            let numberOfWakesFitbit = 0;
            for (let i = 0; i < sleepReciordDetailBySleepIdList.length; i++) {
              const commonCode = await this.commonCodesService.getByid(
                sleepReciordDetailBySleepIdList[i].type_id,
              );
              if (commonCode != null) {
                if (commonCode.code == SLEEP_TYPE.StartTime) {
                  startTimeFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.EndTime) {
                  endTimeFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.SleepTime) {
                  sleepTimeFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.SleepQuality) {
                  sleepQualityFitbit = sleepReciordDetailBySleepIdList[i].value;
                }
                if (commonCode.code == SLEEP_TYPE.NumberOfWakes) {
                  numberOfWakesFitbit =
                    sleepReciordDetailBySleepIdList[i].value;
                }
              }
            }
            //
            const startTime = parseFloat(startTimeFitbit?.toFixed(2));
            const endTime = parseFloat(endTimeFitbit?.toFixed(2));
            const sleepTime = parseFloat((sleepTimeFitbit / 60)?.toFixed(2));
            // console.log('sleepTime======sleepTimeFitbit=======', sleepTime, sleepTimeFitbit);

            awakeCountUserInputAll = awakeCountUserInputAll + await this.changeAwakened(numberOfWakesFitbit)
            sleepTimeUserInputAll = sleepTimeUserInputAll + sleepTime// await this.changeSleepTime(sleepTime)

            startTimeUserInputAll = startTimeUserInputAll + startTime;
            endTimeUserInputAll = endTimeUserInputAll + endTime;
            //sleepTimeUserInputAll = sleepTimeUserInputAll + sleepTime;
            sleepQualityUserInputAll = sleepQualityUserInputAll + sleepQualityFitbit;
            //  awakeCountUserInputAll = awakeCountUserInputAll + numberOfWakesFitbit;
            // console.log('awakeCountUserInputAll======1=======', awakeCountUserInputAll,);
            // console.log('sleepTimeUserInputAll======1=======', sleepTimeUserInputAll,);



            // console.log('startTimeFITBITAll===========', startTimeUserInputAll);
            // console.log('endTimeFITBITAll===========', endTimeUserInputAll);
            // console.log('sleepTimeFITBITAll=============', sleepTimeUserInputAll,);
            // console.log('sleepQualityFITBITAll=============', sleepQualityUserInputAll,);
            // console.log('awakeCountFITBITAll=============', awakeCountUserInputAll,);
          }
        }
        // 2. get data user input
        else if (sleepRecordsOverallAverageList[i].details.length == 0 && sleepRecordsOverallAverageList[i]?.start_time != null) {
          const start_time = await this.calHour(sleepRecordsOverallAverageList[i].start_time,);
          const end_time = await this.calHour(sleepRecordsOverallAverageList[i].end_time,);
          // const sleep_time = end_time - start_time;
          var duration = moment.duration(
            moment(sleepRecordsOverallAverageList[i]?.end_time, 'YYYY-MM-DDThh:mm:ss').diff(
              moment(sleepRecordsOverallAverageList[i]?.start_time, 'YYYY-MM-DDThh:mm:ss'),
            ),
          );
          // console.log('+++++duration=============', duration);
          const sleep_time = duration.asMinutes() / 60;
          // console.log('+++++sleep_time=============', sleep_time);
          // console.log('+++++sleepTimeUserInputAll=============', sleepTimeUserInputAll);

          awakeCountUserInputAll = awakeCountUserInputAll + await this.changeAwakened(awakeCountUserInputAll ?? 0)
          sleepTimeUserInputAll = sleepTimeUserInputAll + sleep_time//await this.changeSleepTime(sleep_time ?? 0)

          startTimeUserInputAll = startTimeUserInputAll + start_time;
          endTimeUserInputAll = endTimeUserInputAll + end_time;
          //  sleepTimeUserInputAll = sleepTimeUserInputAll + sleep_time;
          sleepQualityUserInputAll = sleepQualityUserInputAll + sleepRecordsOverallAverageList[i].sleep_eval;
          //  awakeCountUserInputAll = awakeCountUserInputAll + sleepRecordsOverallAverageList[i]?.awake_count;

          // console.log('start_time===========', start_time);
          // console.log('end_time===========', end_time);
          // console.log('sleep_time=============', sleep_time);

          // console.log('startTimeUserInputAll===========', startTimeUserInputAll,);
          // console.log('endTimeUserInputAll===========', endTimeUserInputAll);
          // console.log('sleepTimeUserInputAll=============', sleepTimeUserInputAll,);
          // console.log('sleepQualityUserInputAll=============', sleepQualityUserInputAll,);
          // console.log('awakeCountUserInputAll=============', awakeCountUserInputAll,);
        }
        // 3. get data result from sound record
        else {//if (SleepRecordsLogs.length > 0) {
          //if (sleepRecordsOverallAverageList[i].details.length == 0 && SleepRecordsLogs.length > 0) {
          let startTime = 0;
          let endTime = 0;
          let sleepTime = 0;
          let sleep_eval = 0;
          let awake_count = 0;

          //sum data record sound
          for (let i = 0; i < SleepRecordsLogs.length; i++) {
            if (SleepRecordsLogs[i].sleep_time >= 3600) {
              startTime += 0; //await this.calHour(SleepRecordsLogs[i]?.start_time,);
              endTime += 0; // await this.calHour(SleepRecordsLogs[i]?.end_time);
              sleepTime += SleepRecordsLogs[i]?.sleep_time;
              sleep_eval += 0; // sleep_eval;
              awake_count += SleepRecordsLogs[i].awake_count;

              // console.log('startTimesound record======startTime=====', startTime,);
              // console.log('endTimesound record======endTime=====', endTime);
              // console.log('sleepTimesound record======sleepTime=======', sleepTime,);
              // console.log('sleepTimesound record======sleep_eval=======', sleep_eval,);
              // console.log('sleepTimesound record======awake_count=======', awake_count,);

              awakeCountUserInputAll = awakeCountUserInputAll + await this.changeAwakened(awake_count)
              sleepTimeUserInputAll = sleepTimeUserInputAll + (sleepTime / 3600)//await this.changeSleepTime(sleepTime / 3600)

              startTimeUserInputAll = startTimeUserInputAll + startTime;
              endTimeUserInputAll = endTimeUserInputAll + endTime;
              //sleepTimeUserInputAll = sleepTimeUserInputAll + sleepTime;
              //  awakeCountUserInputAll = awakeCountUserInputAll + awake_count;
              // sleepTimeUserInputAll = parseFloat(  (sleepTimeUserInputAll / 3600).toFixed(2),  );
            }
          }
        }
      }
    }

    startTimeUserInputAll = parseFloat(startTimeUserInputAll.toFixed(2));
    endTimeUserInputAll = parseFloat(endTimeUserInputAll.toFixed(2));
    sleepTimeUserInputAll = parseFloat(sleepTimeUserInputAll.toFixed(2));
    awakeCountUserInputAll = awakeCountUserInputAll;
    sleepQualityUserInputAll = parseFloat(sleepQualityUserInputAll.toFixed(2));

    // console.log('startTimeUserInputAll', startTimeUserInputAll);
    // console.log('endTimeUserInputAll', endTimeUserInputAll);
    // console.log('sleepTimeUserInputAll', sleepTimeUserInputAll);
    // console.log('sleepQualityUserInputAll', sleepQualityUserInputAll);
    // console.log('awakeCountUserInputAll', awakeCountUserInputAll);
    // sum sleep index
    const sleepIndexUser = await this.calSleepScore(
      userAverage.start_time,
      userAverage.end_time,
      userAverage.start_time > 0 ? userAverage.sleep_time : userAverage.sleep_time,
      // userAverage.sleep_time,
      // sleepTimeUserInputAll,
      userAverage.sleep_quality,
      userAverage.awake_count,
    );

    //sleepTimeUserInputAll = parseFloat((sleepTimeUserInputAll / 3600).toFixed(2))

    // console.log('startTimeUserInputAll===========sound============', startTimeUserInputAll,);
    // console.log('endTimeUserInputAll===========sound============', endTimeUserInputAll,);
    // console.log('sleepTimeUserInputAll===========sound============', sleepTimeUserInputAll,);
    // console.log('sleepQualityUserInputAll===========sound============', sleepQualityUserInputAll,);
    // console.log('awakeCountUserInputAll===========sound============', awakeCountUserInputAll,);

    // calc sleep index all user input
    // const sleepIndexUserInputTotal = await this.calSleepScore(
    //   startTimeUserInputAll,
    //   endTimeUserInputAll,
    //   sleepTimeUserInputAll,
    //   sleepQualityUserInputAll,
    //   awakeCountUserInputAll,
    // );
    const sleepIndexUserInputTotal = sleepTimeUserInputAll + sleepQualityUserInputAll + awakeCountUserInputAll;

    // //get detail list
    // const sleepRecordDetails = await this.sleepRecordsDetailService.getDetailByDate(date);
    // console.log('sleepRecordDetails=length==========sleepRecordDetails============', sleepRecordDetails.length,);
    // if (sleepRecordDetails.length > 0) {
    //   //sum detail
    //   startTimeFitbitAll = sleepRecordDetails.reduce((a, v) => (a = a + (v.SleepRecordsDetail_type_id == RECORDS_SLEEP_TYPE_FITBIT.StartTime ? v.SleepRecordsDetail_value : 0)), 0,);
    //   endTimeFitbitAll = sleepRecordDetails.reduce((a, v) => (a = a + (v.SleepRecordsDetail_type_id == RECORDS_SLEEP_TYPE_FITBIT.EndTime ? v.SleepRecordsDetail_value : 0)), 0,);
    //   // sleepTimeFitbitAll = await sleepRecordDetails.reduce((a, v) => (a = a + (v.SleepRecordsDetail_type_id == RECORDS_SLEEP_TYPE_FITBIT.SleepTime ? (v.SleepRecordsDetail_value > 0 ? await this.changeAwakened(v.SleepRecordsDetail_value).then(res => { return res }) : 0) : 0)), 0,);
    //   //  awakeCountFitbitAll = await sleepRecordDetails.reduce((a, v) => (a = a + (v.SleepRecordsDetail_type_id == RECORDS_SLEEP_TYPE_FITBIT.NumberOfWakes ? (v.SleepRecordsDetail_value > 0 ? (this.changeAwakened(v.SleepRecordsDetail_value).then(res => { return res })) : 0) : 0)), 0,);
    // }
    // for (let i = 0; i < sleepRecordDetails.length; i++) {
    //   if (sleepRecordDetails[i].SleepRecordsDetail_type_id == RECORDS_SLEEP_TYPE_FITBIT.SleepTime) {
    //     sleepTimeFitbitAll += await this.changeSleepTime(sleepRecordDetails[i].SleepRecordsDetail_value)
    //     console.log('sleepTimeFitbitAll====', sleepTimeFitbitAll, i);
    //     console.log('sleepTimeFitbitAll====sleepRecordDetails[i].SleepRecordsDetail_value====', sleepRecordDetails[i].SleepRecordsDetail_value);
    //   }
    //   if (sleepRecordDetails[i].SleepRecordsDetail_type_id == RECORDS_SLEEP_TYPE_FITBIT.NumberOfWakes) {
    //     awakeCountFitbitAll += await this.changeAwakened(sleepRecordDetails[i].SleepRecordsDetail_value)
    //     console.log('awakeCountFitbitAll====', awakeCountFitbitAll, i);
    //     console.log('awakeCountFitbitAll====sleepRecordDetails[i].SleepRecordsDetail_value', sleepRecordDetails[i].SleepRecordsDetail_value);

    //   }
    // }

    // console.log('startTimeFitbitAll', startTimeFitbitAll);
    // console.log('endTimeFitbitAll', endTimeFitbitAll);
    // console.log('sleepTimeFitbitAll', sleepTimeFitbitAll);
    // console.log('awakeCountFitbitAll', awakeCountFitbitAll);

    const sleepIndexFitbitTotal = sleepTimeFitbitAll + sleepQualityFitbitAll + awakeCountFitbitAll;

    // console.log('userAverage==============================', userAverage);
    // console.log('member score: ', sleepIndexUser);
    // console.log('sleepIndexUserInputTotal', sleepIndexUserInputTotal);
    // console.log('sleepIndexFitbitTotal', sleepIndexFitbitTotal);
    // console.log('total record, date: ', sleepRecordsOverallAverageList.length, date,);

    //sum sleep index
    const sleepIndexAll = (sleepIndexUserInputTotal + sleepIndexFitbitTotal) /// sleepRecordsOverallAverageList.length;
    // console.log('total score: ', sleepIndexAll);

    //const sum = (((sleepIndexUser / sleepIndexAll) * 100) / TOTAL_SCORE) * 100;
    const sum = (sleepIndexUser / TOTAL_SCORE) * 100;

    // console.log('member index: ', sum);

    const sleepIndex = Math.round(sum);
    // console.log('sleepIndex', sleepIndex);

    //add userAverage
    userAverage.change_awake_count = await this.changeAwakened(userAverage.awake_count)
    userAverage.change_sleep_time = userAverage.sleep_time//await this.changeSleepTime(userAverage.sleep_time)
    userAverage.change_awake_count_all = awakeCountUserInputAll + awakeCountFitbitAll
    userAverage.change_sleep_time_all = sleepTimeUserInputAll + sleepTimeFitbitAll
    userAverage.change_sleep_quality_all = sleepQualityUserInputAll + sleepQualityFitbitAll
    userAverage.total_record = sleepRecordsOverallAverageList.length

    return sleepIndex;
  }

  //sleep tip
  async sleepTip(totalAverage: TotalAverage) {
    let sleepTip = '';
    //common code by sleep tip type environment
    const commonCodesEnv = await this.commonCodesService.getListByParent(
      SLEEP_TIP_TYPE_ID.sleep_tip_environment,
    );
    //common code by sleep tip type daily record
    const commonCodesDaily = await this.commonCodesService.getListByParent(
      SLEEP_TIP_TYPE_ID.sleep_tip_daily_record,
    );

    // sleep tip by environment
    if (commonCodesEnv.length > 0) {
      commonCodesEnv.forEach((element) => {
        if (element.id == SLEEP_TIP.tip_env_number_of_steps) {
          // number of steps < 3000
          if (
            totalAverage?.environment_record_fitbit?.fitbit_step <
            ENVIRONMENT_TYPE_VALUE.NumberOfStep
          )
            sleepTip = element.value;
        }
        if (element.id == SLEEP_TIP.tip_env_phone_log) {
          //phone log time > 2 hour
          if (
            totalAverage?.environment_record_mobile?.mobile_time <
            ENVIRONMENT_TYPE_VALUE.PhoneLog
          )
            sleepTip = sleepTip + ' # ' + element.value;
        }
        if (element.id == SLEEP_TIP.tip_env_ambient_temperature) {
          //Temperature in 16-18 ^C
          if (
            totalAverage?.environment_record_mobile?.mobile_tem >=
            ENVIRONMENT_TYPE_VALUE.TemperatureFrom &&
            totalAverage?.environment_record_mobile?.mobile_tem >=
            ENVIRONMENT_TYPE_VALUE.TemperatureTo
          )
            sleepTip = sleepTip + ' # ' + element.value;
        }
        if (element.id == SLEEP_TIP.tip_env_heart_rate) {
          //HeartRate < 100
          if (
            totalAverage?.environment_record_fitbit?.fitbit_heart_rate <
            ENVIRONMENT_TYPE_VALUE.HeartRate
          )
            sleepTip = sleepTip + ' # ' + element.value;
        }
      });
    }
    // sleep tip by daily record
    if (commonCodesDaily.length > 0) {
      commonCodesDaily.forEach((element) => {
        if (element.id == SLEEP_TIP.tip_daily_alcohol_1) {
          //if drink ancol before_going_to_bed
          if (
            totalAverage.alcol_record.time == TIME_VALUE.before_going_to_bed
          ) {
            sleepTip = sleepTip + ' # ' + element.value;
          }
        }
        if (element.id == SLEEP_TIP.tip_daily_alcohol_2) {
          //if drink ancol before_going_to_bed and more than average
          if (
            totalAverage.alcol_record.time != TIME_VALUE.before_going_to_bed &&
            totalAverage.alcol_record.status == false
          ) {
            sleepTip = sleepTip + ' # ' + element.value;
          }
        }
        if (element.id == SLEEP_TIP.tip_daily_cafe_1) {
          //if drink cafe before_going_to_bed
          if (totalAverage.cafe_record.time == TIME_VALUE.before_going_to_bed) {
            sleepTip = sleepTip + ' # ' + element.value;
          }
        }
        if (element.id == SLEEP_TIP.tip_daily_cafe_2) {
          //if drink cafe before_going_to_bed and more than average
          if (
            totalAverage.cafe_record.time != TIME_VALUE.before_going_to_bed &&
            totalAverage.cafe_record.status == false
          ) {
            sleepTip = sleepTip + ' # ' + element.value;
          }
        }
        if (element.id == SLEEP_TIP.tip_daily_nap_1) {
          //if nap before_going_to_bed
          if (totalAverage?.nap_record.time == TIME_VALUE.before_going_to_bed) {
            sleepTip = sleepTip + ' # ' + element.value;
          }
        }
        if (element.id == SLEEP_TIP.tip_daily_nap_2) {
          //if nap before_going_to_bed and total nap time > 2 hour
          if (
            totalAverage?.nap_record.time == TIME_VALUE.before_going_to_bed &&
            totalAverage?.nap_record.status == false
          ) {
            sleepTip = sleepTip + ' # ' + element.value;
          }
        }
        if (element.id == SLEEP_TIP.tip_daily_stress) {
          //if stress strong before going to bed
          if (totalAverage?.stress_record.status == false) {
            sleepTip = sleepTip + ' # ' + element.value;
          }
        }
      });
    }
    if (sleepTip == '') {
      sleepTip = TIME_VALUE.no_content_doc;
    }
    // console.log('==========================sleepTip', sleepTip);
    return sleepTip;
  }

  //add user feedback detail
  async addFeedbackDetail(
    usersFeedback: UsersFeedback,
    sleepRecord: SleepRecords,
  ): Promise<void> {
    //get all sleep record bay date
    const sleepRecordsOverallAverageList =
      await this.sleepRecordRepository.find({
        where: {
          date: DateHelper.getDate(usersFeedback?.feedback_date),
          deleted_at: null,
        },
        relations: ['details'],
      });

    //get sleep record log
    const listSleepRecordsLog =
      await this.sleepRecordsLogService.getBySleepRecordId(sleepRecord.id);

    let sumAwakeTime = sleepRecordsOverallAverageList.reduce(
      (a, v) => (a = a + (v.awake_count != null ? v.awake_count : 0)),
      0,
    );
    let sumSleepEval = sleepRecordsOverallAverageList.reduce(
      (a, v) => (a = a + (v.sleep_eval != null ? v.sleep_eval : 0)),
      0,
    );
    let lenghtRecordAll = sleepRecordsOverallAverageList.length;
    if (sleepRecord != undefined) {
      if (
        sleepRecord?.details?.length == 0 &&
        listSleepRecordsLog.length == 0
      ) {
        //get data record user input
        var detail = new UserFeedbackDetail();
        detail.records_detail_id = sleepRecord.id;
        //status awake_count
        if (sleepRecord?.awake_count > sumAwakeTime / lenghtRecordAll)
          detail.status = STATUS_RECORD.UnLike;
        else detail.status = STATUS_RECORD.Like;
        //status sleep_eval
        if (sleepRecord?.sleep_eval > sumSleepEval / lenghtRecordAll)
          detail.status = STATUS_RECORD.UnLike;
        else detail.status = STATUS_RECORD.Like;

        detail.created_at = new Date();
        detail.userFeedback = usersFeedback;

        //add feedback detail
        await this.userFeedbackDetailService.create(detail);
      } else if (sleepRecord?.details?.length > 0) {
        //get data record fitbit
        const sleepRecordsDetails =
          await this.sleepRecordsDetailService.getBySleepRecordId(
            usersFeedback.records_id,
          );
        if (sleepRecordsDetails.length > 0) {
          for (let index = 0; index < sleepRecordsDetails.length; index++) {
            const element = sleepRecordsDetails[index];
            var detail = new UserFeedbackDetail();
            detail.records_detail_id = element.id;
            detail.status = null;
            detail.created_at = new Date();
            detail.userFeedback = usersFeedback;

            //add feedback detail
            await this.userFeedbackDetailService.create(detail);
          }
        }
      } else {
        //get data record sound log
        const sleepRecordsLogs =
          await this.sleepRecordsLogService.getBySleepRecordId(
            usersFeedback.records_id,
          );
        if (sleepRecordsLogs.length > 0) {
          for (let index = 0; index < sleepRecordsLogs.length; index++) {
            //get data record user input
            let sumAwakeTimeLog = sleepRecordsLogs.reduce(
              (a, v) => (a = a + (v.awake_count != null ? v.awake_count : 0)),
              0,
            );
            let sumSleepTimeLog = sleepRecordsLogs.reduce(
              (a, v) => (a = a + (v.sleep_time != null ? v.sleep_time : 0)),
              0,
            );
            let sumAllAwake =
              (sumAwakeTimeLog + sumAwakeTime) / lenghtRecordAll;
            let sumAllSleepEval =
              (sumSleepTimeLog + sumSleepEval) / lenghtRecordAll;

            const element = sleepRecordsLogs[index];
            var detail = new UserFeedbackDetail();
            detail.records_detail_id = element.id;

            //status awake_count
            if (element?.awake_count < sumAllAwake)
              detail.status = STATUS_RECORD.Like;
            else detail.status = STATUS_RECORD.UnLike;
            //status sleep_eval
            if (element?.sleep_time < sumAllSleepEval)
              detail.status = STATUS_RECORD.Like;
            else detail.status = STATUS_RECORD.UnLike;

            detail.created_at = new Date();
            detail.userFeedback = usersFeedback;

            //add feedback detail
            await this.userFeedbackDetailService.create(detail);
          }
        }
      }
    }
  }

  //get data result by date
  async getAllByDateTestAdmin(userId: number, date: Date) {
    console.log('userId-date', userId, date);
    const totalAverageList = Array<TotalAverage>();
    const totalAverage = new TotalAverage();

    //get sleepRecordUserAverage user input
    const sleepRecordUserAverage = await this.sleepRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(date),
        deleted_at: null,
      },
      relations: ['details'],
    });

    //get sleepRecordsOverallAverageList
    const sleepRecordsOverallAverageList =
      await this.sleepRecordRepository.find({
        where: {
          date: DateHelper.getDate(date),
          deleted_at: null,
        },
        relations: ['details'],
      });
    // console.log(
    //   'sleepRecordUserAverage==sssss=======================',
    //   sleepRecordUserAverage,
    //   date,
    //   DateHelper.getDate(date),
    // );
    // console.log(
    //   'sleepRecordsOverallAverageList',
    //   sleepRecordsOverallAverageList.length,
    // );

    // 1:add Sleep Record UserAverage
    if (sleepRecordUserAverage != undefined) {
      const listSleepRecordsLog =
        await this.sleepRecordsLogService.getBySleepRecordId(
          sleepRecordUserAverage.id,
        );
      // console.log('listSleepRecordsLog', listSleepRecordsLog.length);

      // 1.1 get data result from Fitbit
      if (sleepRecordUserAverage?.details?.length > 0) {
        const dailyRecordFitbit =
          await this.getSelectionTodayUserAverageByFitbit(
            sleepRecordUserAverage,
            false,
            date,
          );
        // console.log(
        //   '----------------------dailyRecordFitbit',
        //   dailyRecordFitbit,
        // );
        if (dailyRecordFitbit != undefined) {
          totalAverage.sleep_record = dailyRecordFitbit.sleep_record;
          totalAverage.user_average = dailyRecordFitbit.user_average;
          totalAverage.overall_average = dailyRecordFitbit.overall_average;
        }

        //add list total
        totalAverageList.push(totalAverage);
      }

      // 1.2 get data result from user input
      else if (
        sleepRecordUserAverage?.details?.length == 0 &&
        sleepRecordUserAverage.start_time != null
      ) {
        const totalAverageModel = await this.getSelectionTodayUserAverage(
          sleepRecordUserAverage,
          sleepRecordsOverallAverageList,
          date,
        );
        if (totalAverageModel != undefined) {
          totalAverage.user_average = totalAverageModel.user_average;
          totalAverage.overall_average = totalAverageModel.overall_average;
          totalAverage.sleep_record = totalAverageModel.sleep_record;
        }

        //add list total
        totalAverageList.push(totalAverage);
      }
      //1.3 get data result from record sound
      else {
        // console.log('----------------------dailyRecordSOUND==================');
        const totalAverageModel =
          await this.getSelectionTodayUserAverageBySoundRecord(
            sleepRecordUserAverage,
            sleepRecordsOverallAverageList,
            listSleepRecordsLog,
            date,
          );
        if (totalAverageModel != undefined) {
          // console.log('totalAverageModel', totalAverageModel);
          totalAverage.user_average = totalAverageModel.user_average;
          totalAverage.overall_average = totalAverageModel.overall_average;
          totalAverage.sleep_record = totalAverageModel.sleep_record;
        }

        //add list total
        totalAverageList.push(totalAverage);
      }
    }

    //  2: add Sleep Record OverallAverage
    let overallAverage = new SleepRecordOverallAverage();
    // console.log(
    //   'sleepRecordsOverallAverageList============lenght=============',
    //   sleepRecordsOverallAverageList.length,
    // );
    if (sleepRecordsOverallAverageList.length > 0) {
      //sum sleep quality
      let sumOverallSleepQuality = await this.sumSleepQuality(
        sleepRecordsOverallAverageList,
        sleepRecordUserAverage != undefined
          ? sleepRecordUserAverage.sleep_eval
          : 0,
      );
      for (let i = 0; i < sleepRecordsOverallAverageList.length; i++) {
        // console.log(
        //   'sleepRecordsOverallAverageList[i].details.length',
        //   sleepRecordsOverallAverageList[i].details.length,
        // );
        const listSleepRecordsLog =
          await this.sleepRecordsLogService.getBySleepRecordId(
            sleepRecordsOverallAverageList[i].id,
          );
        // let overallAverageModel = new SleepRecordOverallAverage();

        //2.1get data result from fitbit
        if (sleepRecordsOverallAverageList[i].details.length > 0) {
          const dataFitbit = await this.getSelectionTodayUserAverageByFitbit(
            sleepRecordsOverallAverageList[i],
            true,
            date,
          );
          if (dataFitbit != undefined) {
            // add to overallAverage
            overallAverage.start_time += parseFloat(
              (dataFitbit?.user_average?.start_time).toFixed(2),
            );
            overallAverage.end_time += parseFloat(
              (dataFitbit?.user_average?.end_time).toFixed(2),
            );
            overallAverage.sleep_time += parseFloat(
              (dataFitbit?.user_average?.sleep_time).toFixed(2),
            );
            overallAverage.awake_count += dataFitbit?.user_average?.awake_count;

            totalAverage.overall_average = overallAverage;
            // console.log(
            //   '-------------dataFitbit--------overallAverage------------------------',
            //   overallAverage,
            // );
          }
        }

        //2.2 get data result from user input
        else if (
          sleepRecordsOverallAverageList[i].details.length == 0 &&
          sleepRecordsOverallAverageList[i].start_time != null
        ) {
          const startTimeOverall = await this.calHour(
            sleepRecordsOverallAverageList[i].start_time,
          );
          const endTimeOverall = await this.calHour(
            sleepRecordsOverallAverageList[i].end_time,
          );
          const sleepTimeOverall = endTimeOverall - startTimeOverall;

          if (overallAverage.start_time == undefined) {
            //add overallAverage
            overallAverage.start_time = parseFloat(startTimeOverall.toFixed(2));
            overallAverage.end_time = parseFloat(endTimeOverall.toFixed(2));
            overallAverage.sleep_time = parseFloat(sleepTimeOverall.toFixed(2));
            overallAverage.awake_count =
              sleepRecordsOverallAverageList[i].awake_count;
            overallAverage.sleep_quality = parseFloat(
              sumOverallSleepQuality.toFixed(2),
            );

            totalAverage.overall_average = overallAverage;
          } else {
            //add to overallAverage
            overallAverage.start_time += parseFloat(
              startTimeOverall.toFixed(2),
            );
            overallAverage.end_time += parseFloat(endTimeOverall.toFixed(2));
            overallAverage.sleep_time += parseFloat(
              sleepTimeOverall.toFixed(2),
            );
            overallAverage.awake_count +=
              sleepRecordsOverallAverageList[i].awake_count;
            totalAverage.overall_average = overallAverage;
          }
        }
        //2.3 get data result from record sound
        else {
          // const listSleepRecordsLog = await this.sleepRecordsLogService.getBySleepRecordId(sleepRecordsOverallAverageList[i].id);
          // console.log(
          //   '=============listSleepRecordsLog========================',
          //   listSleepRecordsLog.length,
          // );
          const totalAverageModel =
            await this.getSelectionTodayUserAverageBySoundRecord(
              sleepRecordUserAverage,
              sleepRecordsOverallAverageList,
              listSleepRecordsLog,
              date,
            );
          // console.log(
          //   '=============totalAverageModel========================',
          //   totalAverageModel,
          // );

          if (totalAverageModel != undefined) {
            overallAverage.start_time =
              totalAverageModel?.user_average?.start_time != undefined
                ? parseFloat(
                  (totalAverageModel?.user_average?.start_time).toFixed(2),
                )
                : 0;
            overallAverage.end_time =
              totalAverageModel?.user_average?.end_time != undefined
                ? parseFloat(
                  (totalAverageModel?.user_average?.end_time).toFixed(2),
                )
                : 0;
            overallAverage.sleep_time =
              totalAverageModel?.user_average?.sleep_time != undefined
                ? parseFloat(
                  (totalAverageModel?.user_average?.sleep_time).toFixed(2),
                )
                : 0;
            overallAverage.awake_count =
              totalAverageModel?.user_average?.awake_count ?? 0;

            totalAverage.overall_average = overallAverage;
          }
        }
      }

      if (totalAverage.user_average == undefined) {
        let overallAverageMobile = new SleepRecordOverallAverage();
        overallAverageMobile.start_time = 0;
        overallAverageMobile.end_time = 0;
        overallAverageMobile.sleep_time = 0;
        overallAverageMobile.sleep_quality = 0; //parseFloat(sumSleepQuality.toFixed(2));
        overallAverageMobile.awake_count = 0;

        totalAverage.user_average = overallAverageMobile;
      }

      //average overallAverage
      overallAverage.start_time = parseFloat(
        (
          (overallAverage.start_time != null ? overallAverage.start_time : 0) /
          sleepRecordsOverallAverageList.length
        ).toFixed(2),
      );
      overallAverage.end_time = parseFloat(
        (
          (overallAverage.end_time != null ? overallAverage.end_time : 0) /
          sleepRecordsOverallAverageList.length
        ).toFixed(2),
      );
      overallAverage.sleep_time = parseFloat(
        (
          (overallAverage.sleep_time != null ? overallAverage.sleep_time : 0) /
          sleepRecordsOverallAverageList.length
        ).toFixed(2),
      );
      overallAverage.sleep_quality = parseFloat(
        sumOverallSleepQuality.toFixed(2),
      );
      overallAverage.awake_count = Math.round(
        overallAverage.awake_count / sleepRecordsOverallAverageList.length,
      );

      totalAverage.overall_average = overallAverage;

      /////////////////////////
      // console.log(
      //   '=============totalAverage.overall_average========================',
      //   totalAverage.overall_average,
      // );

      totalAverage.totalRecord = sleepRecordsOverallAverageList?.length;
      // console.log(
      //   '=============totalAverage.totalRecord========================',
      //   totalAverage.totalRecord,
      // );
      //add list total
      totalAverageList.push(totalAverage);
      // console.log(
      //   '=============totalAverage========================',
      //   totalAverage,
      // );
    }
    if (totalAverageList.length > 0) return totalAverageList[0];
  }

  //Change data Awakened
  async changeAwakened(numberAwakened: number) {
    // console.log("======numberAwakened===========sleep score: ", numberAwakened);

    let number = 0
    if (numberAwakened >= 15)
      number = 1
    if (numberAwakened >= 10 && numberAwakened < 15)
      number = 2
    if (numberAwakened >= 6 && numberAwakened < 10)
      number = 3
    if (numberAwakened >= 3 && numberAwakened < 6)
      number = 4
    if (numberAwakened >= 0 && numberAwakened < 3)
      number = 5

    // console.log("=================awake score: ", number);

    return number;
  }

  //Change data Sleeptime
  async changeSleepTime(numberSleepTime: float) {
    // console.log("=======numberSleepTime==========sleep score: ", numberSleepTime);

    let number = 0
    // numberSleepTime = numberSleepTime / 60
    if (numberSleepTime < 1 || numberSleepTime >= 15)
      number = 1
    if ((numberSleepTime >= 1 && numberSleepTime < 3) || (numberSleepTime >= 13 && numberSleepTime < 15))
      number = 2
    if ((numberSleepTime >= 3 && numberSleepTime < 4) || (numberSleepTime >= 11 && numberSleepTime < 13))
      number = 3
    if ((numberSleepTime >= 5 && numberSleepTime < 7) || (numberSleepTime >= 9 && numberSleepTime < 11))
      number = 4
    if (numberSleepTime >= 7 && numberSleepTime < 9)
      number = 5

    // console.log("=================sleep score: ", number);

    return number;
  }


  //test cron
  // @Cron('1 * * * * *')
  async testCron() {
    console.log("cron work", new Date())
  }

  @Cron('1 59 23 * * *')
  async getSumTimeSleep() {
    //get all user
    let users = await this.userService.getAllUser()

    //sum sleep time of a user

    users.map(async (user) => {
      let avgStartTime = await this.sumStartTimeUser(user.id)
      let avgEndTime = await this.sumEndTimeUser(user.id)
      await this.userService.updateStartTimeNotice(user.id, avgStartTime)
      await this.userService.updateEndTimeNotice(user.id, avgEndTime)
      //  console.log("this.sumStartTimeUser(user.id)",datatest) 
    })
    console.log("users=", users)
  }
  async sumStartTimeUser(userID: any) {
    //get data sleep
    let sleepsUser = await this.getByUserId(userID)
    // return sleepsUser
    let sumStartTimeNumber = 0
    sleepsUser.map(async (item) => {
      let time = 0
      if (item.details.filter((ftItem) => {
        return ftItem.type_id == TYPEID_START_TIME
      }).length > 0) {
        //co detail fitbit
        let sleepItem = item.details.filter((ftItem) => {
          return ftItem.type_id == TYPEID_START_TIME
        })
        time = DateHelper.changeHourToMinute(sleepItem[0].value)
      } else {
        if (item.start_time) {
          //co input
          let hour = DateHelper.changeDateToMinute(item.start_time)
          time = hour
        }
        else if (item.logs.length > 0) {
          let maxObjRecord = item?.logs?.reduce(function (prev, current) {
            return (prev?.sleep_time > current?.sleep_time) ? prev : current
          })
          time = DateHelper.changeDateToMinute(maxObjRecord.start_time)
        }
      }
      sumStartTimeNumber += time
    })
    let lenght = sleepsUser.length > 0 ? sleepsUser.length : 1
    return sumStartTimeNumber / lenght
  }

  async sumEndTimeUser(userID: any) {
    //get data sleep
    let sleepsUser = await this.getByUserId(userID)
    // return sleepsUser
    let sumEndTimeNumber = 0
    sleepsUser.map(async (item) => {
      let time = 0
      if (item.details.filter((ftItem) => {
        return ftItem.type_id == TYPEID_END_TIME
      }).length > 0) {
        //co detail fitbit
        let sleepItem = item.details.filter((ftItem) => {
          return ftItem.type_id == TYPEID_END_TIME
        })
        time = DateHelper.changeHourToMinute(sleepItem[0].value)
      } else {
        if (item.end_time) {
          //co input
          let hour = DateHelper.changeDateToMinute(item.end_time)
          time = hour
        }
        else if (item.logs.length > 0) {
          let maxObjRecord = item?.logs?.reduce(function (prev, current) {
            return (prev?.sleep_time > current?.sleep_time) ? prev : current
          })
          time = DateHelper.changeDateToMinute(maxObjRecord.end_time)
        }
      }
      sumEndTimeNumber += time
    })
    let lenght = sleepsUser.length > 0 ? sleepsUser.length : 1
    return sumEndTimeNumber / lenght
  }


}
