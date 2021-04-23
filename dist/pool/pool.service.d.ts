import { Repository } from 'typeorm';
import { Pool, JoinLog, State, PoolDTO } from './pool.entity';
import { Erc20Service } from '../erc20/erc20.service';
import { PublicPoolType, PoolStatus, PoolType } from '../typings/type';
export interface PoolDTOs {
    total: number;
    data: PoolDTO[];
}
export interface Joins {
    total: number;
    data: JoinLog[];
}
export declare class PoolService {
    private pools;
    private joins;
    private state;
    private erc20Service;
    private readonly logger;
    private readonly fixedPoolContractV2;
    private readonly floatPoolContractV2;
    private readonly marketPriceContract;
    private blockCache;
    constructor(pools: Repository<Pool>, joins: Repository<JoinLog>, state: Repository<State>, erc20Service: Erc20Service);
    private getBlock;
    private getBlockTime;
    private onFixedPoolCreate;
    private onFixedPoolJoin;
    private onFixedPoolClose;
    private onFloatPoolCreate;
    private onFloatPoolJoin;
    getTokenPrice: (coin: any) => Promise<string>;
    private deleteUselessFields;
    findPublicPools(type: PublicPoolType, status: PoolStatus, offset?: number, limit?: number): Promise<PoolDTOs>;
    findPrivatePools(status: PoolStatus, offset?: number, limit?: number): Promise<PoolDTOs>;
    findPools(offset?: number, limit?: number): Promise<PoolDTOs>;
    findPoolsByTracker(tracker: string): Promise<PoolDTOs>;
    findJoinsByTaker(taker: string, offset: number, limit: number): Promise<Joins>;
    findJoinedPoolsByTaker(address: string, type: PoolType, status: PoolStatus, offset: number, limit: number): Promise<PoolDTOs>;
    findPoolsByTrackerSymbol(trackerSymbol: string): Promise<PoolDTOs>;
    findPool(poolId: string): Promise<PoolDTO | null>;
    findPoolByTxHash(txHash: string): Promise<PoolDTO | null>;
    findJoinByTxHash(txHash: string): Promise<JoinLog | null>;
    findPoolsByMaker(maker: string, offset?: number, limit?: number): Promise<PoolDTOs>;
    private height;
    crawlerHeight(): Promise<void>;
    crawlerFixedPool(): Promise<void>;
    crawlerFloatPool(): Promise<void>;
    private updateBatch;
    updateExpiredPoolStatus(): Promise<void>;
}
