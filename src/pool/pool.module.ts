import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool, JoinLog, State } from './pool.entity';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { Erc20Service } from '../erc20/erc20.service';
import { Erc20Token } from 'src/erc20/erc20.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pool,
      Erc20Token,
      JoinLog,
      State,
    ]),
  ],
  providers: [
    PoolService,
    Erc20Service,
  ],
  controllers: [
    PoolController
  ],
})
export class PoolModule {}
