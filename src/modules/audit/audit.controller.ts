import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditDto, AuditFilterDto, AuditResponseDto } from './dto/audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { User } from '../../entities/user.entity';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @ApiOperation({ summary: 'Create an audit log' })
  @ApiResponse({ status: 201, type: AuditResponseDto })
  async createLog(
    @Body('action') action: string,
    @Body('resourceType') resourceType: string,
    @Body('resourceId') resourceId: string,
    @Body('details') details: Record<string, any>,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    return this.auditService.create(user.id, action, resourceType, resourceId, details, req);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all audit logs with filters' })
  @ApiResponse({ status: 200, type: [AuditResponseDto] })
  async getLogs() {
    return this.auditService.getLogs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an audit log by ID' })
  @ApiResponse({ status: 200, type: AuditResponseDto })
  async getLog(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Get('resource/:resourceId')
  @ApiOperation({ summary: 'Get audit logs by resource ID' })
  @ApiResponse({ status: 200, type: [AuditResponseDto] })
  async getLogsByResourceId(@Param('resourceId') resourceId: string) {
    return this.auditService.findByResourceId(resourceId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs by user ID' })
  @ApiResponse({ status: 200, type: [AuditResponseDto] })
  async getLogsByUserId(@Param('userId') userId: string) {
    return this.auditService.getLogsByUserId(userId);
  }

  @Get('my-logs')
  async getMyLogs(@GetUser() user: User) {
    return this.auditService.getLogsByUserId(user.id);
  }
} 