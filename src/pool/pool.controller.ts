import { Controller, Get, Query, Param } from '@nestjs/common';
import { PoolService, PoolDTOs, Joins } from './pool.service';
import { Pool, JoinLog } from './pool.entity';
import { parseOffsetLimit } from '../utils';
import { PoolType, PoolStatus } from '../typings/type';

@Controller('/api/v1/pool')
export class PoolController {
  constructor(private readonly service: PoolService) { }

  @Get('/public-pools')
  async getPublicPools(
    @Query('type') type: Exclude<PoolType, 'private'>,
    @Query('status') status: PoolStatus,
    @Query('offset') _offset: string,
    @Query('limit') _limit: string
  ): Promise<PoolDTOs> {
    const { offset, limit } = parseOffsetLimit(_offset, _limit);
    return this.service.findPublicPools(type, status, offset, limit);
  }

  @Get('/private-pools')
  async getPrivatePools(
    @Query('status') status: PoolStatus,
    @Query('offset') _offset: string,
    @Query('limit') _limit: string
  ): Promise<PoolDTOs> {
    const { offset, limit } = parseOffsetLimit(_offset, _limit);
    return this.service.findPrivatePools(status, offset, limit);
  }

  @Get('/mime-pools')
  async getMimePools(
    @Query('address') address: string,
    @Query('offset') _offset: string,
    @Query('limit') _limit: string
  ): Promise<PoolDTOs> {
    const { offset, limit } = parseOffsetLimit(_offset, _limit);
    return this.service.findPoolsByMaker(address, offset, limit);
  }

  // 即将废弃的接口
  @Get('/mime-join-pools')
  async getMimeJoinPools(@Query('address') address: string, @Query('offset') _offset: string, @Query('limit') _limit: string): Promise<Joins> {
    const { offset, limit } = parseOffsetLimit(_offset, _limit);
    return this.service.findJoinsByTaker(address, offset, limit);
  }

  @Get('/join-pools/:address')
  async getJoinPools(
    @Param('address') address: string,
    @Query('type') type: PoolType,
    @Query('status') status: PoolStatus,
    @Query('offset') _offset: string,
    @Query('limit') _limit: string
  ): Promise<PoolDTOs> {
    const { offset, limit } = parseOffsetLimit(_offset, _limit);
    return this.service.findJoinedPoolsByTaker(address, type, status, offset, limit);
  }

  @Get('/pool/:poolId')
  async getPoolsById(@Param('poolId') _poolId: string): Promise<Pool | unknown> {
    const pool = await this.service.findPool(_poolId);
    return pool || {};
  }

  @Get('/pool-tx/:txHash')
  async getPoolByTxHash(@Param('txHash') _txHash: string): Promise<Pool | unknown> {
    const pool = await this.service.findPoolByTxHash(_txHash);
    return pool || {};
  }

  @Get('/join-tx/:txHash')
  async getJoinByTxHash(@Param('txHash') _txHash: string): Promise<JoinLog | unknown> {
    const join = await this.service.findJoinByTxHash(_txHash);
    return join || {};
  }

  @Get('/pools-tracker/:tracker')
  async getPoolsByTracker(@Param('tracker') tracker: string): Promise<PoolDTOs> {
    return this.service.findPoolsByTracker(tracker);
  }

  @Get('/pools-tracker-symbol/:trackerSymbol')
  async getPoolsByTrackerName(@Param('trackerSymbol') trackerSymbol: string): Promise<PoolDTOs> {
    return this.service.findPoolsByTrackerSymbol(trackerSymbol);
  }
}
