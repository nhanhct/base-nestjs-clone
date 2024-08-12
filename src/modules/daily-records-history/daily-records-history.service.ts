import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Raw, Repository } from 'typeorm';
import { DailyRecords, DailyRecordsService } from '../daily-records';
import { DailyRecordsHistory } from './daily-records-history.entity';

import { User, UsersService } from 'modules/user';
import { DailyRecordsHistoryDetailService } from 'modules/daily-records-history-detail';
import { DailyRecordsDetail } from 'modules/daily-records-detail/daily-records-detail.entity';

@Injectable()
export class DailyRecordsHistoryService {
    constructor(
        @InjectRepository(DailyRecordsHistory)
        private readonly dailyRecordhistoryRepository: Repository<DailyRecordsHistory>,
        private readonly userService: UsersService,
        @Inject(forwardRef(() => DailyRecordsService))
        private readonly dailyRecordsService: DailyRecordsService,
        private readonly dailyRecordHistoryDetailService: DailyRecordsHistoryDetailService,

    ) { }

    //get paging
    async getAllDailyHistoryPaging(query) {
        const take = parseInt(query.limit) || 10
        const skip = parseInt(query.page) || 0
        const keyword = query.keyword || ''
        const gubun = query.gubun || ''
        const fromDt = query.fromDt
        const toDt = query.toDt
        let user = new User
        if (gubun == "user_name") {
            user = await this.userService.getByLikeUserName(keyword)
        }
        let dailyHistoryDate = Raw((alias) => `${alias} >= :date and ${alias} <= :date1`, { date: fromDt != '' ? fromDt : '2020-11-15', date1: toDt != '' ? toDt : '2900-11-15' })
        let [result, total] = await this.dailyRecordhistoryRepository.findAndCount(
            {
                where: (gubun == "user_name" && fromDt == '' && toDt == '') ? {
                    user_id: user != undefined ? user.id : 0,
                    record_date: dailyHistoryDate,
                    deleted_at: IsNull()
                } : (gubun == "user_name" && fromDt != '' && toDt != '') ? {
                    user_id: user != undefined ? user.id : 0,
                    record_date: dailyHistoryDate,
                    deleted_at: IsNull()
                } : (gubun == "user_name" && fromDt != '' && toDt == '') ? {
                    user_id: user != undefined ? user.id : 0,
                    record_date: dailyHistoryDate,
                    deleted_at: IsNull()
                } : fromDt != '' && toDt != '' ? {
                    record_date: dailyHistoryDate,
                    deleted_at: IsNull()
                } : fromDt != '' && toDt == '' ? {
                    record_date: dailyHistoryDate,
                    deleted_at: IsNull()
                } : { deleted_at: IsNull() },
                relations: ["user"],
                order: { id: "DESC" },
                take: take,
                skip: skip * take
            });

        return {
            data: result,
            count: total
        }
    }

    //get by id 
    async getById(id: number) {
        const dailyRecordsHistory = await this.dailyRecordhistoryRepository.findOne({
            where: {
                id: id,
                deleted_at: IsNull()
            },
            relations: ["user", "details", "details.daily_type", "details.type", "details.time"]
        });

        return dailyRecordsHistory;
    }

    //get by user id
    async getByUserId(userId: number) {
        const dailyRecordList = await this.dailyRecordhistoryRepository.find({
            where: {
                user_id: userId,
                deleted_at: IsNull()
            },
            relations: ["user", "details", "details.daily_type", "details.type", "details.time", "details.level", "details.total_time"]
        })

        return dailyRecordList;
    }

    //get by daily records id
    async getByDailyRecordId(daily_id: number) {
        const dailyRecordsHistoryList = await this.dailyRecordhistoryRepository.find({
            where: {
                daily_records_id: daily_id,
                deleted_at: IsNull()
            },
            relations: ["user", "details", "details.daily_type", "details.type", "details.time", "details.level", "details.total_time"]
        })

        return dailyRecordsHistoryList;
    }

    //create
    async createByDailyRecords(dailyRecords: DailyRecords, details: DailyRecordsDetail[]) {

        const history = await this.dailyRecordhistoryRepository.findOne({
            where: {
                daily_records_id: dailyRecords.id,
                deleted_at: IsNull()
            }
        });
        if (history) {
            history.updated_at = new Date();
            if (await this.dailyRecordhistoryRepository.save(history)) {
                await this.dailyRecordHistoryDetailService.CreateRange(history, details);
            }
        }
        else {
            const historyNew = new DailyRecordsHistory();
            historyNew.daily_records_id = dailyRecords.id;
            historyNew.user_id = dailyRecords.user_id;
            historyNew.record_date = dailyRecords.record_date;
            historyNew.created_at = new Date();
            if (await this.dailyRecordhistoryRepository.save(historyNew)) {
                await this.dailyRecordHistoryDetailService.CreateRange(historyNew, details);
            }
        }
    }

    //delete in DB
    async delete(id: number) {
        return await this.dailyRecordhistoryRepository.delete(id);
    }

    //delete update
    async deleteUpdate(id: number) {
        const post = await this.dailyRecordhistoryRepository.createQueryBuilder()
            .update(DailyRecordsHistory).set({
                deleted_at: new Date()
            })
            .where("id = :id", { id }).execute();
        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }

}
