import { CommonCodes } from 'modules/common-codes';
import { SurveyRecords } from 'modules/survey-records';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm'; 

@Entity({
  name: 'survey_records_detail',
})
export class SurveyRecordsDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:true})
  survey_records_id: number;

  @Column({nullable:true})
  type_id: number;

  @Column({nullable:true})
  survey_name_id: number;

  @Column({nullable:true})
  survey_value_id: number;

  @Column({nullable:true})
  created_at: Date;

  @Column({nullable:true})
  updated_at: Date;

  @Column({nullable:true})
  deleted_at: Date;

  @ManyToOne(() => CommonCodes, code=> code.id)
  @JoinColumn({ name: "type_id" })
  type: CommonCodes;

  @ManyToOne(() => CommonCodes, code=> code.id)
  @JoinColumn({ name: "survey_name_id" })
  survey_name: CommonCodes;

  @ManyToOne(() => CommonCodes, code=> code.id)
  @JoinColumn({ name: "survey_value_id" })
  survey_value: CommonCodes;


  @ManyToOne(() => SurveyRecords, surveyRecords=> surveyRecords.details)
  @JoinColumn({ name: "survey_records_id" })
  surveyRecords : SurveyRecords
}

export class SurveyRecordsDetailFillableFields {
  id: number;
  survey_records_id: number;
  type_id: number;
  survey_name_id: number;
  survey_value_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
