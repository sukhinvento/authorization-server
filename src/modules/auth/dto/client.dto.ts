import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  codeChallenge: string;

  @ApiProperty({ type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isServiceAccount?: boolean;
}

export class UpdateClientDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  codeChallenge?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ClientResponseDto {
  @ApiProperty()
  clientId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  codeChallenge: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [String] })
  scopes: string[];

  @ApiProperty()
  isServiceAccount: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 