import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
// erc20
import { Erc20Token } from './erc20/erc20.entity';
import { Erc20Module } from './erc20/erc20.module';
// pool
import { Pool, JoinLog, State } from './pool/pool.entity';
import { NftJoinLog, NFTPool } from './nft/nftpool.entity';
import { PoolModule } from './pool/pool.module';
import { NFTPoolModule } from './nft/nftpool.module';
// config
import config from './app.config';
// meta
import { OfficialAddress } from './meta/entity';
import { MetaModule } from './meta/module';
import { IS_DEV } from './app.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: config.DB.HOST,
      port: config.DB.PORT,
      username: config.DB.USERNAME,
      password: config.DB.PASSPORT,
      database: IS_DEV?'rinkeby':'ethereum',
      entities: [
        Erc20Token,
        Pool,
        JoinLog,
        State,
        OfficialAddress,
        NFTPool,
        NftJoinLog
      ],
      synchronize: true,
      retryDelay: 1000,
    }),
    Erc20Module,
    PoolModule,
    MetaModule,
    NFTPoolModule,
  ],
})
export class AppModule {}
