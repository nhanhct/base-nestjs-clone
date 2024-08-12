import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Like, Repository } from 'typeorm';
import { Admins, AdminFillableFields } from './admins.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Hash } from '../../utils/Hash';

@Injectable()
export class AdminsService {
    constructor(
        @InjectRepository(Admins)
        private readonly adminRepository: Repository<Admins>,
    ) { }

    //get by id
    async getDetail(id: number) {
        return this.adminRepository.findOne({ id });
    }

    async getAllAdmins() {
        return this.adminRepository.find();
    }

    async getAllAdminPaging(query) {
        const take = parseInt(query.limit) || 10
        const skip = parseInt(query.page) || 0
        const keyword = query.keyword || ''
        const gubun = query.gubun || ''
        const fromDt = query.fromDt || ''
        const toDt = query.toDt || ''

        const [result, total] = await this.adminRepository
            .findAndCount(
                {
                    where: (gubun == "username" ? {
                        username: gubun == "username" ? Like('%' + keyword + '%') : "",
                        deleted_at: IsNull()
                    } : gubun == "email" ? {
                        email: gubun == "email" ? Like('%' + keyword + '%') : "",
                        deleted_at: IsNull()
                    } : gubun == "phone" ? {
                        phone: gubun == "phone" ? Like('%' + keyword + '%') : "",
                        deleted_at: IsNull()
                    } : gubun == "full_name" ? {
                        full_name: gubun == "full_name" ? Like('%' + keyword + '%') : "",
                        deleted_at: IsNull()
                    } : { deleted_at: IsNull() }),
                    order: { id: "DESC" },
                    take: take,
                    skip: skip * take
                }
            );
        //  await this.adminRepository.query("sp_prueba @username='"+ username +"'");
        return {
            data: result,
            count: total
        }
    }

    // get by name
    async getByName(username: string) {
        return this.adminRepository.findOne({ username });
    }

    //get by email
    async getByEmail(email: string) {
        return await this.adminRepository.findOne({ email });
    }

    //create
    async create(admins: Admins) {
        admins.created_at = new Date()
        admins.password = Hash.make(admins.password)

        return await this.adminRepository.save(admins);
    }

    //update
    async update(id: number, postData: AdminFillableFields) {
        console.log("id-postData", id, postData);
        const post = await this.adminRepository.createQueryBuilder()
            .update(Admins).set({
                username: postData.username,
                full_name: postData.full_name,
                email: postData.email,
                password: Hash.make(postData.password),
                phone: postData.phone,
                avatar: postData?.avatar,
                updated_at: new Date()
            })
            .where("id = :id", { id }).execute();
        console.log("post", JSON.stringify(post));
        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }

    //delete in DB
    async delete(id: number) {
        return await this.adminRepository.delete(id);
    }

    //delete update
    async deleteUpdate(id: number) {
        const post = await this.adminRepository.createQueryBuilder()
            .update(Admins).set({
                deleted_at: new Date()
            })
            .where("id = :id", { id }).execute();
        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }

}
