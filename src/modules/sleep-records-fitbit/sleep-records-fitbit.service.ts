import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCodesService } from 'modules/common-codes';
import {
  SleepRecordsLog,
  SleepRecordsLogService,
} from 'modules/sleep-records-mobile';
import { SleepRecords } from 'modules/sleep-records/sleep-records.entity';
import { UsersFeedback, UsersFeedbackService } from 'modules/user-feedback';
import {
  UserFeedbackDetail,
  UserFeedbackDetailService,
} from 'modules/user-feedback-detail';
import { Repository } from 'typeorm';
import { COMMON_CODE, DateHelper, RECORDS_TYPE, SLEEP_TYPE } from 'utils';
import { SleepRecordsDetail } from './sleep-records-fitbit.entity';

@Injectable()
export class SleepRecordsDetailService {
  constructor(
    @InjectRepository(SleepRecordsDetail)
    private readonly sleepRecordDetailRepository: Repository<SleepRecordsDetail>,
    private readonly commonCodesService: CommonCodesService,
    @Inject(forwardRef(() => SleepRecordsLogService))
    private readonly sleepRecordsLogService: SleepRecordsLogService,
    @Inject(forwardRef(() => UsersFeedbackService))
    private readonly usersFeedbackService: UsersFeedbackService,
    private readonly userFeedbackDetailService: UserFeedbackDetailService,
  ) { }

  //get all
  async getDetailAll() {
    const sleepRecordDetails = await this.sleepRecordDetailRepository.find({
      where: { deleted_at: null },
    });

    return sleepRecordDetails;
  }

  //get all
  async getDetailByDate(date: Date) {
    // const sleepRecordDetails = await this.sleepRecordDetailRepository.find({
    //   where: { deleted_at: null, created_at: date },
    // });

    var sleepRecordDetails = await this.sleepRecordDetailRepository //.find({
      .createQueryBuilder()
      .where(
        'DATE_FORMAT(created_at,"%Y-%m-%d")= DATE_FORMAT(:date,"%Y-%m-%d")',
        { date: date },
      )
      .getRawMany();

    return sleepRecordDetails;
  }

  // //get By User And Date
  // async getDetailByUserAndDate(userId:number,date: Date) {
  //   const sleepRecordDetails = await this.sleepRecordDetailRepository.find({
  //     where: {
  //       deleted_at: null,
  //        created_at: date,

  //       },
  //   });

  //   return sleepRecordDetails;
  // }

  //get by sleepRecordsId
  async getBySleepRecordId(sleepRecordsId: number) {
    const sleepRecordDetails = await this.sleepRecordDetailRepository.find({
      sleep_records_id: sleepRecordsId,
    });
    return sleepRecordDetails;
  }

  //get by id
  async getById(id: number) {
    const sleepRecordsDetail = await this.sleepRecordDetailRepository.findOne({
      id,
    });
    return sleepRecordsDetail;
  }
  //get by sleep record id and type_id
  async getBySleepIDAndTypeId(sleep_records_id, type_id) {
    return await this.sleepRecordDetailRepository.findOne({
      sleep_records_id: sleep_records_id,
      type_id: type_id,
    });
  }
  async updateByLog(
    sleepRecords: SleepRecords,
    sleepRecordsLog: SleepRecordsLog,
  ) {
    const logs = await this.sleepRecordsLogService.getBySleepRecordId(
      sleepRecords.id,
    );
    const logsNotItemCurrent = logs.filter((m) => m.id != sleepRecordsLog.id);
    const logFirst =
      logsNotItemCurrent.length == 0 ? null : logsNotItemCurrent[0];

    var commonCodes = await this.commonCodesService.getCodeByParentCode(
      COMMON_CODE.SleepType,
    );
    for (let index = 0; index < commonCodes.length; index++) {
      const element = commonCodes[index];
      const detail = await this.sleepRecordDetailRepository.findOne({
        where: {
          sleep_records_id: sleepRecords.id,
          type_id: element.id,
        },
      });
      switch (element.code) {
        case SLEEP_TYPE.SleepTime:
          if (detail) {
            detail.value += DateHelper.getSecondsDuration(
              sleepRecordsLog.end_time,
              sleepRecordsLog.start_time,
            );
            detail.updated_at = new Date();
            this.sleepRecordDetailRepository.save(detail);
          } else {
            const detailSleepTime = new SleepRecordsDetail();
            detailSleepTime.type_id = element.id;
            detailSleepTime.value = DateHelper.getSecondsDuration(
              sleepRecordsLog.end_time,
              sleepRecordsLog.start_time,
            );
            detailSleepTime.sleepRecords = sleepRecords;
            detailSleepTime.created_at = new Date();
            this.sleepRecordDetailRepository.save(detailSleepTime);
          }
          break;
        case SLEEP_TYPE.NumberOfWakes:
          if (detail) {
            detail.value = logs.length - 1;
            detail.updated_at = new Date();
            this.sleepRecordDetailRepository.save(detail);
          } else {
            const detailSleepTime = new SleepRecordsDetail();
            detailSleepTime.type_id = element.id;
            detailSleepTime.sleepRecords = sleepRecords;
            detailSleepTime.value = logs.length = 0 ? 0 : logs.length - 1;
            detailSleepTime.created_at = new Date();
            this.sleepRecordDetailRepository.save(detailSleepTime);
          }
          break;
        case SLEEP_TYPE.TimeAwake:
          if (detail) {
            if (logFirst) {
              detail.value += DateHelper.getSecondsDuration(
                sleepRecordsLog.start_time,
                logFirst.end_time,
              );
            } else {
              detail.value = 0;
            }
            detail.updated_at = new Date();
            this.sleepRecordDetailRepository.save(detail);
          } else {
            const detailSleepTime = new SleepRecordsDetail();
            detailSleepTime.type_id = element.id;
            detailSleepTime.sleepRecords = sleepRecords;
            if (logFirst) {
              detailSleepTime.value += DateHelper.getSecondsDuration(
                sleepRecordsLog.start_time,
                logFirst.end_time,
              );
            } else {
              detailSleepTime.value = 0;
            }
            detailSleepTime.created_at = new Date();
            this.sleepRecordDetailRepository.save(detailSleepTime);
          }
          break;
      }
    }
    this.updateFeedback(sleepRecords);
  }
  async updateFeedback(sleepRecords: SleepRecords) {
    var sleepRecordTypeId = (
      await this.commonCodesService.getCodeByParentCode(COMMON_CODE.RecordsType)
    ).find((m) => m.code == RECORDS_TYPE.Sleep)?.id;
    var usersFeedback = await this.usersFeedbackService.getByRecord(
      sleepRecords.id,
      sleepRecordTypeId,
    );
    if (usersFeedback) {
      await this.userFeedbackDetailService.deletedRange(usersFeedback);
      await this.addFeedbackDetail(usersFeedback);
    } else {
      var usersFeedbackNew = new UsersFeedback();
      usersFeedbackNew.records_id = sleepRecords.id;
      usersFeedbackNew.feedback_date = sleepRecords.date;
      usersFeedbackNew.user_id = sleepRecords.user_id;
      usersFeedbackNew.records_type_id = sleepRecordTypeId;
      if (await this.usersFeedbackService.create(usersFeedbackNew)) {
        await this.addFeedbackDetail(usersFeedbackNew);
      }
    }
  }
  async addFeedbackDetail(usersFeedback: UsersFeedback): Promise<void> {
    const environmentRecordsDetails = await this.getBySleepRecordId(
      usersFeedback.records_id,
    );
    for (let index = 0; index < environmentRecordsDetails.length; index++) {
      const element = environmentRecordsDetails[index];
      var detail = new UserFeedbackDetail();
      detail.records_detail_id = element.id;
      detail.status = 70;
      detail.created_at = new Date();
      detail.userFeedback = usersFeedback;
      await this.userFeedbackDetailService.create(detail);
    }
  }

  //delete in DB
  async delete(id: number) {
    const sleepRecordsDetail = await this.sleepRecordDetailRepository.delete(
      id,
    );

    return sleepRecordsDetail;
  }
  async create(body: SleepRecordsDetail) {
    body.created_at = new Date();
    await this.sleepRecordDetailRepository.save(body);
  }
  //update
  async update(body) {
    const post = await this.sleepRecordDetailRepository
      .createQueryBuilder()
      .update(SleepRecordsDetail)
      .set({
        value: body.value,
        sub_value: body.sub_value,
        updated_at: new Date(),
      })
      .where('sleep_records_id = :sleep_records_id and type_id = :type_id', {
        sleep_records_id: body.sleep_records_id,
        type_id: body.type_id,
      })
      .execute();

    return post;
  }
}
