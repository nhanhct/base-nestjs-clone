import { float } from 'aws-sdk/clients/lightsail';
import { CommonCodes } from 'modules/common-codes';
import { SleepRecords } from 'modules/sleep-records';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  name: 'sleep_records_fitbit',
})
export class SleepRecordsDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sleep_records_id: number;

  @Column({ nullable: true })
  type_id: number;

  @Column({ nullable: true })
  value: float;
  @Column({ nullable: true })
  sub_value: Date;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => CommonCodes, (code) => code.id)
  @JoinColumn({ name: 'type_id' })
  type: CommonCodes;

  @ManyToOne(() => SleepRecords, (sleepRecords) => sleepRecords.details)
  @JoinColumn({ name: 'sleep_records_id' })
  sleepRecords: SleepRecords;
}

export class SleepRecordDetailFillableFields {
  sleep_record_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
