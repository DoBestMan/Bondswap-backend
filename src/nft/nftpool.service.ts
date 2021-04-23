import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NFTPool,NftJoinLog } from './nftpool.entity';
import { State } from '../pool/pool.entity';
import NFTContract from './nftpool.contract';
import config from '../app.config';
import { getBlockNumber } from '../api';
const moment = require('moment');

@Injectable()
export class NFTPoolService {
    private readonly logger = new Logger(NFTPoolService.name);

    private readonly nftSwapContract = new NFTContract(config.NFT_SWAP_CONTRACT, {
        onCreate: this.onNFTSwapCreate.bind(this),
        onSwap: this.onNFTSwap.bind(this),
        onClose: this.onNFTClose.bind(this)
    }, config.INFURA_NETWORK, config.INFURA_APP_ID);

    constructor(
      @InjectRepository(NFTPool)
      private pools: Repository<NFTPool>,
      @InjectRepository(NftJoinLog)
      private joins: Repository<NftJoinLog>,
      @InjectRepository(State)
      private state: Repository<State>,
    ) {
      this.logger.log(`NFTPoolService init`);
    }

    private async onNFTSwapCreate(event) {
        this.logger.log(`onNFTSwapCreate: ${JSON.stringify(event)}`);
        const pool = await this.pools.findOne({
            poolId: event.poolId
        });
        if (!pool) {
            try {
                await this.pools.save(event);
            } catch (e) {
                this.logger.error(`failed to save NFTSwap ${e}`);
            }
        }
    }

    private async onNFTSwap(event) {
        this.logger.log(`onNFTSwapped: ${JSON.stringify(event)}`);
        try {
            const pool = await this.pools.findOne({
                poolId: event.poolId
            });
            const join = await this.joins.findOne({
                txHash: event.txHash
            })
            if (pool && !join) {
                await this.joins.save(event);
                let query = this.pools.createQueryBuilder('pool');
                const newCount = pool.batchCount - parseInt(event.count);
                await query.andWhere('poolId = :id', {id: event.poolId}).update({batchCount: newCount}).execute();
            }
        } catch (e) {
            this.logger.error(`failed to update NFTSwap ${e}`);
        }
    }

    private async onNFTClose(event) {
        this.logger.log(`onNFTClosed: ${JSON.stringify(event)}`);
        try {
            const pool = await this.pools.findOne({
                poolId: event.poolId
            });
            if (pool) {
                let query = this.pools.createQueryBuilder('pool');
                await query.andWhere('poolId = :id', {id: event.poolId}).update({status: 'Closed'}).execute();
            }
        } catch (e) {
            this.logger.error(`failed to close NFTSwap ${e}`);
        }
    }

    async findNFTPoolByTxHash(txHash: string) {
        const pool = await this.pools.findOne({
            txHash,
        });

        if (!pool) {
            return null;
        }

        return pool;
    }

    async findNFTPoolById(id: string) {
        const pool = await this.pools.findOne({
            poolId: parseInt(id),
        });

        if (!pool) {
            return null;
        }

        return pool;
    }

    async findPools(offset = 0, limit = 4, type = 0, addr = '', searchtype = '', searchtext = '', showall = 1) {
        let query = this.pools.createQueryBuilder('nft_pool').addOrderBy("poolId", "DESC");

        if (type === 0) {
            query = query.andWhere('nft_pool.isPrivate = false');
        } else if (type === 1) {
            query = query.andWhere('nft_pool.isPrivate = true');
        } else {
            query = query.andWhere('nft_pool.lister = :addr', { addr });
        }

        if (searchtext) {
            if (searchtype === 'id') {
                query = query.andWhere('nft_pool.poolId = :id', {id: searchtext});
            } else if (searchtype === "name") {
                const search = searchtext.toLowerCase();
                query = query.andWhere("nft_pool.name LIKE :search", {search: `%${search}%`});
            } else if (searchtype === "contract") {
                query = query.andWhere('nft_pool.tokenAddress = :addr', {addr: searchtext.toLowerCase()});
            }
        }

        if (!showall) {
            query = query.andWhere('nft_pool.status = :text', {text: 'Live'});
            query = query.andWhere("nft_pool.batchCount > 0");
            const utcMoment = moment.utc();
            const curTime = utcMoment.valueOf() / 1000;
            query = query.andWhere(new Brackets(qb => {
                qb.where("nft_pool.endTime = 0")
                .orWhere("nft_pool.endTime > :curTime", { curTime })
            }));
        }

        const total = await query.getCount();
        const data = await query.skip(offset).take(limit).getMany();
    
        return {
          total,
          data: data,
        };
    }

    private height = 0;

    @Cron(CronExpression.EVERY_10_SECONDS)
    public async crawlerHeight(): Promise<void> {
      const st = (await this.state.findOne({ key: 'eth_height_1' })) || { key: 'eth_height_1', value: '0' };
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
    public async crawlerNFTPool(): Promise<void> {
        const st = (await this.state.findOne({ key: 'eth_nft_pool_height' })) || { key: 'eth_nft_pool_height', value: '0' };
        const _height = parseInt(st.value, 10) || 0;
        const height = this.height;
        if (height > _height) {
            await this.nftSwapContract.getLogs(Math.max(_height - 1, 0), height);
            st.value = `${height}`;
            await this.state.save(st);
        }
    }
}