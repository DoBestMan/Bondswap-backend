import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Erc20Token } from './erc20.entity';
import { Erc20Service } from './erc20.service';
import { Erc20Controller } from './erc20.controller';
import { State } from '../pool/pool.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Erc20Token,
      State,
    ]),
  ],
  providers: [
    Erc20Service,
  ],
  controllers: [
    Erc20Controller,
  ],
})
export class Erc20Module {}
