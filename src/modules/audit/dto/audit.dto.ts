import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { AuditActionType, AuditResourceType } from '../../../entities/audit.entity';

export class CreateAuditDto {
  @ApiProperty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsString()
  resourceType: string;

  @ApiProperty()
  @IsString()
  resourceId: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
}

export class AuditFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  resourceType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  resourceId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}

export class AuditResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  resourceType: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty()
  details?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 