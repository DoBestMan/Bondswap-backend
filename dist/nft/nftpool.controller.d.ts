import { NFTPoolService } from './nftpool.service';
export declare class NFTPoolController {
    private readonly service;
    constructor(service: NFTPoolService);
    getNFTPoolByTxHash(_txHash: string): Promise<{}>;
    getNFTPoolById(_id: string): Promise<{}>;
    getPublicPools(_offset: string, _limit: string, _swaptype: string, _addr: string, _searchtype: string, _searchtext: string, _showall: string): Promise<{
        total: number;
        data: import("./nftpool.entity").NFTPool[];
    }>;
}
