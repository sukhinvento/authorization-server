import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1710661884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create collections if they don't exist
    await queryRunner.query(`
      // Create users collection
      db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'password', 'roles'],
            properties: {
              email: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              password: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              roles: {
                bsonType: 'array',
                description: 'must be an array and is required'
              }
            }
          }
        }
      });

      // Create oauth_tokens collection
      db.createCollection('oauth_tokens', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['accessToken', 'refreshToken', 'expiresAt', 'userId'],
            properties: {
              accessToken: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              refreshToken: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              expiresAt: {
                bsonType: 'date',
                description: 'must be a date and is required'
              },
              userId: {
                bsonType: 'objectId',
                description: 'must be an objectId and is required'
              }
            }
          }
        }
      });

      // Create oauth_codes collection
      db.createCollection('oauth_codes', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['code', 'userId', 'codeChallenge', 'expiresAt'],
            properties: {
              code: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              userId: {
                bsonType: 'objectId',
                description: 'must be an objectId and is required'
              },
              codeChallenge: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              expiresAt: {
                bsonType: 'date',
                description: 'must be a date and is required'
              }
            }
          }
        }
      });

      // Create audit_logs collection
      db.createCollection('audit_logs', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'action', 'resourceType', 'resourceId'],
            properties: {
              userId: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              action: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              resourceType: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              resourceId: {
                bsonType: 'string',
                description: 'must be a string and is required'
              }
            }
          }
        }
      });

      // Create clients collection
      db.createCollection('clients', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['clientId', 'clientSecret', 'scopes'],
            properties: {
              clientId: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              clientSecret: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              scopes: {
                bsonType: 'array',
                description: 'must be an array and is required'
              }
            }
          }
        }
      });
    `);

    // Create indexes
    await queryRunner.query(`
      // Users collection indexes
      db.users.createIndex({ email: 1 }, { unique: true });
      db.users.createIndex({ roles: 1 });

      // OAuth tokens collection indexes
      db.oauth_tokens.createIndex({ accessToken: 1 }, { unique: true });
      db.oauth_tokens.createIndex({ refreshToken: 1 }, { unique: true });
      db.oauth_tokens.createIndex({ userId: 1 });
      db.oauth_tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

      // OAuth codes collection indexes
      db.oauth_codes.createIndex({ code: 1 }, { unique: true });
      db.oauth_codes.createIndex({ userId: 1 });
      db.oauth_codes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

      // Audit logs collection indexes
      db.audit_logs.createIndex({ userId: 1 });
      db.audit_logs.createIndex({ resourceId: 1 });
      db.audit_logs.createIndex({ createdAt: -1 });

      // Clients collection indexes
      db.clients.createIndex({ clientId: 1 }, { unique: true });
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop collections
    await queryRunner.query(`
      db.users.drop();
      db.oauth_tokens.drop();
      db.oauth_codes.drop();
      db.audit_logs.drop();
      db.clients.drop();
    `);
  }
} 