import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCodes } from 'modules/common-codes';
import * as moment from 'moment';
import { createQueryBuilder, IsNull, Like, Raw, Repository } from 'typeorm';
import { UsersLog, UserFillableFields } from './users-log.entity';
export class CommonCodeDetail {
  id: number;
  name: string;
  value: string;
  checkExists: boolean;
}
export class ArrCommonCodesFillableFields {
  diagnosed_diseases: Array<CommonCodeDetail>;
  something_like: Array<CommonCodeDetail>;
  working_pattern: Array<CommonCodeDetail>;
  lifestyle: Array<CommonCodeDetail>;
  sleeping_environment: Array<CommonCodeDetail>;
  medicine: Array<CommonCodeDetail>;
  body_mass: Array<CommonCodeDetail>;
  large_neck: Array<CommonCodeDetail>;
  create_date: string;
}
@Injectable()
export class UsersLogService {
  constructor(
    @InjectRepository(UsersLog)
    private readonly userLogRepository: Repository<UsersLog>,
  ) {}

  //get detail
  async getById(id: number) {
    let result = new ArrCommonCodesFillableFields();
    const userLogs = await this.userLogRepository.findOne({
      where: { user_id: id },
    });
    const createDate = moment(userLogs?.created_at).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    result.create_date = createDate;
    let diagnosed_diseases = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 117 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.diagnosed_diseases = diagnosed_diseases;
    let something_like = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 130 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.something_like = something_like;
    let working_pattern = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 136 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.working_pattern = working_pattern;
    let lifestyle = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 142 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.lifestyle = lifestyle;
    let sleeping_environment = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 149 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.sleeping_environment = sleeping_environment;
    let medicine = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 155 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.medicine = medicine;
    let body_mass = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 158 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.body_mass = body_mass;
    let large_neck = await createQueryBuilder(CommonCodes, 'co')
      .select([
        'co.id as id',
        'co.name as name',
        'ul.value as value',
        'case when ul.id > 0 then true else false end as checkExists',
      ])
      .leftJoin(UsersLog, 'ul', 'ul.type_id = co.id and ul.user_id =:id', {
        id: id,
      })
      .where('co.parent_id =:parent_id', { parent_id: 162 })
      .orderBy('co.id', 'ASC')
      .getRawMany();
    result.large_neck = large_neck;
    return result;
  }

  //get by user id
  async getByUserId(userId: number) {
    const userLog = await this.userLogRepository.find({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      relations: ['user'],
    });

    return userLog;
  }

  //create update
  async createUpdate(userId: number, usersLog: UsersLog[], created_at: Date) {
    //delete list user id
    const userLogIds = await this.getByUserId(userId);
    if (userLogIds.length > 0) {
      for (let i = 0; i < userLogIds.length; i++) {
        await this.delete(userLogIds[i].id);
      }
    }
    //create
    let usersLog_ = new UsersLog();
    if (usersLog.length > 0) {
      for (let i = 0; i < usersLog.length; i++) {
        const usersLogModel = new UserFillableFields();

        usersLogModel.created_at = created_at;
        usersLogModel.type_id = usersLog[i].type_id;
        usersLogModel.value = usersLog[i].value;
        usersLogModel.user_id = userId;

        usersLog_ = await this.userLogRepository.save(usersLogModel);
      }
    }

    return usersLog_;
  }

  //delete user
  async deleteUser(userId: number) {
    const userLogs = await this.getByUserId(userId);
    if (userLogs.length > 0) {
      for (let i = 0; i < userLogs.length; i++) {
        await this.userLogRepository.delete(userLogs[i].id);
      }
    }

    return userLogs;
  }

  //delete
  async delete(id: number) {
    const userLog = await this.userLogRepository.delete(id);

    return userLog;
  }
}
