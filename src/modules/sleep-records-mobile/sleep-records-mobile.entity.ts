import { SleepRecords } from 'modules/sleep-records';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  name: 'sleep_records_mobile',
})
export class SleepRecordsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sleep_records_id: number;

  @Column({ nullable: true })
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @Column({ nullable: true })
  sleep_time: number;

  @Column({ nullable: true })
  awake_count: number;

  @Column({ type: 'longtext', nullable: true })
  url: string;

  @ManyToOne(() => SleepRecords, (sleepRecords) => sleepRecords.details)
  @JoinColumn({ name: 'sleep_records_id' })
  sleepRecords: SleepRecords;

}

export class SleepRecordsLogFillableFields {
  date: Date;
  start_time: Date;
  end_time: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  sleep_time: number;
  awake_count: number;
  url: string;
}
