import { Admins } from 'modules/admins';
import { CommonCodes } from 'modules/common-codes';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from 'modules/user';

@Entity({
    name: 'notifications',
})
export class Notifications {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user_id: number;

    @Column({ type: "longtext", nullable: true })
    title: string;

    @Column({ type: "longtext", nullable: true })
    content: string;

    @Column({ nullable: true })
    is_viewed: boolean;
    @Column({ type: "longtext", nullable: true })
    notice_type: string;

    @Column({ nullable: true })
    target_id: number;


    @Column({ nullable: true })
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;

    @Column({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: "user_id" })
    user: User;
}

export class NotificationsFillableFields {
    title: string;
    content: string;
    notice_type: string;
    user_id: number;
    target_id: number;
    is_viewed: boolean;
    updated_at: string;
    deleted_at: string;
    created_at: string;
}
