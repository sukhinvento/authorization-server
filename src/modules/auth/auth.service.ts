import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { OAuthToken, OAuthCode } from '../../entities/oauth.entity';
import { LoginDto, RegisterDto, AuthorizeDto, TokenDto, ClientCredentialsDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { UserService } from '../user/user.service';
import { ClientService } from './client.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OAuthToken)
    private readonly tokenRepository: Repository<OAuthToken>,
    @InjectRepository(OAuthCode)
    private readonly codeRepository: Repository<OAuthCode>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      Number(this.configService.get('BCRYPT_SALT_ROUNDS')),
    );

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto, clientId: string, clientSecret: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Validate client credentials
    const client = await this.clientService.validateClient(clientId, clientSecret);
    
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      clientId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store the refresh token
    const tokenEntity = this.tokenRepository.create({
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isRevoked: false,
    });

    await this.tokenRepository.save(tokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  async authorize(authorizeDto: AuthorizeDto): Promise<string> {
    // Validate client and code challenge
    const isValidChallenge = await this.clientService.validateCodeChallenge(
      authorizeDto.clientId,
      authorizeDto.codeChallenge,
    );

    if (!isValidChallenge) {
      throw new UnauthorizedException('Invalid code challenge');
    }

    const code = uuidv4();
    const oauthCode = this.codeRepository.create({
      code,
      userId: authorizeDto.clientId,
      codeChallenge: authorizeDto.codeChallenge,
      codeChallengeMethod: authorizeDto.codeChallengeMethod,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await this.codeRepository.save(oauthCode);
    return code;
  }

  async token(tokenDto: TokenDto, clientId: string, clientSecret: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Validate client credentials
    const client = await this.clientService.validateClient(clientId, clientSecret);

    const oauthCode = await this.codeRepository.findOne({
      where: { code: tokenDto.code, isUsed: false },
    });

    if (!oauthCode || oauthCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    if (!this.verifyCodeChallenge(tokenDto.codeVerifier, oauthCode.codeChallenge, oauthCode.codeChallengeMethod)) {
      throw new UnauthorizedException('Invalid code verifier');
    }

    const user = await this.userService.findById(oauthCode.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    oauthCode.isUsed = true;
    await this.codeRepository.save(oauthCode);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      clientId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store the tokens
    const tokenEntity = this.tokenRepository.create({
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isRevoked: false,
    });

    await this.tokenRepository.save(tokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string, clientId: string, clientSecret: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Validate client credentials
      const client = await this.clientService.validateClient(clientId, clientSecret);
      
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      const token = await this.tokenRepository.findOne({
        where: { refreshToken, isRevoked: false },
      });

      if (!token || token.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Revoke the old token
      token.isRevoked = true;
      await this.tokenRepository.save(token);

      // Generate new tokens
      const newPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        clientId,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Store the new refresh token
      const newTokenEntity = this.tokenRepository.create({
        userId: user.id,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isRevoked: false,
      });

      await this.tokenRepository.save(newTokenEntity);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async clientCredentials(clientCredentialsDto: ClientCredentialsDto): Promise<{ accessToken: string }> {
    // Validate client credentials
    const client = await this.clientService.validateClient(
      clientCredentialsDto.clientId,
      clientCredentialsDto.clientSecret,
    );

    if (!client.isServiceAccount) {
      throw new UnauthorizedException('Client is not authorized for service-to-service communication');
    }

    // Generate a short-lived access token for service-to-service communication
    const payload = {
      sub: client.clientId,
      clientId: client.clientId,
      scopes: clientCredentialsDto.scopes || client.scopes,
      isServiceAccount: true,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return { accessToken };
  }

  private verifyCodeChallenge(verifier: string, challenge: string, method: string): boolean {
    if (method === 'S256') {
      const hash = crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      return hash === challenge;
    }
    return verifier === challenge; // plain method
  }
} 