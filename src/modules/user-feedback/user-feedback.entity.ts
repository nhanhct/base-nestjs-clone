import { CommonCodes } from 'modules/common-codes';
import { User } from 'modules/user';
import { UserFeedbackDetail, UsersFeedbackDetailFillableFields } from 'modules/user-feedback-detail';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity({
  name: 'users_feedback',
})
export class UsersFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  records_id: number;
  
  @Column({nullable:true })
  records_type_id: number;
  @Column({nullable:true })
  feedback_date: Date;
  @Column({nullable:true })
  created_at: Date;

  @Column({nullable:true })
  updated_at: Date;

  @Column({nullable:true })
  deleted_at: Date;

  @ManyToOne(() => User, user=> user.id)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => CommonCodes, code=> code.id)
  @JoinColumn({ name: "records_type_id" })
  records_type: CommonCodes;

  @OneToMany(() => UserFeedbackDetail, detail=> detail.userFeedback)
  details: UserFeedbackDetail[];

  detailViews: UsersFeedbackDetailFillableFields[];
}

export class UserFillableFields {
  user_id: number;
  records_type_id: number;
  feedback_date: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
 }
