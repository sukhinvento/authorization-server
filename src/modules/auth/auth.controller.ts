import { Controller, Post, Body, Get, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthorizeDto, TokenDto, ClientCredentialsDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('client-id') clientId: string,
    @Headers('client-secret') clientSecret: string,
  ) {
    return this.authService.login(loginDto, clientId, clientSecret);
  }

  @Get('authorize')
  @ApiOperation({ summary: 'OAuth2 authorization endpoint' })
  @ApiResponse({ status: 200, description: 'Authorization code generated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async authorize(@Query() authorizeDto: AuthorizeDto) {
    return this.authService.authorize(authorizeDto);
  }

  @Post('token')
  @ApiOperation({ summary: 'OAuth2 token endpoint' })
  @ApiResponse({ status: 200, description: 'Access token generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async token(
    @Body() tokenDto: TokenDto,
    @Headers('client-id') clientId: string,
    @Headers('client-secret') clientSecret: string,
  ) {
    return this.authService.token(tokenDto, clientId, clientSecret);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(
    @Headers('refresh-token') refreshToken: string,
    @Headers('client-id') clientId: string,
    @Headers('client-secret') clientSecret: string,
  ) {
    return this.authService.refreshToken(refreshToken, clientId, clientSecret);
  }

  @Post('client-credentials')
  @ApiOperation({ summary: 'Get client credentials token' })
  @ApiResponse({ status: 200, description: 'Client credentials token generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clientCredentials(@Body() clientCredentialsDto: ClientCredentialsDto) {
    return this.authService.clientCredentials(clientCredentialsDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout() {
    return { message: 'Logged out successfully' };
  }
} 