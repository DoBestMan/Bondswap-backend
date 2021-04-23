import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, LessThanOrEqual, FindConditions } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import Cache from 'lru-cache';
import { Pool, JoinLog, FixedPool, FloatPool, State, PoolDTO } from './pool.entity';
import { Erc20Service } from '../erc20/erc20.service';
import FixedContract, { CloseEvent, CreateEvent as FixedPoolCreate, JoinEvent as FixedPoolJoin } from './fixed-pool.contract';
import FloatContract, { CreateEvent as FloatPoolCreate, JoinEvent as FloatPoolJoin, FloatPoolNative } from './float-pool.contract';
import MarketPriceContract from './market-price.contract';
import config from '../app.config';
import { getBlockNumber, getBlockByHash, Block } from '../api';
import { PublicPoolType, PoolStatus, PoolType } from '../typings/type';
import { nows } from 'src/utils';
import { ethers } from 'ethers';

import {
  ChainId,
  Token,
  Fetcher,
  Route,
  WETH
} from '@uniswap/sdk';

export interface PoolDTOs {
  total: number;
  data: PoolDTO[];
}

export interface Joins {
  total: number;
  data: JoinLog[];
}

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);

  // private readonly fixedPoolContract = new FixedContract(config.FIXED_POOL_CONTRACT, {
  //   onCreate: this.onFixedPoolCreate.bind(this),
  //   onJoin: this.onFixedPoolJoin.bind(this),
  //   onClose: this.onFixedPoolClose.bind(this),
  // }, config.INFURA_NETWORK, config.INFURA_APP_ID);

  // private readonly floatPoolContract = new FloatContract(config.FLOAT_POOL_CONTRACT, {
  //   onCreate: this.onFloatPoolCreate.bind(this),
  //   onJoin: this.onFloatPoolJoin.bind(this),
  // }, config.INFURA_NETWORK, config.INFURA_APP_ID);

  private readonly fixedPoolContractV2 = new FixedContract(config.FIXED_POOL_CONTRACT_V2, {
    onCreate: this.onFixedPoolCreate.bind(this),
    onJoin: this.onFixedPoolJoin.bind(this),
    onClose: this.onFixedPoolClose.bind(this),
  }, config.INFURA_NETWORK, config.INFURA_APP_ID);

  private readonly floatPoolContractV2 = new FloatContract(config.FLOAT_POOL_CONTRACT_V2, {
    onCreate: this.onFloatPoolCreate.bind(this),
    onJoin: this.onFloatPoolJoin.bind(this),
  }, config.INFURA_NETWORK, config.INFURA_APP_ID);

  private readonly marketPriceContract = new MarketPriceContract(config.MARKET_PRICE_CONTRACT, config.INFURA_NETWORK, config.INFURA_APP_ID);

  private blockCache: Cache<string, Block>;

  constructor(
    @InjectRepository(Pool)
    private pools: Repository<Pool>,
    @InjectRepository(JoinLog)
    private joins: Repository<JoinLog>,
    @InjectRepository(State)
    private state: Repository<State>,
    private erc20Service: Erc20Service,
  ) {
    this.logger.log(`poolService init`);
    this.blockCache = new Cache<string, Block>({
      max: 1000,
      maxAge: 1000 * 60 * 30,
    });
  }

  private async getBlock(hash: string): Promise<Block> {
    const block = this.blockCache.get(hash);
    if (block) {
      return block;
    }
    const block2 = await getBlockByHash(hash);
    this.blockCache.set(hash, block2);
    return block2;
  }

  private async getBlockTime(hash: string): Promise<number> {
    const block = await this.getBlock(hash);
    return block ? block.timestamp : -1;
  }

  private async onFixedPoolCreate(event: FixedPoolCreate) {
    //this.logger.log(`onFixedPoolCreate: ${JSON.stringify(event)}`);
    this.logger.log("Create Fixed Pool " + event.poolId);
    const pool = await this.pools.findOne({
      poolId: event.poolId,
      txHash: event.txHash,
    });

    if (!pool) {
      try {
        const time = await this.getBlockTime(event.blockHash);
        const pool: Omit<FixedPool, 'id'> = {
          ...event,
          closed: false,
          isFloat: false,
          createAt: time,
          status: 'Live',
          contract: event.contract,
        };
        await this.pools.save(pool);
      } catch (e) {
        this.logger.error(`failed to save fixedPool ${e}`);
      }
    }
  }

  private async onFixedPoolJoin(event: FixedPoolJoin) {
    this.logger.log(`onFixedPoolJoin: ${JSON.stringify(event)}`);
    try {
      const join = await this.joins.findOne({
        poolId: event.poolId,
        priv: event.priv,
        taker: event.taker,
        txHash: event.txHash,
        isFloat: false,
        contract: event.contract,
      });
      if (!join) {
        await this.joins.save({
          ...event,
          isFloat: false,
          contract: event.contract,
        });
      }
    } catch (e) {
      // dup
    }

    const pool = await this.pools.findOne({
      poolId: event.poolId,
      priv: event.priv,
      isFloat: false,
      contract: event.contract,
    });

    if (pool) {
      console.log('join', pool.leftAmount, event.leftAmount, BigInt(pool.leftAmount) > BigInt(event.leftAmount));
      if (BigInt(pool.leftAmount) > BigInt(event.leftAmount)) {
        pool.leftAmount = event.leftAmount;
        if (parseFloat(pool.leftAmount) === 0 && pool.status === 'Live') {
          pool.status = 'Filled';
        }
        await this.pools.save(pool);
      }
    }
  }

  private async onFixedPoolClose(event: CloseEvent) {
    this.logger.log(`onClose: ${JSON.stringify(event)}`);
    const pool = await this.pools.findOne({
      poolId: event.poolId,
      priv: event.priv,
      isFloat: false,
      contract: event.contract,
    });
    if (pool) {
      pool.closed = true;
      pool.status = 'Closed';
      await this.pools.save(pool);
    } else {
      this.logger.error(`close pool not exist: id ${event.poolId}, priv ${event.priv}`);
    }
  }

  private async onFloatPoolCreate(event: FloatPoolCreate) {
    this.logger.log(`onCreate: ${JSON.stringify(event)}`);
    const pool = await this.pools.findOne({
      txHash: event.txHash
    });

    if (!pool) {
      try {
        const block = await this.getBlock(event.blockHash);
        const time = block ? block.timestamp : 0;
        const pool: Omit<FloatPool, 'id'> = {
          ...event,
          isFloat: true,
          createAt: time,
          status: 'Live',
          contract: event.contract,
        };
        await this.pools.save(pool);
      } catch (e) {
        this.logger.error(`failed to save floatPool ${e}`);
      }
    }
  }

  private async onFloatPoolJoin(event: FloatPoolJoin) {
    this.logger.log(`onJoin: ${JSON.stringify(event)}`);
    const join = await this.joins.findOne({
      poolId: event.poolId,
      taker: event.taker,
      txHash: event.txHash,
      isFloat: true,
      contract: event.contract,
    });

    if (!join) {
      await this.joins.save({
        ...event,
        isFloat: true,
        contract: event.contract,
      });
    }

    const pool = await this.pools.findOne({
      poolId: event.poolId,
      isFloat: true,
      contract: event.contract,
    });

    if (pool) {
      const poolNative = await this.floatPoolContractV2.pool(event.poolId);
      pool.makerAmount = poolNative.makerReceiveTotal.toString();
      pool.takerAmount = poolNative.takerAmountTotal.toString();

      try {
        await this.pools.save(pool);
      } catch (e) {
        // this.logger.error(`failed to save pool ${JSON.stringify(pool)}`);
      }
    }
  }

  getTokenPrice = async(coin: any) => {
    let price = '0';
    try {
      let provider = new ethers.providers.InfuraProvider(config.INFURA_NETWORK, config.INFURA_APP_ID);
      const token = new Token(ChainId.MAINNET, coin.tracker, coin.decimals); // ChainId.MAINNET
      const pair = await Fetcher.fetchPairData(token, WETH[ChainId.MAINNET], provider);
      const route = new Route([pair], token);
      console.log(route.midPrice)
      console.log(config.INFURA_NETWORK);
      price = route.midPrice.toSignificant(coin.decimals);
    } catch(e) {

    }
    return price;
  };

  private deleteUselessFields: (pool: Pool) => Promise<PoolDTO> = async(pool: Pool) => {
    if (!pool) return null;

    if (pool.isFloat) {
      delete pool.leftAmount;
      delete pool.rate;
      delete pool.units;
      delete pool.extra;
    } else {
      delete pool.takerAmount;
      delete pool.makerAmount;
    }

    const coin = await this.erc20Service.getERC20Token(pool.tracker);
    let pairSymbols = pool.name.split(' ').join("").split('<>');

    let marketPrice = "...";
    
    for (let i = 0; i < config.PRICE_FEEDS.length; i ++) {
      let priceObj = Object.entries(config.PRICE_FEEDS[i]).find(([key, value]) => {
        let symbols = key.split('/');
        return symbols[0].includes(pairSymbols[0]) && symbols[1].includes('USD')
      })
      if (!!priceObj) {
        marketPrice = await this.marketPriceContract.getLatestMarketPrice(priceObj[1]);
        break; 
      }
    }

    return {
      ...pool,
      trackerSymbol: coin?.symbol || '',
      trackerDecimals: coin?.decimals || -1,
      marketPrice: marketPrice
    };
  }

  async findPublicPools(type: PublicPoolType, status: PoolStatus, offset = 0, limit = 20): Promise<PoolDTOs> {
    type = type || 'public';
    status = status || 'All';
    const where: FindConditions<Pool> = {
      priv: false,
    };
    if (type === 'fixed') {
      where.isFloat = false;
    } else if (type === 'float') {
      where.isFloat = true;
    }
    if (status !== 'All') {
      where.status = status;
    }

    const [data, total] = await this.pools.findAndCount({
      where,
      order: {
        poolId: 'DESC',
        createAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return {
      total,
      data: await Promise.all(data.map(this.deleteUselessFields)),
    };
  }

  async findPrivatePools(status: PoolStatus, offset = 0, limit = 20): Promise<PoolDTOs> {
    status = status || 'All';
    const where: FindConditions<Pool> = {
      priv: true,
    };
    if (status !== 'All') {
      where.status = status;
    }
    const [data, total] = await this.pools.findAndCount({
      where,
      order: {
        poolId: 'DESC',
        createAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return {
      total,
      data: await Promise.all(data.map(this.deleteUselessFields)),
    };
  }

  async findPools(offset = 0, limit = 20): Promise<PoolDTOs> {
    const total = await this.pools.count();
    const data = await this.pools.find({
      skip: offset,
      take: limit,
      order: {
        poolId: 'DESC',
        createAt: 'DESC',
      },
    });

    return {
      total,
      data: await Promise.all(data.map(this.deleteUselessFields)),
    };
  }

  async findPoolsByTracker(tracker: string): Promise<PoolDTOs> {
    const [data, total] = await this.pools.findAndCount({
      where: {
        tracker,
      },
      order: {
        poolId: 'DESC',
        createAt: 'DESC',
      },
    });

    return {
      total,
      data: await Promise.all(data.map(this.deleteUselessFields)),
    };
  }

  async findJoinsByTaker(taker: string, offset: number, limit: number): Promise<Joins> {
    const [data, total] = await this.joins.findAndCount({
      where: {
        taker,
      },
      order: {
        poolId: 'DESC',
        createAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return {
      total,
      data,
    };
  }

  async findJoinedPoolsByTaker(address: string, type: PoolType, status: PoolStatus, offset: number, limit: number): Promise<PoolDTOs> {
    status = status || 'All';

    let query = this.pools.createQueryBuilder('pool')
    .innerJoin(JoinLog, 'join_log', 'pool.poolId=join_log.poolId and pool.priv=join_log.priv and pool.isFloat=join_log.isFloat')
    .where('join_log.taker = :address', { address });

    if (type === 'public') {
      query = query.andWhere('pool.priv = false');
    } else if (type === 'private') {
      query = query.andWhere('pool.priv = true');
    } else if (type === 'fixed') {
      query = query.andWhere('pool.isFloat = false');
    } else if (type === 'float') {
      query = query.andWhere('pool.isFloat = true');
    }

    if (status !== 'All') {
      query = query.andWhere(`pool.status = ${status}`);
    }

    const total = await query.getCount();

    if (total > 0) {
      const data = await query.skip(offset).take(limit).getMany();

      return {
        total,
        data: await Promise.all(data.map(this.deleteUselessFields)),
      };
    }
    return {
      total: 0,
      data: [],
    };
  }

  async findPoolsByTrackerSymbol(trackerSymbol: string): Promise<PoolDTOs> {
    const trackers = await this.erc20Service.getTrakersBySymbol(trackerSymbol);
    if (trackers.length === 0) {
      return {
        total: 0,
        data: [],
      };
    }

    const [data, total] = await this.pools.findAndCount({
      where: {
        tracker: In(trackers),
      },
      order: {
        poolId: 'DESC',
        createAt: 'DESC',
      },
    });

    return {
      total,
      data: await Promise.all(data.map(this.deleteUselessFields)),
    };
  }

  async findPool(poolId: string): Promise<PoolDTO | null> {
    poolId = poolId.toLowerCase();

    let pool: Pool | null = null;
    if (poolId.startsWith('f')) {
      const id = parseInt(poolId.slice(1), 10);
      if (isNaN(id)) {
        return null;
      }

      pool = await this.pools.findOne({
        poolId: id,
        isFloat: true,
      });
    } else if (poolId.startsWith('p')) {
      const id = parseInt(poolId.slice(1), 10);
      if (isNaN(id)) {
        return null;
      }

      pool = await this.pools.findOne({
        poolId: id,
        priv: true,
      });
    } else {
      const id = parseInt(poolId, 10);
      if (isNaN(id)) {
        return null;
      }

      pool = await this.pools.findOne({
        poolId: id,
        isFloat: false,
        priv: false,
      });
    }

    if (pool) {
      return this.deleteUselessFields(pool);
    }

    return null;
  }

  async findPoolByTxHash(txHash: string): Promise<PoolDTO | null> {
    const pool = await this.pools.findOne({
      txHash,
    });

    if (!pool) {
      return null;
    }

    return this.deleteUselessFields(pool);
  }

  async findJoinByTxHash(txHash: string): Promise<JoinLog | null> {
    const join = await this.joins.findOne({
      txHash,
    });

    return join;
  }

  async findPoolsByMaker(maker: string, offset = 0, limit = 20): Promise<PoolDTOs> {
    const data = await this.pools.find({
      where: {
        maker: maker,
      },
      skip: offset,
      take: limit,
      order: {
        poolId: 'DESC',
        createAt: 'DESC',
      },
    });
    const total = await this.pools.count({
      maker: maker,
    });

    return {
      total,
      data: await Promise.all(data.map(this.deleteUselessFields)),
    };
  }

  private height = 0;

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async crawlerHeight(): Promise<void> {
    const st = (await this.state.findOne({ key: 'eth_height' })) || { key: 'eth_height', value: '0' };
    const _height = parseInt(st.value, 10) || 0;
    this.height = _height;

    const number: any = await getBlockNumber().catch((e) => {
      console.error(e);
      return 0;
    });
    if (number > _height) {
      this.height = number;
      st.value = `${number}`;
      await this.state.save(st);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async crawlerFixedPool(): Promise<void> {
    const st = (await this.state.findOne({ key: 'eth_fixed_pool_height' })) || { key: 'eth_fixed_pool_height', value: '0' };
    const _height = parseInt(st.value, 10) || 0;
    const height = this.height;
    if (height > _height) {
      await this.fixedPoolContractV2.getLogs(Math.max(_height - 1, 0), height);
      // await this.fixedPoolContractV2.getLogs(Math.max(_height - 1, 0), height);
      st.value = `${height}`;
      await this.state.save(st);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async crawlerFloatPool(): Promise<void> {
    const st = (await this.state.findOne({ key: 'eth_float_pool_height' })) || { key: 'eth_float_pool_height', value: '0' };
    const _height = parseInt(st.value, 10) || 0;
    const height = this.height;
    if (height > _height) {
      await this.floatPoolContractV2.getLogs(Math.max(_height - 1, 0), height);
      // await this.floatPoolContract.getLogs(Math.max(_height - 1, 0), height);
      st.value = `${height}`;
      await this.state.save(st);
    }
  }

  private updateBatch = 50;

  @Cron(CronExpression.EVERY_MINUTE)
  public async updateExpiredPoolStatus(): Promise<void> {
    const now = nows();
    let skip = 0;
    while (true) {
      const pools = await this.pools.find({
        where: {
          closed: false,
          endTime: LessThanOrEqual(now),  // 目前跳过了提前主动关闭的 pool，由 close 事件处理
        },
        order: {
          poolId: 'ASC',
        },
        skip,
        take: this.updateBatch,
      });
      if (pools && pools.length > 0) {
        const pros = pools.map(async pool => {
          let shouldUpdate = false;
          if (pool.status !== 'Closed') {
            pool.status = 'Closed';
            shouldUpdate = true;
          }

          let poolNative: any = null;
          if (pool.contract === config.FIXED_POOL_CONTRACT_V2 || pool.contract === config.FLOAT_POOL_CONTRACT_V2) {
            poolNative = pool.isFloat ?
            await this.floatPoolContractV2.pool(pool.poolId) :
            pool.priv ?
              await this.fixedPoolContractV2.privPool(pool.poolId) :
              await this.fixedPoolContractV2.fixedPool(pool.poolId);
          }
          //  else {
          //   poolNative = pool.isFloat ?
          //   await this.floatPoolContract.pool(pool.poolId) :
          //   pool.priv ?
          //     await this.fixedPoolContract.privPool(pool.poolId) :
          //     await this.fixedPoolContract.fixedPool(pool.poolId);
          // }

          if (!poolNative.enabled) {
            pool.closed = true;
            shouldUpdate = true;
            this.logger.warn(`close pool ${pool.isFloat ? 'float' : pool.priv ? 'priv' : ''}: ${pool.poolId}`);
          }

          if (pool.isFloat) {
            pool.makerAmount = (poolNative as FloatPoolNative).makerReceiveTotal.toString();
            pool.takerAmount = (poolNative as FloatPoolNative).takerAmountTotal.toString();
          }

          if (pool.createAt < 1 && pool.blockHash) {
            shouldUpdate = true;
            pool.createAt = await this.getBlockTime(pool.blockHash);
          }

          if (shouldUpdate) {
            await this.pools.save(pool);
          }
        });
        await Promise.all(pros);
        skip += pools.length;
        if (pools.length < this.updateBatch) {
          break;
        }
      } else {
        break;
      }
    }
  }
}
