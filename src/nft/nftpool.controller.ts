import { Controller, Get, Query, Param } from '@nestjs/common';
import { NFTPoolService } from './nftpool.service';
import { parseOffsetLimit } from '../utils';

@Controller('/api/v1/nftpool')
export class NFTPoolController {
    constructor(private readonly service: NFTPoolService) { }

    @Get('/pool-tx/:txHash')
    async getNFTPoolByTxHash(@Param('txHash') _txHash: string) {
      const pool = await this.service.findNFTPoolByTxHash(_txHash);
      return pool || {};
    }
    @Get('/pool-id/:id')
    async getNFTPoolById(@Param('id') _id: string) {
      const pool = await this.service.findNFTPoolById(_id);
      return pool || {};
    }
    @Get('/nft-pools')
    async getPublicPools(
      @Query('offset') _offset: string,
      @Query('limit') _limit: string,
      @Query('swaptype') _swaptype: string,
      @Query('addr') _addr: string,
      @Query('searchtype') _searchtype: string,
      @Query('searchtext') _searchtext: string,
      @Query('showall') _showall: string,
    ) {
      const { offset, limit } = parseOffsetLimit(_offset, _limit);
      return this.service.findPools(offset, limit, parseInt(_swaptype), _addr, _searchtype, _searchtext, parseInt(_showall));
    }
}