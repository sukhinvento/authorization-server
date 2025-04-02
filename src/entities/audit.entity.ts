import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  PROCESS = 'PROCESS',
}

export enum AuditResourceType {
  USER = 'USER',
  FILE = 'FILE',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  SYSTEM = 'SYSTEM',
}

@Entity()
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: AuditActionType,
  })
  action: AuditActionType;

  @Column({
    type: 'enum',
    enum: AuditResourceType,
  })
  resourceType: AuditResourceType;

  @Column()
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  previousState?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newState?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
} 