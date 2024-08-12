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
    name: 'contents',
  })
  export class Content {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable:true,length: 1000 })
    title: string;
  
    @Column({ nullable:true,length: 1000 })
    pre_img: string;
  
    @Column({nullable:true})
    favorite_count: number;

    @Column({ nullable:true,length: 1000 })
    url: string;

    @Column({ nullable:true,length: 10000 })
    description: string;

    @Column({nullable:true})
    category: number;

    @Column()
    created_at: Date;

    @Column({nullable:true})
    updated_at: Date;

    @Column({nullable:true})
    deleted_at: Date;

     @ManyToOne(() => CommonCodes, code=> code.id)
    @JoinColumn({ name: "category" })
    category_name: CommonCodes;
    
  }
  
  export class ContentFillableFields {
    title: string;
    pre_img: string;
    favorite_count: number;
    url: string;
    description: string;
    category: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    category_name:string;
  }
  export class ContentReturn {
    id:number;
    title: string;
    pre_img: string;
    favorite_count: number;
    url: string;
    description: string;
    category: number;
    checkLike:boolean;
    created_at: Date;
  }
  