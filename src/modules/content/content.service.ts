import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Console } from 'console';
import { CommonCodesService } from 'modules/common-codes';
import { FavoritiesService } from 'modules/favorities';
import { IsNull, Like, Repository } from 'typeorm';
import { isTemplateTail } from 'typescript';
import { Content, ContentFillableFields, ContentReturn } from '.';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly commonCodesService: CommonCodesService,
    private readonly favoritesService: FavoritiesService,

  ) { }

  async getContentList() {
    const data = await this.contentRepository.find({ where: { category: 12 }, order: { id: "DESC" } })

    return data
  }

  async getActionList() {
    const data = await this.contentRepository.find({ where: { category: 13 }, order: { id: "DESC" } })

    return data
  }

  async getDetailContent(id: number, user_id: number) {
    const content = await this.contentRepository.findOne({
      where: { id: id },
      relations: ["category_name"],
    });
    let contentItem = new ContentReturn()

    contentItem.id = content.id
    contentItem.category = content.category
    contentItem.description = content.description
    contentItem.pre_img = content.pre_img
    contentItem.title = content.title
    contentItem.url = content.url
    contentItem.created_at = content.created_at

    let checkExist = await this.favoritesService.getByContentAndUser(user_id, content.id)
    let count = await this.favoritesService.countByContentAndUser(user_id, content.id)
    contentItem.favorite_count = count
    if (checkExist) {
      contentItem.checkLike = true
    } else {
      contentItem.checkLike = false
    }

    return contentItem
  }

  //
  async getById(id: number) {
    const content = await this.contentRepository.findOne({
      where: { id: id },
      relations: ["category_name"],
    });

    return content;
  }

  //get count number like content
  async countNumberLikeContent(user_id: number) {
    const contents = await this.getContentList()
    var arrContent = []
    // if (contents.length > 0) {
    for (let index = 0; index < contents.length; index++) {
      let contentItem = new ContentReturn()
      contentItem.id = contents[index].id
      contentItem.category = contents[index].category
      contentItem.description = contents[index].description
      contentItem.pre_img = contents[index].pre_img
      contentItem.title = contents[index].title
      contentItem.url = contents[index].url
      contentItem.created_at = contents[index].created_at

      let checkExist = await this.favoritesService.getByContentAndUser(user_id, contents[index].id)
      let count = await this.favoritesService.countByContentAndUser(user_id, contents[index].id)
      contentItem.favorite_count = count
      if (checkExist) {
        contentItem.checkLike = true
      } else {
        contentItem.checkLike = false
      }
      arrContent.push(contentItem)
    }
    return arrContent;
  }

  async countNumberLikeAction(user_id: number) {
    const contents = await this.getActionList()
    var arrContent = []
    // if (contents.length > 0) {
    for (let index = 0; index < contents.length; index++) {
      let contentItem = new ContentReturn()
      contentItem.id = contents[index].id
      contentItem.category = contents[index].category
      contentItem.description = contents[index].description
      contentItem.pre_img = contents[index].pre_img
      contentItem.title = contents[index].title
      contentItem.url = contents[index].url
      contentItem.created_at = contents[index].created_at

      let checkExist = await this.favoritesService.getByContentAndUser(user_id, contents[index].id)
      let count = await this.favoritesService.countByContentAndUser(user_id, contents[index].id)
      contentItem.favorite_count = count
      if (checkExist) {
        contentItem.checkLike = true
      } else {
        contentItem.checkLike = false
      }
      arrContent.push(contentItem)
    }
    return arrContent;
  }

  //update number count
  async updateNumberCount(id: number, number: number) {
    const post = await this.contentRepository.createQueryBuilder()
      .update(Content).set({
        favorite_count: number,
        updated_at: new Date()
      })
      .where("id = :id", { id }).execute();
    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }
  //
  async getAllContentPaging(query) {
    const take = parseInt(query.limit) || 10
    const skip = parseInt(query.page) || 0
    const status = query.status || ''
    const keyword = query.keyword || ''
    const gubun = query.gubun || ''
    const [result, total] = await this.contentRepository
      .findAndCount(
        {
          where: (gubun == "title" && status != '') ? {
            title: gubun == "title" ? Like('%' + keyword + '%') : '',
            category: status,
            deleted_at: IsNull()
          } : (gubun == "title" && status == '') ? {
            title: gubun == "title" ? Like('%' + keyword + '%') : '',
            deleted_at: IsNull()
          } : (gubun == "description" && status != '') ? {
            description: (gubun == "description") ? Like('%' + keyword + '%') : '',
            category: status,
            deleted_at: IsNull()
          } : (gubun == "description" && status == '') ? {
            description: (gubun == "description") ? Like('%' + keyword + '%') : '',
            deleted_at: IsNull()
          } : (gubun == "" && status != '') ? {
            category: status,
            deleted_at: IsNull()
          } : { deleted_at: IsNull() },
          relations: ["category_name"],
          order: { id: "DESC" },
          take: take,
          skip: skip * take
        }
      );
    return {
      data: result,
      count: total
    }
  }

  //create
  async create(content: Content) {
    content.created_at = new Date()
    return await this.contentRepository.save(content);
  }

  //update
  async update(id: number, postData: ContentFillableFields) {
    const post = await this.contentRepository.createQueryBuilder()
      .update(Content).set({
        title: postData.title,
        description: postData.description,
        pre_img: postData.pre_img,
        url: postData.url,
        category: postData.category,
        favorite_count: postData?.favorite_count,
        updated_at: new Date()
      })
      .where("id = :id", { id }).execute();
    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  //delete in DB
  async delete(id: number) {
    return await this.contentRepository.delete(id);
  }

  //delete update
  async deleteUpdate(id: number) {
    const post = await this.contentRepository.createQueryBuilder()
      .update(Content).set({
        deleted_at: new Date()
      })
      .where("id = :id", { id }).execute();
    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

}
