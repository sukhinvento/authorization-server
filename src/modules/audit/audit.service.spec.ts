import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../../entities/audit-log.entity';
import { Repository } from 'typeorm';

describe('AuditService', () => {
  let service: AuditService;
  let repository: Repository<AuditLog>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create an audit log', async () => {
      const logData = {
        userId: 'user123',
        action: 'CREATE',
        resourceType: 'FILE',
        resourceId: 'file123',
        details: { key: 'value' },
      };

      const savedLog = { ...logData, id: 'log123' };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.createLog(logData);
      expect(result).toEqual(savedLog);
      expect(mockRepository.create).toHaveBeenCalledWith(logData);
      expect(mockRepository.save).toHaveBeenCalledWith(logData);
    });
  });

  describe('getLogs', () => {
    it('should return all logs', async () => {
      const mockLogs = [
        { id: 'log1', userId: 'user1' },
        { id: 'log2', userId: 'user2' },
      ];
      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await service.getLogs();
      expect(result).toEqual(mockLogs);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('getLogsByUserId', () => {
    it('should return logs for a specific user', async () => {
      const userId = 'user123';
      const mockLogs = [
        { id: 'log1', userId },
        { id: 'log2', userId },
      ];
      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await service.getLogsByUserId(userId);
      expect(result).toEqual(mockLogs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });
}); 