import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersFeedback } from 'modules/user-feedback';
import { Repository } from 'typeorm';
import { UserFeedbackDetail } from './user-feedback-detail.entity';

@Injectable()
export class UserFeedbackDetailService {
    constructor(
        @InjectRepository(UserFeedbackDetail)
        private readonly userFeedbackDetailRepository: Repository<UserFeedbackDetail>,
    ) { }

    //create
    async create(userFeedbackDetail: UserFeedbackDetail) {
        return await this.userFeedbackDetailRepository.save(userFeedbackDetail);
    }

    //delete
    async deletedRange(userFeedback: UsersFeedback) {
        const details = await this.userFeedbackDetailRepository.find({ user_feedback_id: userFeedback.id });
        for (let index = 0; index < details.length; index++) {
            const detail = details[index];
            if (detail)
                this.userFeedbackDetailRepository.delete(detail.id);
        }
    }
}
