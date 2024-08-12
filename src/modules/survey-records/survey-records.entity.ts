import { SurveyRecordsDetail, SurveyRecordsDetailFillableFields } from 'modules/survey-records-detail';
import { User } from 'modules/user';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  IsNull,
} from 'typeorm'; 

@Entity({
  name: 'survey_records',
})
export class SurveyRecords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:true})
  user_id: number;

  @Column({nullable:true})
  date: Date;

  @Column({nullable:true})
  created_at: Date;

  @Column({nullable:true})
  updated_at: Date;

  @Column({nullable:true})
  deleted_at: Date; 

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => SurveyRecordsDetail, detail=> (detail.surveyRecords))
  details: SurveyRecordsDetail[]
}

export class SurveyRecordsFillableFields {
  id: number;
  user_id: number;
  date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date; 
  details: SurveyRecordsDetailFillableFields[];
 }
