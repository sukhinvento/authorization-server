import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export class TestHelper {
  private app: INestApplication;
  private moduleFixture: TestingModule;
  private dataSource: DataSource;

  async init() {
    this.moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'DB_TYPE') return 'postgres';
          if (key === 'DB_HOST') return 'localhost';
          if (key === 'DB_PORT') return '5432';
          if (key === 'DB_USERNAME') return 'postgres';
          if (key === 'DB_PASSWORD') return 'postgres';
          if (key === 'DB_DATABASE') return 'test_db';
          if (key === 'JWT_SECRET') return 'test-secret';
          if (key === 'JWT_EXPIRES_IN') return '1h';
          return process.env[key];
        },
      })
      .compile();

    this.app = this.moduleFixture.createNestApplication();
    this.dataSource = this.moduleFixture.get<DataSource>(DataSource);
    await this.app.init();
  }

  async close() {
    await this.dataSource.destroy();
    await this.app.close();
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roles?: string[];
  }) {
    return request(this.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(201);
  }

  async loginUser(email: string, password: string) {
    return request(this.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
  }

  async uploadFile(token: string, file: Buffer, filename: string) {
    return request(this.getHttpServer())
      .post('/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', file, filename)
      .expect(201);
  }

  async getFile(token: string, fileId: string) {
    return request(this.getHttpServer())
      .get(`/files/${fileId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  }

  async downloadFile(token: string, fileId: string) {
    return request(this.getHttpServer())
      .get(`/files/download/${fileId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  }

  async deleteFile(token: string, fileId: string) {
    return request(this.getHttpServer())
      .delete(`/files/${fileId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  }

  async getAuditLogs(token: string) {
    return request(this.getHttpServer())
      .get('/audit')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  }
} 