 
import { DailyRecordsHistoryDetail } from 'modules/daily-records-history-detail';
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
    name: 'daily_records_history',
  })
  export class DailyRecordsHistory {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    daily_records_id: number;

    @Column()
    user_id: number;
   
    @Column({ nullable:true  })
    record_date: Date;

    @Column()
    created_at: Date;

    @Column({nullable:true })
    updated_at: Date;

    @Column({nullable:true })
    deleted_at: Date;
    
    @OneToMany(() => DailyRecordsHistoryDetail, detail=> detail.dailyRecordsHistory)
    details: DailyRecordsHistoryDetail[];

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: "user_id" })
    user: User;
  }
  
  export class DailyRecordsHistoryFillableFields {
    id: Number;
    user_id: Number;
    daily_records_id: Number;
    record_date: Date;
    
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
  }
  