import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { OAuthToken, OAuthCode } from '../entities/oauth.entity';
import { Audit } from '../entities/audit.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/project-bsr?authSource=admin',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, OAuthToken, OAuthCode, Audit],
  migrations: [__dirname + '/../migrations/*{.ts,.js}']
}; 