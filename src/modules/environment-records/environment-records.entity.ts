import { User } from 'modules/user';
import {
  EnvironmentRecordsDetail,
  EnvironmentRecordsDetailFillableFields,
} from 'modules/environment-records-detail';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
//import { PasswordTransformer } from './password.transformer';

@Entity({
  name: 'environment_records',
})
export class EnvironmentRecords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @Column({ nullable: true, length: 1000 })
  weather: string;

  @OneToMany(
    () => EnvironmentRecordsDetail,
    (detail) => detail.environmentRecords,
  )
  details: EnvironmentRecordsDetail[];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

export class EnvironmentRecordsFillableFields {
  id: number;
  user_id: number;
  date: Date;
  details: EnvironmentRecordsDetailFillableFields[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  weather: string;
}
