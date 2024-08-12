import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'authentication_apple',
})
export class AuthenticationApple {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  apple_id: string;
  @Column()
  status: boolean;
  @Column()
  create_at: Date;
}

export class AuthAppleFillableFields {
  id: number;
  email: string;
  apple_id: string;
  create_at: Date;
  status: boolean;

}
