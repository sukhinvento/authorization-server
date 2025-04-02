import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AuditModule } from './modules/audit/audit.module';
import { User } from './entities/user.entity';
import { AuditLog } from './entities/audit-log.entity';
import { OAuthToken, OAuthCode } from './entities/oauth.entity';
import { Client } from './entities/client.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/project-bsr?authSource=admin',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      entities: [User, AuditLog, OAuthToken, OAuthCode, Client],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      dropSchema: false,
    }),
    AuthModule,
    UserModule,
    AuditModule,
  ],
})
export class AppModule {} 