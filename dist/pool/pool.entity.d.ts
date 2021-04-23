import { PoolStatus } from 'src/typings/type';
export declare class Pool {
    id: number;
    poolId: number;
    name: string;
    maker: string;
    priv?: boolean;
    tracker: string;
    amount: string;
    leftAmount?: string;
    takerAmount?: string;
    makerAmount?: string;
    rate?: string;
    units?: string;
    closed?: boolean;
    txHash: string;
    blockHash: string;
    endTime: number;
    extra?: string;
    isFloat: boolean;
    status: PoolStatus;
    createAt: number;
    contract: string;
}
export declare class JoinLog {
    id: number;
    poolId: number;
    taker: string;
    priv?: boolean;
    ethAmount: string;
    amount: string;
    tracker: string;
    txHash: string;
    blockHash: string;
    isFloat: boolean;
    createAt: number;
    contract: string;
}
export declare class State {
    id: number;
    key: string;
    value: string;
}
export declare type FixedPool = Omit<Pool, 'takerAmount' | 'makerAmount'>;
export declare type FloatPool = Omit<Pool, 'priv' | 'leftAmount' | 'rate' | 'units' | 'extra'>;
export interface PoolDTO extends Pool {
    trackerSymbol: string;
    trackerDecimals: number;
}
