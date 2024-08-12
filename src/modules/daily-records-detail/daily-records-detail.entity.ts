import { CommonCodes } from 'modules/common-codes';
import { DailyRecords } from 'modules/daily-records';
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
  name: 'daily_records_detail',
})
export class DailyRecordsDetail {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  daily_records_id: number;

  @Column({ nullable: true })
  daily_type_id: number;

  @Column({ nullable: true })
  time_id: number;

  @Column({ nullable: true })
  type_id: number;

  @Column({ nullable: true })
  vol: number;


  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => CommonCodes, code => code.id)
  @JoinColumn({ name: "daily_type_id" })
  daily_type: CommonCodes;

  @ManyToOne(() => CommonCodes, code => code.id)
  @JoinColumn({ name: "type_id" })
  type: CommonCodes;

  @ManyToOne(() => CommonCodes, code => code.id)
  @JoinColumn({ name: "time_id" })
  time: CommonCodes;

  @ManyToOne(() => DailyRecords, dailyRecords => dailyRecords.details)
  @JoinColumn({ name: "daily_records_id" })
  dailyRecords: DailyRecords

}

export class DailyRecordsDetailFillableFields {
  id: number;
  daily_records_id: number;
  daily_type_id: number;
  time_id: number;
  type_id: number;
  vol: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class StatusDailyRecord {
  alcolStatus: number;
  cafeStatus: number;
  napStatus: number;
  stressStatus: number;
}