import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { ClientService } from '../client.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
  ) {
    const secretKey = configService.get<string>('JWT_SECRET');
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: any) {
    if (payload.isServiceAccount) {
      // For service accounts, validate the client
      try {
        const client = await this.clientService.findOne(payload.clientId);
        if (!client.isActive) {
          throw new UnauthorizedException('Client is inactive');
        }
        return {
          clientId: client.clientId,
          scopes: client.scopes,
          isServiceAccount: true,
        };
      } catch (error) {
        throw new UnauthorizedException('Invalid client');
      }
    }

    // For regular users, validate the user
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      clientId: payload.clientId,
    };
  }
} 