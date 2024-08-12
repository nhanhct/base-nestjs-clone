import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hash } from 'utils/Hash';
import { UserPasswordHistory } from './user-password-history.entity';
@Injectable()
export class UserPasswordHistoryService {
  constructor(
    @InjectRepository(UserPasswordHistory)
    private readonly userPasswordHistoryRepository: Repository<UserPasswordHistory>,
  ) { }

  //get password
  async getPasswordByUser(userId: number) {
    const password = await this.userPasswordHistoryRepository.find({
      where: {
        user_id: userId
      },
      order: {
        created_at: "DESC"
      },
    });

    return password;
  }

  //get last password
  async getLastPasswordByUser(userId: number) {
    const lastPassword = await this.userPasswordHistoryRepository.find({
      where: {
        user_id: userId
      },
      order: {
        created_at: "DESC"
      },
      take: 1
    });

    return lastPassword;
  }

  //get last password compare new password
  async getLastPasswordByUserPassword(userId: number, password: String) {
    const passwordHistoryList = await this.userPasswordHistoryRepository.find({
      where: {
        user_id: userId,
      },
      order: {
        created_at: "DESC"
      }
    });
    var result = null;
    passwordHistoryList.every(item => {
      if (Hash.compare(password, item.password)) {
        result = item;
        return false;// break every
      }
    });

    return result;
  }

  //create
  async create(history: UserPasswordHistory) {
    history.created_at = new Date()
    return await this.userPasswordHistoryRepository.save(history);
  }

  //delete in DB
  async delete(id: number) {
    const userPasswordHistory = await this.userPasswordHistoryRepository.delete(id);

    return userPasswordHistory;
  }
}