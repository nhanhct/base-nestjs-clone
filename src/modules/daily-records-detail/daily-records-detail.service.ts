import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCodesService } from 'modules/common-codes';
import { DailyRecords, DailyRecordsService } from 'modules/daily-records';
import { Repository } from 'typeorm';
import { DateHelper, NAP_TIME_ID, RECORDS_TYPE_ID, STATUS_RECORD, STRESS_ID, TIME_ID } from 'utils';
import {
  DailyRecordsDetail,
  DailyRecordsDetailFillableFields,
  StatusDailyRecord,
} from './daily-records-detail.entity';

@Injectable()
export class DailyRecordsDetailService {
  constructor(
    @InjectRepository(DailyRecordsDetail)
    private readonly dailyRecordsDetailRepository: Repository<DailyRecordsDetail>,
    // private readonly dailyRecordService: DailyRecordsService,
    private readonly commonCodesService: CommonCodesService,
    @Inject(forwardRef(() => DailyRecordsService))
    private readonly dailyRecordService: DailyRecordsService,
  ) { }
  //get by id
  async getByDailyRecordId(dailyRecordId: number) {
    var result = await this.dailyRecordsDetailRepository.find({
      where: {
        daily_records_id: dailyRecordId,
      },
      relations: ['daily_type', 'time', 'type'],
    });
    return result;
  }

  //get by type
  async getListByDailyRecordType(typeId: number) {
    var result = await this.dailyRecordsDetailRepository.find({
      where: {
        daily_type_id: typeId,
      },
    });
    return result;
  }

  //get by type
  async getListByDailyRecordTypeAndDate(typeId: number, date: Date) {

    var result = await this.dailyRecordsDetailRepository//.find({
      .createQueryBuilder()
      .where(
        'daily_type_id = :daily_type_id and DATE_FORMAT(created_at,"%Y-%m-%d")= DATE_FORMAT(:date,"%Y-%m-%d")',
        { daily_type_id: typeId, date: date },
      )
      .getRawMany();

    return result;
  }
  //get by record type and type
  async getByDailyRecordType(dailyRecordId: number, dailyTypeId: number) {
    var result = await this.dailyRecordsDetailRepository.find({
      where: {
        daily_records_id: dailyRecordId,
        daily_type_id: dailyTypeId,
      },
      relations: ['daily_type', 'time', 'type'],
    });
    return result;
  }

  //add daily record detail
  async createRange(
    dailyRecords: DailyRecords,
    details: DailyRecordsDetailFillableFields[],
  ) {
    var res = [];
    for (let index = 0; index < details.length; index++) {
      const element = details[index];
      if (element) {
        const detail = new DailyRecordsDetail();
        detail.daily_type_id = element.daily_type_id;
        detail.time_id = element.time_id;
        detail.type_id = element.type_id;
        detail.vol = element.vol;
        detail.created_at = new Date();
        detail.dailyRecords = dailyRecords;
        await this.dailyRecordsDetailRepository.save(detail);
        res.push(detail);
      }
    }
    return res;
  }

  //update daily record detail
  async updateRange(
    dailyRecords: DailyRecords,
    details: DailyRecordsDetailFillableFields[],
  ) {
    const result = [];
    var dailyRecordsDetails = await this.dailyRecordsDetailRepository.find({
      daily_records_id: dailyRecords.id,
    });
    for (let index = 0; index < details.length; index++) {
      const element = details[index];
      const detail = dailyRecordsDetails.find(
        (m) =>
          m.id == element.id ||
          (element.id == null && m.daily_type_id == element.daily_type_id),
      );
      if (detail) {
        detail.time_id = element.time_id;
        detail.type_id = element.type_id;
        detail.vol = element.vol;
        detail.updated_at = new Date();
        await this.dailyRecordsDetailRepository.save(detail);
        result.push(detail);
      } else {
        const detailNew = new DailyRecordsDetail();
        detailNew.daily_type_id = element.daily_type_id;
        detailNew.time_id = element.time_id;
        detailNew.type_id = element.type_id;
        detailNew.vol = element.vol;
        detailNew.created_at = new Date();
        detailNew.dailyRecords = dailyRecords;
        await this.dailyRecordsDetailRepository.save(detailNew);
        result.push(detailNew);
      }
    }
    return result;
  }

  //delete 
  async deleteRange(
    dailyRecords: DailyRecords,
    details: DailyRecordsDetailFillableFields[],
  ) {
    var dailyRecordsDetails = await this.dailyRecordsDetailRepository.find({
      daily_records_id: dailyRecords.id,
    });
    for (let index = 0; index < details.length; index++) {
      const element = details[index];
      const detail = dailyRecordsDetails.find(
        (m) =>
          m.id == element.id ||
          (element.id == null && m.daily_type_id == element.daily_type_id),
      );
      if (detail) {
        await this.dailyRecordsDetailRepository.delete(detail.id);
      }
    }
  }

  //delete
  async delete(id: number) {
    return await this.dailyRecordsDetailRepository.delete(id);
  }

  //get daily records status by date and user
  async getDailyRecordStatusByUser(userId: number, date: Date) {
    let alcolStatus = 0;
    let cafeStatus = 0;
    let napStatus = 0;
    let stressStatus = 0;
    const statusSleepRecord = new StatusDailyRecord()
    //get daily records by date and user
    const dailyRecord = await this.dailyRecordService.getInfoByDate(userId, date);
    console.log('dailyRecord', dailyRecord);
    if (dailyRecord != undefined) {
      const dailyRecordlList = await this.dailyRecordService.getAllList();
      const dailyRecordDetailList = await this.getByDailyRecordId(dailyRecord.id);
      //get list daily detail by type alcol
      const dailyRecordDetailByTypeAlcols = await this.getListByDailyRecordType(RECORDS_TYPE_ID.Alcohol);
      //get list daily detail by type cafe
      const dailyRecordDetailByTypeCafes = await this.getListByDailyRecordType(RECORDS_TYPE_ID.Caffeine);

      if (dailyRecordDetailList.length > 0) {
        //sum alcol
        const sumAlcolVol = dailyRecordDetailByTypeAlcols.reduce((a, v) => (a = a + v.vol), 0);
        //sum cafe
        const sumCafeVol = dailyRecordDetailByTypeCafes.reduce((a, v) => (a = a + v.vol), 0);

        for (let index = 0; index < dailyRecordDetailList.length; index++) {
          //get type id
          const commonCodeType = await this.commonCodesService.getByid(dailyRecordDetailList[index].type_id);

          //Alcol
          if (dailyRecordDetailList[index].daily_type_id == RECORDS_TYPE_ID.Alcohol) {
            let sumAlcol = (dailyRecordDetailList[index].vol / (sumAlcolVol / dailyRecordlList.length)) * 100;
            if (dailyRecordDetailList[index].time_id == TIME_ID.before_going_to_bed) {
              // before_going_to_bed
              alcolStatus = STATUS_RECORD.UnLike;
            } else {
              if (sumAlcol <= dailyRecordDetailList[index].vol)
                alcolStatus = STATUS_RECORD.UnLike;
              else alcolStatus = STATUS_RECORD.Like;
            }
          }
          //Caffeine
          if (dailyRecordDetailList[index].daily_type_id == RECORDS_TYPE_ID.Caffeine) {
            let sumCafe = (dailyRecordDetailList[index].vol / (sumCafeVol / dailyRecordlList.length)) * 100;
            if (dailyRecordDetailList[index].time_id == TIME_ID.before_going_to_bed) {
              // before_going_to_bed
              cafeStatus = STATUS_RECORD.UnLike;
            } else {
              if (sumCafe <= dailyRecordDetailList[index].vol)
                cafeStatus = STATUS_RECORD.UnLike;
              else cafeStatus = STATUS_RECORD.Like;
            }
          }
          //Nap
          if (dailyRecordDetailList[index].daily_type_id == RECORDS_TYPE_ID.Nap) {
            if (
              dailyRecordDetailList[index].time_id == TIME_ID.before_going_to_bed ||
              commonCodeType?.id == NAP_TIME_ID.more_2hour || commonCodeType?.id == NAP_TIME_ID.more_than
            ) {
              // before_going_to_bed
              napStatus = STATUS_RECORD.UnLike;
            } else {
              if (commonCodeType?.id == NAP_TIME_ID.one_hour || commonCodeType?.id == NAP_TIME_ID.two_hour)
                napStatus = STATUS_RECORD.Like;
            }
          }
          //stress
          if (dailyRecordDetailList[index].daily_type_id == RECORDS_TYPE_ID.Stress) {
            // stressRecord.vol = dailyRecordDetailList[index].vol;
            if (dailyRecordDetailList[index].time_id == TIME_ID.before_going_to_bed || commonCodeType.id == STRESS_ID.strong) {
              // before_going_to_bed
              stressStatus = STATUS_RECORD.UnLike;
            } else {
              if (commonCodeType?.id == STRESS_ID.weak || commonCodeType?.id == STRESS_ID.usually)
                stressStatus = STATUS_RECORD.Like;
            }
          }
          // }
        }
      }

      statusSleepRecord.alcolStatus = alcolStatus;
      statusSleepRecord.cafeStatus = cafeStatus;
      statusSleepRecord.napStatus = napStatus;
      statusSleepRecord.stressStatus = stressStatus;
    }

    console.log("statusSleepRecord================", statusSleepRecord);

    return statusSleepRecord;
  }

}

