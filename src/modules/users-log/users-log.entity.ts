import { User } from 'modules/user';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity({
  name: 'users_log',
})
export class UsersLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  type_id: number;
  @Column({ nullable: true, type: 'longtext' })
  value: string;
  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

export class UserFillableFields {
  user_id: number;
  type_id: number;
  value: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
