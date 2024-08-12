import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCodes, CommonCodesService } from 'modules/common-codes';
import {
  SurveyRecordsDetail,
  SurveyRecordsDetailFillableFields,
  SurveyRecordsDetailService,
} from 'modules/survey-records-detail';
import { User, UsersService } from 'modules/user';
import { createQueryBuilder, IsNull, Raw, Repository } from 'typeorm';
import { COMMON_CODE, DateHelper, SURVEY_TYPE } from 'utils';
import { SurveyRecordsFillableFields } from '.';
import { SurveyRecords } from './survey-records.entity';

@Injectable()
export class SurveyRecordsService {
  constructor(
    @InjectRepository(SurveyRecords)
    private readonly surveyRecordRepository: Repository<SurveyRecords>,
    private readonly userService: UsersService,
    private readonly surveyRecordsDetailService: SurveyRecordsDetailService,
    private readonly commonCodesService: CommonCodesService,
  ) { }

  //get by id
  async get(id: number) {
    const surveyRecords = await this.surveyRecordRepository.findOne({
      where: {
        id: id,
        deleted_at: IsNull(),
      },
      relations: [
        'user',
        'details',
        'details.type',
        'details.survey_name',
        'details.survey_value',
      ],
    });

    return surveyRecords;
  }

  //get by user id
  async getByUserId(userId: number) {
    return this.surveyRecordRepository.find({
      where: {
        user_id: userId,
        deleted_at: IsNull(),
      },
      relations: [
        'user',
        'details',
        'details.type',
        'details.survey_name',
        'details.survey_value',
      ],
    });
  }

  //get detail by date
  async getInfoByDate(userId: number, date: Date) {
    const surveyRecords = await this.surveyRecordRepository.findOne({
      where: {
        user_id: userId,
        deleted_at: IsNull(),
        date: DateHelper.getDate(date),
      },
    });
    var model = new SurveyRecordsFillableFields();
    model.id = surveyRecords?.id ?? 0;
    model.user_id = userId;
    model.date = date;
    model.details = new Array<SurveyRecordsDetailFillableFields>();

    const surveyType = await this.commonCodesService.getCodeByParentCode(
      COMMON_CODE.SurveyType,
    );
    const surveyTypeYesNo = surveyType.find((m) => m.code == SURVEY_TYPE.Yes_No);
    const surveyTypeLevel = surveyType.find((m) => m.code == SURVEY_TYPE.Level);
    const surveyNameYesNo = await this.commonCodesService.getByParentCode(COMMON_CODE.SurveyNameYesNo);
    const surveyNameLevel = await this.commonCodesService.getByParentCode(COMMON_CODE.SurveyNameLevel);
    const dataYesNo = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'sur.id as id',
        'sur.survey_value_id as survey_value_id',
        'co.id as survey_name_id',
        'co.name as survey_name',
        'co.value as value',
        'co.ex1 as ex1',
        'co.ex2 as ex2',
      ])
      .addSelect(`${surveyTypeYesNo?.id} as type_id`)
      .addSelect(`'${surveyTypeYesNo?.code}' as type_code`)
      // .addSelect(`'${surveyTypeLevel?.value}' as value`)
      // .addSelect(`'${surveyTypeYesNo?.ex1}' as ex1`)
      // .addSelect(`'${surveyTypeYesNo?.ex2}' as ex2`)
      .leftJoin(
        SurveyRecordsDetail,
        'sur',
        `sur.survey_name_id = co.id and sur.survey_records_id = ${surveyRecords?.id ?? '""'
        }`,
      )
      .where('co.parent_id =:parent_id', { parent_id: surveyNameYesNo?.id })
      .orderBy('co.order', 'ASC')
      .getRawMany();

    const dataLevel = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'sur.id as id',
        'sur.survey_value_id as survey_value_id',
        'co.id as survey_name_id',
        'co.name as survey_name',
        'co.value as value',
        'co.ex1 as ex1',
        'co.ex2 as ex2',
      ])
      .addSelect(`${surveyTypeLevel?.id} as type_id`)
      .addSelect(`'${surveyTypeLevel?.code}' as type_code`)
      // .addSelect(`'${surveyTypeLevel?.value}' as value`)
      // .addSelect(`'${surveyTypeLevel?.ex1}' as ex1`)
      // .addSelect(`'${surveyTypeLevel?.ex2}' as ex2`)
      .leftJoin(
        SurveyRecordsDetail,
        'sur',
        `sur.survey_name_id = co.id and sur.survey_records_id = ${surveyRecords?.id ?? '""'
        }`,
      )
      .where('co.parent_id =:parent_id', { parent_id: surveyNameLevel?.id })
      .orderBy('co.order', 'ASC')
      .getRawMany();
    model.details.push(...dataYesNo);
    model.details.push(...dataLevel);

    return model;
  }

  //get paging
  async getAllSurveyPaging(query) {
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
    let [result, total] = await this.surveyRecordRepository.findAndCount({
      where:
        gubun == 'user_name' && fromDt == '' && toDt == ''
          ? {
            user_id: user != undefined ? user.id : 0,
            date: startTime,
            deleted_at: IsNull(),
          }
          : gubun == 'user_name' && fromDt != '' && toDt != ''
            ? {
              user_id: user != undefined ? user.id : 0,
              date: startTime,
              deleted_at: IsNull(),
            }
            : gubun == 'user_name' && fromDt != '' && toDt == ''
              ? {
                user_id: user != undefined ? user.id : 0,
                date: startTime,
                deleted_at: IsNull(),
              }
              : fromDt != '' && toDt != ''
                ? {
                  date: startTime,
                  deleted_at: IsNull(),
                }
                : fromDt != '' && toDt == ''
                  ? {
                    date: startTime,
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

  //update by user 
  async updateByUser(userId: number, model: SurveyRecordsFillableFields) {
    const surveyRecords = await this.surveyRecordRepository.findOne({
      where: {
        user_id: userId,
        date: DateHelper.getDate(model.date),
      },
    });
    if (surveyRecords) {
      surveyRecords.updated_at = new Date();
      if (await this.surveyRecordRepository.save(surveyRecords)) {
        this.surveyRecordsDetailService.updateRange(surveyRecords, model.details);
      }
      return surveyRecords;
    } else {
      const surveyRecordsNew = new SurveyRecords();
      surveyRecordsNew.user_id = userId;
      surveyRecordsNew.date = DateHelper.getDate(model.date);
      surveyRecordsNew.created_at = new Date();
      if (await this.surveyRecordRepository.save(surveyRecordsNew)) {
        this.surveyRecordsDetailService.createRange(surveyRecordsNew, model.details);
      }

      return surveyRecordsNew;
    }
  }

  //delete update
  async deleteUpdate(id: number) {
    const deleteDetail = await this.surveyRecordRepository
      .createQueryBuilder()
      .delete()
      .from(SurveyRecordsDetail)
      .where('survey_records_id = :id', { id })
      .execute();
    const post = await this.surveyRecordRepository
      .createQueryBuilder()
      .delete()
      .from(SurveyRecords)
      .where('id = :id', { id })
      .execute();
    if (!deleteDetail) {
      throw new NotFoundException();
    }
    if (!post) {
      throw new NotFoundException();
    }
  }
}
