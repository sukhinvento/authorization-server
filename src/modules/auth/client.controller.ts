import { Controller, Post, Body, Get, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dto/client.dto';
import { Roles } from './decorators/roles.decorator';

@ApiTags('Client Management')
@Controller('clients')
@ApiBearerAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client successfully created', type: ClientResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientService.create(createClientDto);
    const { clientSecret, ...result } = client;
    return result;
  }

  @Get(':clientId')
  @Roles('admin')
  @ApiOperation({ summary: 'Get client details' })
  @ApiResponse({ status: 200, description: 'Client details retrieved successfully', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async findOne(@Param('clientId') clientId: string): Promise<ClientResponseDto> {
    return this.clientService.findOne(clientId);
  }

  @Put(':clientId')
  @Roles('admin')
  @ApiOperation({ summary: 'Update client details' })
  @ApiResponse({ status: 200, description: 'Client updated successfully', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async update(
    @Param('clientId') clientId: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientService.update(clientId, updateClientDto);
  }

  @Delete(':clientId')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async remove(@Param('clientId') clientId: string): Promise<void> {
    await this.clientService.remove(clientId);
  }
} 