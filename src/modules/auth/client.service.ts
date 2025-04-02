import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client & { clientSecret: string }> {
    // Generate a random client ID and secret
    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const client = this.clientRepository.create({
      ...createClientDto,
      clientId,
      clientSecret,
    });

    const savedClient = await this.clientRepository.save(client);
    
    // Return the client with the unhashed secret (only time it will be shown)
    return {
      ...savedClient,
      clientSecret,
    };
  }

  async findOne(clientId: string): Promise<Omit<Client, 'clientSecret'>> {
    const client = await this.clientRepository.findOne({
      where: { clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Remove the client secret from the response
    const { clientSecret, ...result } = client;
    return result;
  }

  async update(clientId: string, updateClientDto: UpdateClientDto): Promise<Omit<Client, 'clientSecret'>> {
    const client = await this.findOne(clientId);
    
    Object.assign(client, updateClientDto);
    const updatedClient = await this.clientRepository.save(client);
    
    // Remove the client secret from the response
    const { clientSecret, ...result } = updatedClient;
    return result;
  }

  async remove(clientId: string): Promise<void> {
    const client = await this.clientRepository.findOne({
      where: { clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.clientRepository.remove(client);
  }

  async validateClient(clientId: string, clientSecret: string): Promise<Client> {
    const where = {
      clientId: `${clientId}`,
    };
    const client = await this.clientRepository.findOne({
      where,
    });

    if (!client) {
      throw new NotFoundException('Invalid or inactive client');
    }

    const isSecretValid = clientSecret === client.clientSecret;
    if (!isSecretValid) {
      throw new BadRequestException('Invalid client secret');
    }

    return client;
  }

  async validateCodeChallenge(clientId: string, codeChallenge: string): Promise<boolean> {
    const client = await this.findOne(clientId);
    return client.codeChallenge === codeChallenge;
  }
} 