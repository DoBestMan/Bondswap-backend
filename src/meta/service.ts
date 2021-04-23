import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficialAddress } from './entity';

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  constructor(
    @InjectRepository(OfficialAddress)
    private address: Repository<OfficialAddress>,
  ) {
  }

  async addAddress(address: string[]): Promise<void> {
    for (let i = 0; i < address.length; i++) {
      try {
        await this.address.save({
          address: address[i],
        });
      } catch (e) {
        this.logger.error(`failed to add official-address: ${address[i]}`);
      }
    }
  }

  async delAddress(address: string[]): Promise<void> {
    for (let i = 0; i < address.length; i++) {
      try {
        await this.address.delete({
          address: address[i],
        });
      } catch (e) {
        this.logger.error(`failed to delete official-address: ${address[i]}`);
      }
    }
  }

  async getAddress(): Promise<string[]> {
    const items = await this.address.find({});
    if (items && items.length > 0) {
      return items.map(item => item.address);
    }

    return [];
  }
}
