import { DailyRecordsDetail, DailyRecordsDetailFillableFields } from 'modules/daily-records-detail/daily-records-detail.entity';
import { User } from 'modules/user';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  name: 'daily_records',
})
export class DailyRecords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  record_date: Date;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;


  @OneToMany(() => DailyRecordsDetail, detail => detail.dailyRecords)
  details: DailyRecordsDetail[];

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: "user_id" })
  user: User;
}

export class DailyRecordsFillableFields {
  id: number;
  user_id: number;
  record_date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  details: DailyRecordsDetailFillableFields[];
}
