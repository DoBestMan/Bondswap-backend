import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTPool, NftJoinLog } from './nftpool.entity';
import { State } from '../pool/pool.entity'; 
import { NFTPoolService } from './nftpool.service';
import { NFTPoolController } from './nftpool.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        NFTPool,
        NftJoinLog,
        State,
    ]),
  ],
  providers: [
    NFTPoolService
  ],
  controllers: [
    NFTPoolController
  ],
})
export class NFTPoolModule {}
