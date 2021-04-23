import { FixedPool, JoinLog } from './pool.entity';
import { Log } from '../typings/type';
export declare type CreateEvent = Omit<FixedPool, 'id' | 'isFloat' | 'createAt' | 'status'> & {
    blockHash: string;
};
export declare type JoinEvent = Omit<JoinLog, 'id' | 'isFloat' | 'createAt'> & {
    leftAmount: string;
};
export interface CloseEvent {
    poolId: number;
    priv: boolean;
    txHash: string;
    contract: string;
}
export interface FixedPoolNative {
    name: string;
    maker: string;
    endTime: number;
    enabled: boolean;
    tokenRate: string;
    tokenaddr: string;
    tokenAmount: string;
    units: string;
    onlyHolder: boolean;
}
interface Handler {
    onCreate(event: CreateEvent): Promise<void>;
    onJoin(event: JoinEvent): Promise<void>;
    onClose(event: CloseEvent): Promise<void>;
}
export default class Contract {
    private readonly address;
    private handler;
    private readonly logger;
    private abi;
    private provider;
    private contract;
    constructor(address: string, handler: Handler, network: string, appkey: string);
    logCreatePool: (id: any, maker: any, priv: any, tracker: any, amount: any, rate: any, units: any, event: Log) => Promise<void>;
    poolLeftAmount: (id: number, priv: boolean) => Promise<string>;
    logJoin: (id: any, taker: any, priv: any, ethAmount: any, tracker: any, amount: any, event: Log) => Promise<void>;
    logClose: (id: any, priv: any, event: Log) => Promise<void>;
    fixedPool(id: number): Promise<FixedPoolNative | null>;
    privPool(id: number): Promise<FixedPoolNative | null>;
    privPoolTakers(id: number): Promise<string[]>;
    getLogs(fromBlock?: string | number, toBlock?: number | string): Promise<void>;
}
export {};
