import { PoolService, PoolDTOs, Joins } from './pool.service';
import { Pool, JoinLog } from './pool.entity';
import { PoolType, PoolStatus } from '../typings/type';
export declare class PoolController {
    private readonly service;
    constructor(service: PoolService);
    getPublicPools(type: Exclude<PoolType, 'private'>, status: PoolStatus, _offset: string, _limit: string): Promise<PoolDTOs>;
    getPrivatePools(status: PoolStatus, _offset: string, _limit: string): Promise<PoolDTOs>;
    getMimePools(address: string, _offset: string, _limit: string): Promise<PoolDTOs>;
    getMimeJoinPools(address: string, _offset: string, _limit: string): Promise<Joins>;
    getJoinPools(address: string, type: PoolType, status: PoolStatus, _offset: string, _limit: string): Promise<PoolDTOs>;
    getPoolsById(_poolId: string): Promise<Pool | unknown>;
    getPoolByTxHash(_txHash: string): Promise<Pool | unknown>;
    getJoinByTxHash(_txHash: string): Promise<JoinLog | unknown>;
    getPoolsByTracker(tracker: string): Promise<PoolDTOs>;
    getPoolsByTrackerName(trackerSymbol: string): Promise<PoolDTOs>;
}
