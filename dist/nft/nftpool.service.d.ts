import { Repository } from 'typeorm';
import { NFTPool, NftJoinLog } from './nftpool.entity';
import { State } from '../pool/pool.entity';
export declare class NFTPoolService {
    private pools;
    private joins;
    private state;
    private readonly logger;
    private readonly nftSwapContract;
    constructor(pools: Repository<NFTPool>, joins: Repository<NftJoinLog>, state: Repository<State>);
    private onNFTSwapCreate;
    private onNFTSwap;
    private onNFTClose;
    findNFTPoolByTxHash(txHash: string): Promise<NFTPool>;
    findNFTPoolById(id: string): Promise<NFTPool>;
    findPools(offset?: number, limit?: number, type?: number, addr?: string, searchtype?: string, searchtext?: string, showall?: number): Promise<{
        total: number;
        data: NFTPool[];
    }>;
    private height;
    crawlerHeight(): Promise<void>;
    crawlerNFTPool(): Promise<void>;
}
