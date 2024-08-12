import { float } from 'aws-sdk/clients/lightsail';
import { bool } from 'aws-sdk/clients/signer';
import { CommonCodes } from 'modules/common-codes';
import { SleepRecordsDetail } from 'modules/sleep-records-fitbit';
import { SleepRecordsLog } from 'modules/sleep-records-mobile';
import { User } from 'modules/user';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  name: 'sleep_records',
})
export class SleepRecords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  date: Date;

  @Column({ nullable: true })
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  awake_count: number;

  @Column({ nullable: true })
  sleep_eval: number;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @OneToMany(() => SleepRecordsDetail, (detail) => detail.sleepRecords)
  details: SleepRecordsDetail[];

  @OneToMany(() => SleepRecordsLog, (log) => log.sleepRecords)
  logs: SleepRecordsLog[];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CommonCodes, (code) => code.id)
  @JoinColumn({ name: 'sleep_eval' })
  statusleep_records_lvl_name: CommonCodes;
}

export class SleepRecordFillableFields {
  user_id: number;
  date: Date;
  start_time: Date;
  end_time: Date;
  awake_count: number;
  sleep_eval: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class SleepRecordUserAverage {
  start_time: float;
  end_time: float;
  awake_count: number;
  sleep_quality: float;
  sleep_time: float;
  sleep_time_seconds: number;
  change_sleep_time: float;
  change_awake_count: float;
  change_sleep_quality_all: float;
  change_awake_count_all: float;
  change_sleep_time_all: float;
  total_record: number;
}

export class SleepRecordOverallAverage {
  start_time: float;
  end_time: float;
  awake_count: number;
  sleep_quality: float;
  sleep_time: float;
  sleep_time_seconds: number;
  change_sleep_time: float;
  change_awake_count: float;
  change_sleep_quality_all: float;
  change_awake_count_all: float;
  change_sleep_time_all: float;
  total_record: number;
}

export class SleepRecord {
  start_time: float;
  end_time: float;
  sleep_time: number;
  sleep_time_seconds: number;
  sleep_time_status: bool;
  awake_count: number;
  awake_count_status: bool;
  awake_time: number;
  awake_time_status: bool;
  sleep_point: float;
  change_sleep_quality: float;
  change_awake_count: float;
  records_mobile: Array<RecordsMobile>;
}

export class RecordsMobile {
  start_hour: float;
  end_hour: float;
  time_seconds: number;
}

export class RecordValue {
  name: string;
  time: string;
  vol: float;
  status: bool;
}

export class EnvironmentRecordMobile {
  mobile_step: number;
  mobile_step_status: bool;
  mobile_tem: float;
  mobile_tem_status: bool;
  mobile_time: number;
  mobile_time_status: bool;
}

export class EnvironmentRecordFitbit {
  fitbit_step: number;
  fitbit_step_status: bool;
  fitbit_time: number;
  fitbit_time_status: bool;
  fitbit_distance: float;
  fitbit_distance_status: bool;
  fitbit_heart_rate: number;
  fitbit_heart_rate_status: bool;
  activity_time: float;
  activity_time_status: bool;
  sleep_score: float;
  sleep_stages: number;
  sleep_time: number;
  sleep_time_status: bool;
  nap_time: number;
  un_known_time: number;
  awake_time: number;
}

export class SleepRecordDataHomeHistory {
  sleepScore: number;
  sleepTip: string;
  date: string;
}

export class TotalAverage {
  overall_average: SleepRecordOverallAverage;
  user_average: SleepRecordUserAverage;
  sleep_record: SleepRecord;
  is_record_sleep: bool;
  sleep_tip: string;
  environment_record_mobile: EnvironmentRecordMobile;
  environment_record_fitbit: EnvironmentRecordFitbit;

  alcol_record: RecordValue;
  cafe_record: RecordValue;
  nap_record: RecordValue;
  stress_record: RecordValue;
  totalRecord: number;
  sleepIndexOverall: number;
}
