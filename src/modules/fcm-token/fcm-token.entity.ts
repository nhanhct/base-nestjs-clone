import { User } from 'modules/user';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity({
  name: 'fcm_token',
})
export class FcmToken {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  user_id: number;
  @Column({ nullable: true })
  role: string;
  @Column({ nullable: true, type: "longtext" })
  token: string;
  @Column({ nullable: true })
  created_at: Date;
  @Column({ nullable: true })
  updated_at: Date;
  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: "user_id" })
  user: User;

  // @ManyToOne(() => CommonCodes, code=> code.id)
  // @JoinColumn({ name: "records_type_id" })
  // records_type: CommonCodes;


}

export class FcmTokenFillableFields {
  user_id: number;
  role: string;
  token: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
