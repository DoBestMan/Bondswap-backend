import { Controller, Get, Post, Logger, Body, Headers, Delete, Query } from '@nestjs/common';
import Axios from 'axios';
import { MetaService } from './service';

@Controller('/api/v1/meta')
export class MetaController {
  private readonly logger = new Logger(MetaController.name);

  constructor(private readonly service: MetaService) {}

  private checkAPIKEY(key: string): boolean {
    return key === 'bswap';
  }

  @Get('/official-address')
  async getOfficialAddress(): Promise<string[]> {
    return this.service.getAddress();
  }

  @Get('/image')
  async GetImage(@Query('url') _url: string): Promise<any> {
    if (!_url) return {};
    const res = await Axios.get(_url);
    return res ? res.data : {};
  }

  @Get('/getTime')
  async getTime(): Promise<number> {
    return Date.now();
  }

  @Post('/official-address')
  async addOficialAddress(@Body() data: string[], @Headers('X-API-KEY') key: string): Promise<string> {
    if (this.checkAPIKEY(key)) {
      await this.service.addAddress(data);
      return 'ok';
    }

    return 'bad';
  }

  @Delete('/official-address')
  async delOficialAddress(@Body() data: string[], @Headers('X-API-KEY') key: string): Promise<string> {
    if (this.checkAPIKEY(key)) {
      await this.service.delAddress(data);
      return 'ok';
    }

    return 'bad';
  }
}
