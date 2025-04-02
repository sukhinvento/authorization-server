import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('oauth_tokens')
export class OAuthToken {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index()
  userId: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column()
  @Index()
  refreshToken: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('oauth_codes')
export class OAuthCode {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index()
  userId: string;

  @Column()
  code: string;

  @Column()
  codeChallenge: string;

  @Column()
  codeChallengeMethod: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 