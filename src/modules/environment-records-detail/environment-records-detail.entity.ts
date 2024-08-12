import { CommonCodes } from 'modules/common-codes';
import { EnvironmentRecords } from 'modules/environment-records';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  name: 'environment_records_detail',
})
export class EnvironmentRecordsDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  environment_records_id: number;

  @Column({ nullable: true })
  records_type_id: number;

  @Column({ nullable: true })
  type_id: number;

  @Column({ nullable: true, type: "float" })
  value: number;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => CommonCodes, code => code.id)
  @JoinColumn({ name: "records_type_id" })
  records_type: CommonCodes;

  @ManyToOne(() => CommonCodes, code => code.id)
  @JoinColumn({ name: "type_id" })
  type: CommonCodes;

  @ManyToOne(() => EnvironmentRecords, environmentRecords => environmentRecords.details)
  @JoinColumn({ name: "environment_records_id" })
  environmentRecords: EnvironmentRecords
}

export class EnvironmentRecordsDetailFillableFields {
  id: number;
  environment_records_id: number;
  records_type_id: number;
  type_id: number;
  value: number
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  type_name: string;
  records_type_name: string;
}
