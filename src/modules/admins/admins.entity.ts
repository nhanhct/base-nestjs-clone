import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
//import { PasswordTransformer } from './password.transformer';

@Entity({
  name: 'admins',
})
export class Admins {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  username: string;

  @Column({ nullable:true,length: 255 })
  full_name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ nullable:true,length: 255 })
  phone: string;

  @Column({ nullable:true,length: 1000 })
  avatar: string;

  @Column({ length: 1000 })
  password: string;

  @Column({ nullable:true,length: 255 })
  role: string;

  @Column()
  created_at: Date;

  @Column({nullable:true})
  updated_at: Date;

  @Column({nullable:true})
  deleted_at: Date;

}

export class AdminFillableFields {
  username: string;
  full_name: string;
  email: string;
  phone: string;
  avatar: string;
  password: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
