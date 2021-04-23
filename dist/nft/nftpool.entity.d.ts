export declare class NFTPool {
    id: number;
    poolId: number;
    lister: string;
    tokenType: number;
    tokenAddress: string;
    tokenId: number;
    batchCount: number;
    name: string;
    txHash: string;
    isPrivate: boolean;
    status: string;
    endTime: number;
    swapType: number;
}
export declare class NftJoinLog {
    id: number;
    poolId: number;
    txHash: string;
    count: number;
}
