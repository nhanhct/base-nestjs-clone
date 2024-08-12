import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCodes, CommonCodesService } from 'modules/common-codes';
import {
  EnvironmentRecordsDetail,
  EnvironmentRecordsDetailFillableFields,
  EnvironmentRecordsDetailService,
} from 'modules/environment-records-detail';
import { SleepRecordsService } from 'modules/sleep-records';
import { User, UsersService } from 'modules/user';
import { UsersFeedback, UsersFeedbackService } from 'modules/user-feedback';
import {
  UserFeedbackDetail,
  UserFeedbackDetailService,
} from 'modules/user-feedback-detail';
import { createQueryBuilder, IsNull, Raw, Repository } from 'typeorm';
import {
  COMMON_CODE,
  DateHelper,
  ENVIRONMENT_RECORD_TYPE_ID,
  ENVIRONMENT_TYPE,
  RECORDS_TYPE,
  STATUS_RECORD,
} from 'utils';
import { EnvironmentRecordsFillableFields } from '.';
import { EnvironmentRecords } from './environment-records.entity';

@Injectable()
export class EnvironmentRecordsService {
  constructor(
    @InjectRepository(EnvironmentRecords)
    private readonly environmentRecordRepository: Repository<EnvironmentRecords>,
    private readonly commonCodesService: CommonCodesService,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => UsersFeedbackService))
    private readonly usersFeedbackService: UsersFeedbackService,
    @Inject(forwardRef(() => EnvironmentRecordsDetailService))
    private readonly environmentRecordDetailService: EnvironmentRecordsDetailService,
    private readonly userFeedbackDetailService: UserFeedbackDetailService,
    @Inject(forwardRef(() => SleepRecordsService))
    private readonly sleepRecordsService: SleepRecordsService,
  ) { }
  //get env today of user
  async getEnvPhoneLogTodayUser(userId: number, date) {
    const environmentRecords = await this.environmentRecordRepository.findOne({
      where: {
        user_id: userId,
        deleted_at: null,
        date: DateHelper.getDate(date),
      },
    });
    if (!environmentRecords)
    return null
    const envDetail = await this.environmentRecordDetailService.getRecordTypeId(
      environmentRecords.id,
      83,
    );
    return envDetail;
  }

  //get env today of user
  async getEnvNumberStepTodayUser(userId: number, date) {
    const environmentRecords = await this.environmentRecordRepository.findOne({
      where: {
        user_id: userId,
        deleted_at: null,
        date: DateHelper.getDate(date),
      },
    });
    if(!environmentRecords)
    return null
      const envDetail = await this.environmentRecordDetailService.getRecordTypeId(
        environmentRecords.id,
        81,
      );
      return envDetail;

    
  }
  //create or update environment phone log
  async updateCreateNumberStep(userId: number, step: any) {
    const environmentRecords = await this.environmentRecordRepository.findOne({
      where: {
        user_id: userId,
        deleted_at: null,
        date: DateHelper.getDate(new Date()),
      },
    });
    let newTime;
    if (environmentRecords != undefined) {
      const envDetail =
        await this.environmentRecordDetailService.getRecordTypeId(
          environmentRecords.id,
          81,
        );
      if (envDetail != undefined) {
        newTime = (await envDetail)?.value + step;
        this.environmentRecordDetailService.updatePhoneLog(
          environmentRecords.id,
          81,
          newTime,
        );
      } else {
        newTime = step;
        const newEnvPhoneLog = new EnvironmentRecordsDetail();
        newEnvPhoneLog.records_type_id = 78;
        newEnvPhoneLog.type_id = 81;
        newEnvPhoneLog.value = newTime;
        newEnvPhoneLog.environment_records_id = environmentRecords.id;
        newEnvPhoneLog.created_at = new Date();
        await this.environmentRecordDetailService.create(newEnvPhoneLog);
      }
    } else {
      let environmentRecords = new EnvironmentRecords();
      environmentRecords.user_id = userId;
      environmentRecords.date = DateHelper.getDate(new Date());
      environmentRecords.created_at = new Date();
      await this.environmentRecordRepository.save(environmentRecords);
      newTime = step;
      const newEnvPhoneLog = new EnvironmentRecordsDetail();
      newEnvPhoneLog.records_type_id = 78;
      newEnvPhoneLog.type_id = 81;
      newEnvPhoneLog.value = newTime;
      newEnvPhoneLog.environment_records_id = environmentRecords.id;
      newEnvPhoneLog.created_at = new Date();
      await this.environmentRecordDetailService.create(newEnvPhoneLog);
    }
  }
  //create or update environment phone log
  async updateCreatePhoneLog(userId: number) {
    const environmentRecords = await this.environmentRecordRepository.findOne({
      where: {
        user_id: userId,
        deleted_at: null,
        date: DateHelper.getDate(new Date()),
      },
    });
    let newTime;
    if (environmentRecords != undefined) {
      const envDetail =
        await this.environmentRecordDetailService.getRecordTypeId(
          environmentRecords.id,
          83,
        );
      if (envDetail != undefined) {
        newTime = (await envDetail)?.value + 10;
        this.environmentRecordDetailService.updatePhoneLog(
          environmentRecords.id,
          83,
          newTime,
        );
      } else {
        newTime = 10;
        const newEnvPhoneLog = new EnvironmentRecordsDetail();
        newEnvPhoneLog.records_type_id = 78;
        newEnvPhoneLog.type_id = 83;
        newEnvPhoneLog.value = newTime;
        newEnvPhoneLog.environment_records_id = environmentRecords.id;
        newEnvPhoneLog.created_at = new Date();
        await this.environmentRecordDetailService.create(newEnvPhoneLog);
      }
    } else {
      let environmentRecords = new EnvironmentRecords();
      environmentRecords.user_id = userId;
      environmentRecords.date = DateHelper.getDate(new Date());
      environmentRecords.created_at = new Date();
      await this.environmentRecordRepository.save(environmentRecords);
      newTime = 10;
      const newEnvPhoneLog = new EnvironmentRecordsDetail();
      newEnvPhoneLog.records_type_id = 78;
      newEnvPhoneLog.type_id = 83;
      newEnvPhoneLog.value = newTime;
      newEnvPhoneLog.environment_records_id = environmentRecords.id;
      newEnvPhoneLog.created_at = new Date();
      await this.environmentRecordDetailService.create(newEnvPhoneLog);
    }
  }
  //get by id
  async get(id: number) {
    let environmentRecord = await this.environmentRecordRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'user',
        'details',
        'details.records_type',
        'details.type',
        'details.environmentRecords',
      ],
    });

    return environmentRecord;
  }

  //get all
  async getAll() {
    let environmentRecord = await this.environmentRecordRepository.find({
      where: {
        deleted_at: null,
      },
      // relations:["user","details","details.records_type","details.type","details.environmentRecords"]
    });

    return environmentRecord;
  }

  //get by date
  async getByDate(date: Date) {
    let environmentRecord = await this.environmentRecordRepository.find({
      where: {
        date: date,
        deleted_at: null,
      },
    });

    return environmentRecord;
  }

  //get by user id
  async getByUserId(userId: number) {
    const environmentRecords = await this.environmentRecordRepository.find({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      relations: ['details', 'details.records_type', 'details.type'],
    });
    return environmentRecords;
  }

  //get by date and user
  async getByDateAndUser(userId: number, date: Date) {
    const environmentRecords = await this.environmentRecordRepository.findOne({
      where: {
        user_id: userId,
        deleted_at: null,
        date: DateHelper.getDate(date),
      },
      relations: ['details', 'details.records_type', 'details.type'],
    });
    // console.log('environmentRecords', environmentRecords, date);
    return environmentRecords;
  }

  async getAllEnvironmentPaging(query) {
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
    let strDate = Raw((alias) => `${alias} >= :date and ${alias} <= :date1`, {
      date: fromDt != '' ? fromDt : '2020-11-15',
      date1: toDt != '' ? toDt : '2900-11-15',
    });
    let [result, total] = await this.environmentRecordRepository.findAndCount({
      where:
        gubun == 'user_name' && fromDt == '' && toDt == ''
          ? {
            user_id: user != undefined ? user.id : 0,
            date: strDate,
            deleted_at: IsNull(),
          }
          : gubun == 'user_name' && fromDt != '' && toDt != ''
            ? {
              user_id: user != undefined ? user.id : 0,
              date: strDate,
              deleted_at: IsNull(),
            }
            : gubun == 'user_name' && fromDt != '' && toDt == ''
              ? {
                user_id: user != undefined ? user.id : 0,
                date: strDate,
                deleted_at: IsNull(),
              }
              : fromDt != '' && toDt != ''
                ? {
                  date: strDate,
                  deleted_at: IsNull(),
                }
                : fromDt != '' && toDt == ''
                  ? {
                    date: strDate,
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
  async getInfoByDate(userId: number, date: Date) {
    const environmentRecords = await this.getUpdateByUser(userId, date);

    const environmentType = await this.commonCodesService.getCodeByParentCode(
      COMMON_CODE.EnvironmentType,
    );
    const recordTypeMobile = environmentType.find(
      (m) => m.code == ENVIRONMENT_TYPE.Mobile,
    );
    const recordTypeFitbit = environmentType.find(
      (m) => m.code == ENVIRONMENT_TYPE.Fitbit,
    );
    var environmentRecordMobileType =
      await this.commonCodesService.getByParentCode(
        COMMON_CODE.EnvironmentMobileType,
      );
    var environmentRecordFitbitType =
      await this.commonCodesService.getByParentCode(
        COMMON_CODE.EnvironmentFitbitType,
      );
    var model = new EnvironmentRecordsFillableFields();
    model.id = environmentRecords?.id;
    model.user_id = userId;
    model.date = date;
    model.details = new Array<EnvironmentRecordsDetailFillableFields>();
    const detailMobbiles = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as type_id',
        'co.name as type_name',
        'envi.id as id',
        'envi.value as value',
      ])
      .addSelect(`${recordTypeMobile?.id} as records_type_id`)
      .addSelect(`"${recordTypeMobile?.name}" as records_type_name`)
      .leftJoin(EnvironmentRecordsDetail, 'envi', 'envi.type_id = co.id')
      .where('co.parent_id =:parent_id', {
        parent_id: environmentRecordMobileType?.id,
      })
      .getRawMany();
    const detailFitbits = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as type_id',
        'co.name as type_name',
        'envi.id as id',
        'envi.value as value',
      ])
      .addSelect(`${recordTypeFitbit?.id} as records_type_id`)
      .addSelect(`"${recordTypeFitbit?.name}" as records_type_name`)
      .leftJoin(EnvironmentRecordsDetail, 'envi', 'envi.type_id = co.id')
      .where('co.parent_id =:parent_id', {
        parent_id: environmentRecordFitbitType?.id,
      })
      .getRawMany();
    model.details.push(...detailMobbiles);
    model.details.push(...detailFitbits);
    return model;
  }
  // only update
  async getUpdateByUser(userId: number, date: Date) {
    return await this.environmentRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(date),
      },
    });
  }

  //create
  async createOrUpdateMobile(userId: number, model: EnvironmentRecords) {
    const recordTypeMobile = (
      await this.commonCodesService.getCodeByParentCode(
        COMMON_CODE.EnvironmentType,
      )
    ).find((m) => m.code == ENVIRONMENT_TYPE.Mobile);

    if (recordTypeMobile) {
      const environmentRecord = await this.create(
        userId,
        recordTypeMobile.id,
        model,
      );
      //add users Feedback
      var environmentRecordTypeId = (
        await this.commonCodesService.getCodeByParentCode(
          COMMON_CODE.RecordsType,
        )
      ).find((m) => m.code == RECORDS_TYPE.Environment)?.id;

      var usersFeedback = await this.usersFeedbackService.getByRecord(
        environmentRecord.id,
        environmentRecordTypeId,
      );
      if (usersFeedback) {
        await this.userFeedbackDetailService.deletedRange(usersFeedback);
        await this.addFeedbackDetail(usersFeedback);
      } else {
        var usersFeedbackNew = new UsersFeedback();
        usersFeedbackNew.records_id = environmentRecord.id;
        usersFeedbackNew.feedback_date = environmentRecord.date;
        usersFeedbackNew.user_id = environmentRecord.user_id;
        usersFeedbackNew.records_type_id = environmentRecordTypeId;
        if (await this.usersFeedbackService.create(usersFeedbackNew)) {
          await this.addFeedbackDetail(usersFeedbackNew);
        }
      }

      return environmentRecord;
    }

    return null;
  }

  // add feedback detail
  async addFeedbackDetail(usersFeedback: UsersFeedback): Promise<void> {
    const environmentRecordsDetails =
      await this.environmentRecordDetailService.getByEnvironmentRecordsId(
        usersFeedback.records_id,
      );
    for (let index = 0; index < environmentRecordsDetails.length; index++) {
      const element = environmentRecordsDetails[index];
      const statusRecord =
        await this.sleepRecordsService.getEnvironmentMobileAndFitbitByUser(
          usersFeedback.user_id,
          element.created_at,
        );

      var detail = new UserFeedbackDetail();
      detail.records_detail_id = element.id;
      //add status like, unlike
      if (statusRecord != undefined) {
        if (element.type_id == ENVIRONMENT_RECORD_TYPE_ID.mobile_step_status) {
          detail.status = statusRecord?.environment_record_mobile
            ?.mobile_step_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
        if (element.type_id == ENVIRONMENT_RECORD_TYPE_ID.mobile_tem_status) {
          detail.status = statusRecord?.environment_record_mobile
            ?.mobile_tem_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
        if (element.type_id == ENVIRONMENT_RECORD_TYPE_ID.mobile_time_status) {
          detail.status = statusRecord?.environment_record_mobile
            ?.mobile_time_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
        if (element.type_id == ENVIRONMENT_RECORD_TYPE_ID.fitbit_step_status) {
          detail.status = statusRecord?.environment_record_fitbit
            ?.fitbit_step_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
        if (element.type_id == ENVIRONMENT_RECORD_TYPE_ID.fitbit_time_status) {
          detail.status = statusRecord?.environment_record_fitbit
            ?.fitbit_time_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
        if (
          element.type_id == ENVIRONMENT_RECORD_TYPE_ID.fitbit_distance_status
        ) {
          detail.status = statusRecord?.environment_record_fitbit
            ?.fitbit_distance_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
        if (
          element.type_id == ENVIRONMENT_RECORD_TYPE_ID.fitbit_heart_rate_status
        ) {
          detail.status = statusRecord?.environment_record_fitbit
            ?.fitbit_heart_rate_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
        if (element.type_id == ENVIRONMENT_RECORD_TYPE_ID.sleep_time_status) {
          detail.status = statusRecord?.environment_record_fitbit
            ?.sleep_time_status
            ? STATUS_RECORD.Like
            : STATUS_RECORD.UnLike;
        }
      } else detail.status = null;
      detail.created_at = new Date();
      detail.userFeedback = usersFeedback;

      //add feedback detail
      await this.userFeedbackDetailService.create(detail);
    }
  }
  //get date
  async getDate(userId: number, date: Date) {
    return await this.environmentRecordRepository
      .createQueryBuilder()
      .where(
        'user_id = :userId and DATE_FORMAT(date,"%Y-%m-%d")= DATE_FORMAT(:date,"%Y-%m-%d")',
        { userId: userId, date: date },
      )
      .getOne();
  }

  async createUpdateWeather(userId: number, date: any, detailBody: any) {
    try {
      const checkDateAndId = await this.getDate(userId, date);
      if (checkDateAndId) {
        
        await this.environmentRecordRepository
          .createQueryBuilder()
          .update(EnvironmentRecords)
          .set({ updated_at: new Date(), weather: detailBody })
          .where('id = :id', { id: checkDateAndId.id })
          .execute();
      } else {
        
        let environmentRecordNew = new EnvironmentRecords();
        environmentRecordNew.user_id = userId;
        environmentRecordNew.created_at = new Date();
        environmentRecordNew.date = DateHelper.getDate(date);
        environmentRecordNew.weather = detailBody;
        let newEnvironmentRecord = await this.environmentRecordRepository.save(
          environmentRecordNew,
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
  //new logic create, update
  async createOrUpdateEnvironmentDetail(userId: number, date, detailBody) {
    try {
      const checkDateAndId = await this.getDate(userId, date);
      if (checkDateAndId) {
        detailBody.map(async (item) => {
          const getTypeAndEnvId =
            await this.environmentRecordDetailService.getRecordTypeId(
              checkDateAndId.id,
              item.type_id,
            );
          if (getTypeAndEnvId) {
            await this.environmentRecordRepository
              .createQueryBuilder()
              .update(EnvironmentRecords)
              .set({ updated_at: new Date()})
              .where('id = :id', { id: checkDateAndId.id })
              .execute();
            item.environment_records_id = checkDateAndId.id;
            return await this.environmentRecordDetailService.update(item);
          } else {
            item.environment_records_id = checkDateAndId.id;

            return await this.environmentRecordDetailService.create(item);
          }
        });
      } else {
        console.log("create===")
        let environmentRecordNew = new EnvironmentRecords();
        environmentRecordNew.user_id = userId;
        environmentRecordNew.created_at = new Date();
        environmentRecordNew.date = DateHelper.getDate(date);
        let newEnvironmentRecord = await this.environmentRecordRepository.save(
          environmentRecordNew,
        );
        detailBody.map(async (item) => {
          item.environment_records_id = newEnvironmentRecord.id;
          return await this.environmentRecordDetailService.create(item);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async createOrUpdateFitbit(userId: number, model: EnvironmentRecords) {
    const recordTypeFitbit = (
      await this.commonCodesService.getCodeByParentCode(
        COMMON_CODE.EnvironmentType,
      )
    ).find((m) => m.code == ENVIRONMENT_TYPE.Fitbit);
    if (recordTypeFitbit) {
      return await this.create(userId, recordTypeFitbit.id, model);
    }

    return null;
  }

  async create(
    userId: number,
    recordTypeId: number,
    model: EnvironmentRecords,
  ) {
    var record = await this.getUpdateByUser(userId, model.date);
    var result;
    if (record) {
      // update
      record.updated_at = new Date();
      result = await this.environmentRecordRepository.save(record);
      if (result) {
        this.environmentRecordDetailService.updateRange(
          record,
          recordTypeId,
          model.details,
        );
      }
    } // create
    else {
      var environmentRecords = new EnvironmentRecords();
      environmentRecords.user_id = userId;
      environmentRecords.date = DateHelper.getDate(model.date);
      environmentRecords.created_at = new Date();
      result = await this.environmentRecordRepository.save(environmentRecords);
      if (result) {
        this.environmentRecordDetailService.createRange(
          environmentRecords,
          recordTypeId,
          model.details,
        );
      }
    }
    return result;
  }

  //update
  async update(id: number, postData: EnvironmentRecordsFillableFields) {
    const post = await this.environmentRecordRepository
      .createQueryBuilder()
      .update(EnvironmentRecords)
      .set({
        user_id: postData.user_id,
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
    const post = await this.environmentRecordRepository
      .createQueryBuilder()
      .update(EnvironmentRecords)
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

  async getDaiEnvironmentRecordByUserFeedback(userFeedbackId: number) {
    return await createQueryBuilder(UserFeedbackDetail, 'd')
      .leftJoin(EnvironmentRecordsDetail, 'env', 'env.id = d.records_detail_id')
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
}
