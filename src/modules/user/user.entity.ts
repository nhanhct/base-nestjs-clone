import { CommonCodes } from 'modules/common-codes';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PasswordTransformer } from './password.transformer';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'longtext' })
  user_name: string;

  @Column({ nullable: true, type: 'longtext' })
  phone_no: string;

  @Column({ nullable: true, type: 'longtext' })
  nick_name: string;
  @Column({ nullable: true, type: 'longtext' })
  avatar: string;
  @Column({
    name: 'password',
    transformer: new PasswordTransformer(),
    nullable: true,
    type: 'longtext',
  })
  password: string;

  @Column({ nullable: true, type: 'longtext' })
  gender: string;
  @Column({ nullable: true })
  birthday: Date;
  @Column({ nullable: true, type: 'longtext' })
  email: string;
  @Column({ nullable: true, type: 'longtext' })
  social_type: string;
  @Column({ nullable: true, type: 'longtext' })
  social_token: string;
  @Column({ nullable: true, type: 'longtext' })
  social_id: string;
  @Column({ nullable: true })
  status: number;
  @Column({ nullable: true })
  is_notice_start: boolean;
  @Column({ nullable: true })
  is_notice_end: boolean;
  @Column({ nullable: true })
  is_ads: boolean;
  @Column({ nullable: true })
  state_mind: number;
  @Column({ nullable: true })
  physical_condition: number;
  @Column({ nullable: true })
  propensity_information: number;
  @Column({ nullable: true })
  kind_person: number;
  @Column({ nullable: true })
  is_device: boolean;
  @Column({ nullable: true })
  start_time_notice: number;

  @Column({ nullable: true })
  end_time_notice: number;
  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => CommonCodes, (code) => code.id)
  @JoinColumn({ name: 'status' })
  status_name: CommonCodes;

  @ManyToOne(() => CommonCodes, (code) => code.id)
  @JoinColumn({ name: 'state_mind' })
  state_mind_name: CommonCodes;

  @ManyToOne(() => CommonCodes, (code) => code.id)
  @JoinColumn({ name: 'physical_condition' })
  physical_condition_name: CommonCodes;

  @ManyToOne(() => CommonCodes, (code) => code.id)
  @JoinColumn({ name: 'propensity_information' })
  propensity_information_name: CommonCodes;

  @ManyToOne(() => CommonCodes, (code) => code.id)
  @JoinColumn({ name: 'kind_person' })
  kind_person_name: CommonCodes;

  toJSON() {
    const { password, ...self } = this;
    return self;
  }
}

export class UserFillableFields {
  user_name: string;
  phone_no: string;
  nick_name: string;
  password: string;
  gender: string;
  birthday: Date;
  lastName: string;
  email: string;
  social_type: string;
  social_token: string;
  social_id: string;
  status: number;
  is_notice_start: boolean;
  is_notice_end: boolean;
  is_ads: boolean;
  avatar: string;
  state_mind: number;
  physical_condition: number;
  propensity_information: number;
  kind_person: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  status_name: string;
  state_mind_name: string;
  physical_condition_name: string;
  propensity_information_name: string;
  kind_person_name: string;
  is_device: boolean;
}
