import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('clients')
export class Client {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  codeChallenge: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { default: [] })
  scopes: string[];

  @Column({ default: false })
  isServiceAccount: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 