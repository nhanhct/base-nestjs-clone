import { Content } from 'modules/content';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
//import { PasswordTransformer } from './password.transformer';

@Entity({
  name: 'favorities',
})
export class Favorities {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content_id: number;

  @Column()
  user_id: number;
  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Content, content => content.id)
  @JoinColumn({ name: "content_id" })
  content: Content;
}

export class FavoritiesFillableFields {
  id: number;
  content_id: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
