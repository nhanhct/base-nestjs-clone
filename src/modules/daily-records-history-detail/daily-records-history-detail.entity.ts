import { CommonCodes } from 'modules/common-codes';
import { DailyRecordsHistory } from 'modules/daily-records-history';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity({
  name: 'daily_records_history_detail',
})
export class DailyRecordsHistoryDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  daily_records_history_id: number;

  @Column({ nullable: true })
  daily_type_id: number;

  @Column({ nullable: true })
  type_id: number;

  @Column({ nullable: true })
  vol: number;

  @Column({ nullable: true })
  time_id: number;

  @Column()
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

  @ManyToOne(() => DailyRecordsHistory, dailyRecordsHistory => dailyRecordsHistory.details)
  @JoinColumn({ name: "daily_records_history_id" })
  dailyRecordsHistory: DailyRecordsHistory
}

export class DailyRecordsHistoryDetailFillableFields {
  id: number;
  daily_records_history_id: number;
  records_type_id: number;
  type_id: number;
  vol: number;
  time_id: number;
  level_id: number;
  total_time_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
