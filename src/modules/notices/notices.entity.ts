import { Admins } from 'modules/admins';
import { CommonCodes } from 'modules/common-codes';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
//import { PasswordTransformer } from './password.transformer';

@Entity({
  name: 'notices',
})
export class Notices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "longtext", nullable: true })
  title: string;

  @Column({ type: "longtext", nullable: true })
  content: string;

  @Column({ type: "longtext", nullable: true })
  html_content: string;

  @Column()
  create_by: number;
  @Column()
  type: number;
  @Column({ nullable: true })
  status: number;
  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => CommonCodes, code => code.id)
  @JoinColumn({ name: "status" })
  status_name: CommonCodes;

  @ManyToOne(() => Admins, admin => admin.id)
  @JoinColumn({ name: "create_by" })
  admin_name: Admins;

  @ManyToOne(() => CommonCodes, code => code.id)
  @JoinColumn({ name: "type" })
  type_name: CommonCodes;

}

export class NoticesFillableFields {
  title: string;
  content: string;
  html_content: string;
  status: number;
  type: number;
  create_by: number;
  updated_at: string;
  deleted_at: string;
  created_at: string;
}
