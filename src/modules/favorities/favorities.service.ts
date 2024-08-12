import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'modules/user';
import { Repository } from 'typeorm';
import { Favorities } from './favorities.entity';

@Injectable()
export class FavoritiesService {
  constructor(
    @InjectRepository(Favorities)
    private readonly favoritiesRepository: Repository<Favorities>,
    private readonly usersService: UsersService,
  ) { }

  //get by id
  async getListByUser() {
    return await this.favoritiesRepository.find();
  }

  //get all
  async getAll() {
    return await this.favoritiesRepository.find({
      where: {
        deleted_at: null
      }
    });
  }

  //get by user id, content id
  async getByContentAndUser(user_id: number, content_id: number) {
    return await this.favoritiesRepository.findOne({
      where: {
        content_id: content_id,
        user_id: user_id
      },
    })
  }

  //get by user id 
  async getByUser(user_id: number) {
    return await this.favoritiesRepository.find({
      where: {
        user_id: user_id,
        deleted_at: null
      },
      relations: ['content']
    })
  }

  //count by content 
  async countByContentAndUser(user_id: number, content_id: number) {
    return await this.favoritiesRepository.count({
      where: {
        content_id: content_id,
      },

    })
  }

  //create
  async createOrDelete(content_id: number, user_id: number) {
    let checkExist = await this.favoritiesRepository.findOne({
      where: {
        content_id: content_id,
        user_id: user_id
      },
    })
    if (checkExist) {
      this.favoritiesRepository.delete(checkExist.id)
    } else {
      let favorities = new Favorities()
      favorities.content_id = content_id
      favorities.user_id = user_id
      favorities.created_at = new Date()
      return await await this.favoritiesRepository.save(favorities)
    }
  }
}
