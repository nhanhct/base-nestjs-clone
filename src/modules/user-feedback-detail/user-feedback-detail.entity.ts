import { CommonCodes } from 'modules/common-codes';
import { UsersFeedback } from 'modules/user-feedback';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  
  @Entity({
    name: 'users_feedback_detail',
  })
  export class UserFeedbackDetail {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({nullable:true})
    user_feedback_id: number;
  
    @Column({nullable:true})
    records_detail_id: number;
    @Column({nullable:true})
    status: number;
     
    @Column({nullable:true })
    created_at: Date;
  
    @Column({nullable:true })
    updated_at: Date;
  
    @Column({nullable:true })
    deleted_at: Date;
    
    @ManyToOne(() => CommonCodes, code=> code.id)
    @JoinColumn({ name: "status" })
    statusCode: CommonCodes;

    @ManyToOne(() => UsersFeedback, usersFeedback=> usersFeedback.details)
    @JoinColumn({ name: "user_feedback_id" })
    userFeedback: UsersFeedback;
  }
  
  export class UsersFeedbackDetailFillableFields { 
    user_feedback_id: number;
    records_detail_id: number;
    status: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    daily_type_id: number;
    time_id: number;
    type_id: number;
    vol: number;
    daily_type_name: string;
    time_name: string;
    type_name: string;
    status_name: string;
    status_value: string; 
   }
  