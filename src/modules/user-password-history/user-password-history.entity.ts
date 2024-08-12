import { PasswordTransformer } from 'modules/user';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity({
    name: 'users-password-history',
  })
  export class UserPasswordHistory {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    user_id: number;
  
    @Column()
    expiry_date: Date;

    @Column({type:"longtext"})
    password: string;
 
    @Column({nullable:true })
    created_at: Date;

    @Column({nullable:true })
    updated_at: Date;

    @Column({nullable:true })
    deleted_at: Date;
  }
  
  export class UserPasswordHistoryFillableFields {
    user_id: number;
    password: string; 
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
  }
  