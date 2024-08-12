import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; 
import { SurveyRecords, SurveyRecordsService } from 'modules/survey-records'; 
import { IsNull, Repository } from 'typeorm';
import { SurveyRecordsDetail, SurveyRecordsDetailFillableFields } from '.';

@Injectable()
export class SurveyRecordsDetailService {
    constructor(
        @InjectRepository(SurveyRecordsDetail)
        private readonly surveyRecordDetailRepository: Repository<SurveyRecordsDetail>,
    ) {}

     //get by id
    async getDetailBySurveyId(surveyId: number) {
        const surveyRecordsDetail = await this.surveyRecordDetailRepository.findOne({
            where:{ 
                survey_records_id :surveyId,
                deleted_at: IsNull()

            },
            relations:["type","survey_name","survey_value"],
            });
        
        return surveyRecordsDetail;
    }

    //create
    async createRange(surveyRecords: SurveyRecords ,details : SurveyRecordsDetailFillableFields[]){
        const result = [];
        for (let index = 0; index < details.length; index++) {
            const element = details[index];
            if(element)
            {
                const detail = new SurveyRecordsDetail();
                detail.type_id = element.type_id;
                detail.survey_name_id = element.survey_name_id;
                detail.survey_value_id = element.survey_value_id;
                detail.surveyRecords = surveyRecords;
                detail.created_at = new Date();
                this.surveyRecordDetailRepository.save(detail);
                result.push(detail);
            }
        }
        return result;
    }
    async updateRange(surveyRecords: SurveyRecords ,details : SurveyRecordsDetailFillableFields[])
    {
        var surveyRecordDetails = await this.surveyRecordDetailRepository.find({
            survey_records_id: surveyRecords.id
        });
        for (let index = 0; index < details.length; index++) {
            const element = details[index];
            const detail = surveyRecordDetails.find(m=> m.type_id == element.type_id && m.survey_name_id == element.survey_name_id);
            if(detail)
            {
                await this.surveyRecordDetailRepository.createQueryBuilder()
                            .update(SurveyRecordsDetail).set({  
                                survey_value_id:  element.survey_value_id,      
                                updated_at:new Date(),
                            }).where("id = :id", { id : detail.id })
                            .execute();
            }
            else
            {
                const detail = new SurveyRecordsDetail();
                detail.type_id = element.type_id;
                detail.survey_name_id = element.survey_name_id;
                detail.survey_value_id = element.survey_value_id;
                detail.surveyRecords = surveyRecords;
                detail.created_at = new Date();
                this.surveyRecordDetailRepository.save(detail);
            }
        }
    }

    //update admin
    async updateAdmin(id: number, postData: SurveyRecordsDetailFillableFields) {
        const post = await this.surveyRecordDetailRepository.createQueryBuilder()
            .update(SurveyRecordsDetail).set({ 
                survey_records_id:postData.survey_records_id,
                survey_name_id:postData.survey_name_id,
                survey_value_id: postData.survey_value_id,
                type_id:postData.type_id,
                updated_at:new Date()
            }) 
        .where("id = :id", { id }).execute();
        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }

     //delete update
     async deleteUpdate(id: number) {
        const post = await this.surveyRecordDetailRepository.createQueryBuilder()
          .update(SurveyRecordsDetail).set({         
                deleted_at:new Date()
            }) 
          .where("id = :id", { id }).execute();
         if (!post) {
          throw new NotFoundException();
        }
    }

      //delete in DB
    async delete(id: number) {
        return await this.surveyRecordDetailRepository.delete(id);
    }
}
