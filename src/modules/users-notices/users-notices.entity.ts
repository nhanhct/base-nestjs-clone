import { Notices } from 'modules/notices';
import { User } from 'modules/user';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  //import { PasswordTransformer } from './password.transformer';
  
  @Entity({
    name: 'users-notices',
  })
  export class UsersNotices {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({nullable:true})
    user_id: number;
  
    @Column({nullable:true})
    notice_id: number;
  
    @Column({nullable:true})
    is_viewed: boolean;
    @Column({nullable:true})
    created_at: Date;

    @Column({nullable:true})
    updated_at: Date;

    @Column({nullable:true})
    deleted_at: Date;
    @ManyToOne(() => User, user=> user.id)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Notices, notice=> notice.id)
    @JoinColumn({ name: "notice_id" })
    notice: Notices;
    user_list: number[];

    title: string;
    content: string;

  }
  
  export class UsersNoticesFillableFields {
    user_id: number;
    notice_id: number;
    is_viewed: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    title: string;
    content: string;
  }
  