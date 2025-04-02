import { TestHelper } from './test-helper';
import * as fs from 'fs';
import * as path from 'path';

describe('Application End-to-End Tests', () => {
  let testHelper: TestHelper;
  let adminToken: string;
  let userToken: string;
  let testFileId: string;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();
  });

  afterAll(async () => {
    await testHelper.close();
  });

  describe('Authentication', () => {
    it('should create an admin user', async () => {
      const response = await testHelper.createUser({
        email: 'admin@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin'],
      });

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('admin@example.com');
      expect(response.body.roles).toContain('admin');
    });

    it('should create a regular user', async () => {
      const response = await testHelper.createUser({
        email: 'user@example.com',
        password: 'User123!',
        firstName: 'Regular',
        lastName: 'User',
        roles: ['user'],
      });

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('user@example.com');
      expect(response.body.roles).toContain('user');
    });

    it('should login as admin', async () => {
      const response = await testHelper.loginUser('admin@example.com', 'Admin123!');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      adminToken = response.body.accessToken;
    });

    it('should login as regular user', async () => {
      const response = await testHelper.loginUser('user@example.com', 'User123!');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      userToken = response.body.accessToken;
    });
  });

  describe('File Management', () => {
    it('should upload a file as admin', async () => {
      const testFilePath = path.join(__dirname, 'test-files', 'test.txt');
      const fileContent = 'This is a test file content';
      fs.writeFileSync(testFilePath, fileContent);

      const response = await testHelper.uploadFile(
        adminToken,
        fs.readFileSync(testFilePath),
        'test.txt',
      );

      expect(response.body).toHaveProperty('_id');
      expect(response.body.originalName).toBe('test.txt');
      testFileId = response.body._id;

      // Clean up test file
      fs.unlinkSync(testFilePath);
    });

    it('should get file details', async () => {
      const response = await testHelper.getFile(adminToken, testFileId);
      expect(response.body).toHaveProperty('_id', testFileId);
      expect(response.body.originalName).toBe('test.txt');
    });

    it('should download file', async () => {
      const response = await testHelper.downloadFile(adminToken, testFileId);
      expect(response.body).toBeDefined();
    });

    it('should delete file', async () => {
      await testHelper.deleteFile(adminToken, testFileId);
      const response = await testHelper.getFile(adminToken, testFileId);
      expect(response.status).toBe(404);
    });
  });

  describe('Audit Trail', () => {
    it('should get audit logs as admin', async () => {
      const response = await testHelper.getAuditLogs(adminToken);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('action');
      expect(response.body[0]).toHaveProperty('userId');
      expect(response.body[0]).toHaveProperty('timestamp');
    });

    it('should not allow regular user to access audit logs', async () => {
      const response = await testHelper.getAuditLogs(userToken);
      expect(response.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid file upload', async () => {
      const response = await testHelper.uploadFile(
        adminToken,
        Buffer.from(''),
        'invalid.txt',
      );
      expect(response.status).toBe(400);
    });

    it('should handle invalid file ID', async () => {
      const response = await testHelper.getFile(adminToken, 'invalid-id');
      expect(response.status).toBe(404);
    });

    it('should handle invalid token', async () => {
      const response = await testHelper.getFile('invalid-token', testFileId);
      expect(response.status).toBe(401);
    });
  });
}); 