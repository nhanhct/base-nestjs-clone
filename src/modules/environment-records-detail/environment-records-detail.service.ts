import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnvironmentRecords } from 'modules/environment-records';
import { Repository } from 'typeorm';
import { DateHelper } from 'utils';
import { EnvironmentRecordsDetail } from './environment-records-detail.entity';

@Injectable()
export class EnvironmentRecordsDetailService {
  constructor(
    @InjectRepository(EnvironmentRecordsDetail)
    private readonly environmentRecordDetalRepository: Repository<EnvironmentRecordsDetail>,
  ) {}

  async getByEnvironmentRecordsId(environmentRecordsId: number) {
    var result = await this.environmentRecordDetalRepository.find({
      where: {
        environment_records_id: environmentRecordsId,
        deleted_at: null,
      },
    });
    return result;
  }

  // get by type
  async getByType(typeId: number) {
    var result = await this.environmentRecordDetalRepository.find({
      where: {
        type_id: typeId,
        deleted_at: null,
      },
    });

    return result;
  }

  // get by type and date
  async getByTypeAndDate(typeId: number, date: Date) {
    var result = await this.environmentRecordDetalRepository.find({
      where: {
        type_id: typeId,
        created_at: date,
        deleted_at: null,
      },
    });

    return result;
  }

  async createRange(
    environmentRecords: EnvironmentRecords,
    recordsTypeId: number,
    details: EnvironmentRecordsDetail[],
  ) {
    const result = [];
    for (let index = 0; index < details.length; index++) {
      const element = details[index];
      const detail = new EnvironmentRecordsDetail();
      detail.records_type_id = recordsTypeId;
      detail.type_id = element.type_id;
      detail.value = element.value;
      detail.environmentRecords = environmentRecords;
      detail.created_at = new Date();
      await this.environmentRecordDetalRepository.save(detail);
      result.push(detail);
    }
    return result;
  }

  //get by type id
  async getRecordTypeId(environment_records_id, type_id) {
    return await this.environmentRecordDetalRepository.findOne({
      where: {
        environment_records_id: environment_records_id,
        type_id: type_id,
      },
    });
  }
  //get by type and environment
  async getListRecordType(environment_records_id, type_id) {
    return await this.environmentRecordDetalRepository.find({
      where: {
        environment_records_id: environment_records_id,
        type_id: type_id,
      },
    });
  }

  //create update
  async create(body: EnvironmentRecordsDetail) {
    body.created_at = new Date();
    return await this.environmentRecordDetalRepository.save(body);
  }

  async update(body) {
    return await this.environmentRecordDetalRepository
      .createQueryBuilder()
      .update(EnvironmentRecordsDetail)
      .set({
        value: body.value,
        updated_at: new Date(),
        records_type_id: body.records_type_id,
      })
      .where(
        'environment_records_id = :environment_records_id and type_id = :type_id',
        {
          environment_records_id: body.environment_records_id,
          type_id: body.type_id,
        },
      )
      .execute();
  }
  async updatePhoneLog(envId, typeId, value) {
    return await this.environmentRecordDetalRepository
      .createQueryBuilder()
      .update(EnvironmentRecordsDetail)
      .set({
        value: value,
        updated_at: new Date(),
        records_type_id: 78,
      })
      .where(
        'environment_records_id = :environment_records_id and type_id = :type_id',
        {
          environment_records_id: envId,
          type_id: typeId,
        },
      )
      .execute();
  }

  async updateRange(
    environmentRecords: EnvironmentRecords,
    recordsTypeId: number,
    details: EnvironmentRecordsDetail[],
  ) {
    await this.deleteRange(environmentRecords, recordsTypeId);
    return await this.createRange(environmentRecords, recordsTypeId, details);
  }

  async deleteRange(
    environmentRecords: EnvironmentRecords,
    recordsTypeId: number,
  ) {
    const details = await this.environmentRecordDetalRepository.find({
      where: {
        environment_records_id: environmentRecords.id,
        records_type_id: recordsTypeId,
      },
    });
    for (let index = 0; index < details.length; index++) {
      const element = details[index];
      this.environmentRecordDetalRepository.delete(element);
    }
  }
}
