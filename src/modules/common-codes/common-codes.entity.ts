import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
//import { PasswordTransformer } from './password.transformer';

@Entity({
  name: 'common_codes',
})
export class CommonCodes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  parent_id: number;

  @Column({ length: 255 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true, type: 'longtext' })
  value: string;

  @Column()
  order: number;
  @Column()
  is_lock: boolean;

  @Column({ nullable: true, type: 'longtext' })
  ex1: string;
  @Column({ nullable: true, type: 'longtext' })
  ex2: string;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
}

export class CommonCodesFillableFields {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  value: string;
  order: number;
  ex1: string;
  ex2: string;
  is_lock: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
