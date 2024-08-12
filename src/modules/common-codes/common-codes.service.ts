import { Injectable, NotFoundException } from '@nestjs/common';
import { CommonCodes, CommonCodesFillableFields } from './common-codes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CommonCodesService {
  constructor(
    @InjectRepository(CommonCodes)
    private readonly commonCodeRepository: Repository<CommonCodes>,
  ) { }

  //get by id
  public async getByid(id: number) {
    const commonCode = await this.commonCodeRepository.findOne({ id });
    if (commonCode != null) {
      if (commonCode.deleted_at == null) {
        return commonCode;
      }
    }
    return null;
  }

  async getListByParent(id: number) {
    const commonCodes = await this.commonCodeRepository.find({
      where: {
        parent_id: id,
        deleted_at: null,
      },
    });

    return commonCodes;
  }

  async getByParentCode(code: string) {
    const commonCode = await this.commonCodeRepository.findOne({
      where: {
        code: code,
        parent_id: 0,
      },
    });
    return commonCode;
  }

  //get Parent Code
  async getParentCode(payload: CommonCodesFillableFields) {
    const commonCode = await this.commonCodeRepository.find(payload);
    const cm = Array<CommonCodes>();
    if (commonCode.length > 0) {
      for (let index = 0; index < commonCode.length; index++) {
        if (commonCode[index].parent_id == 0) {
          cm.push(commonCode[index]);
        }
      }
    }
    return cm;
  }

  //get by ParentId
  async getParentId(id: number, payload: CommonCodesFillableFields) {
    const commonCode = await this.commonCodeRepository.find(payload);
    const cm = Array<CommonCodes>();
    if (commonCode.length > 0) {
      for (let index = 0; index < commonCode.length; index++) {
        if (
          commonCode[index].parent_id == id &&
          commonCode[index].deleted_at == null
        ) {
          cm.push(commonCode[index]);
        }
      }
    }
    return cm;
  }

  //create
  async create(commonCode: CommonCodes) {
    commonCode.created_at = new Date();
    return await this.commonCodeRepository.save(commonCode);
  }

  //update
  async update(id: number, postData: CommonCodesFillableFields) {
    const post = await this.commonCodeRepository
      .createQueryBuilder()
      .update(CommonCodes)
      .set({
        parent_id: postData.parent_id,
        code: postData.code,
        name: postData.name,
        value: postData.value,
        order: postData.order,
        is_lock: postData.is_lock,
        updated_at: new Date(),
      })
      .where('id = :id', { id })
      .execute();
    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  //update status
  async updateStatus(id: number, postData: CommonCodesFillableFields) {
    const post = await this.commonCodeRepository
      .createQueryBuilder()
      .update(CommonCodes)
      .set({
        is_lock: postData.is_lock,
        updated_at: new Date(),
      })
      .where('id = :id', { id })
      .execute();
    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  //delete in DB
  async delete(id: number) {
    return await this.commonCodeRepository.delete(id);
  }

  //delete update
  async deleteUpdate(id: number) {
    const post = await this.commonCodeRepository
      .createQueryBuilder()
      .update(CommonCodes)
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

  async getCodeByParentCode(code: string) {
    const parentCode = await this.commonCodeRepository.findOne({
      where: {
        code: code,
        parent_id: 0,
      },
    });
    if (parentCode) {
      return await this.commonCodeRepository.find({
        where: {
          parent_id: parentCode.id,
          is_lock: false,
        },
        order: {
          order: 'ASC',
        },
      });
    }
    return null;
  }
}
