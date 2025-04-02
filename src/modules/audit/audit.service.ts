import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(logData: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepository.create(logData);
    return this.auditLogRepository.save(log);
  }

  async getLogs(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getLogsByUserId(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByResourceId(resourceId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AuditLog> {
    const audit = await this.auditLogRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!audit) {
      throw new NotFoundException(`Audit log with ID "${id}" not found`);
    }
    return audit;
  }

  async create(userId: string, action: string, resourceType: string, resourceId: string, details?: Record<string, any>, req?: Request): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ...(req && {
        details: {
          ...details,
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || 'Unknown',
        },
      }),
    });

    return this.auditLogRepository.save(log);
  }
} 