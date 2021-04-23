export interface Log {
    address: string;
    blockHash: string;
    blockNumber: string;
    data: string;
    logIndex: string;
    removed: boolean;
    topics: string[];
    transactionHash: string;
    transactionIndex: string;
}
export declare type PoolStatus = 'Live' | 'Filled' | 'Closed' | 'All';
export declare type PublicPoolType = 'public' | 'fixed' | 'float';
export declare type PoolType = PublicPoolType | 'private';
