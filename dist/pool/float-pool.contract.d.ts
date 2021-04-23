import { FloatPool, JoinLog } from './pool.entity';
import { Log } from '../typings/type';
export declare type CreateEvent = Omit<FloatPool, 'id' | 'isFloat' | 'createAt' | 'status'> & {
    blockHash: string;
};
export declare type JoinEvent = Omit<JoinLog, 'id' | 'priv' | 'isFloat' | 'createAt' | 'amount'>;
interface Handler {
    onCreate(event: CreateEvent): Promise<void>;
    onJoin(event: JoinEvent): Promise<void>;
}
export interface FloatPoolNative {
    name: string;
    maker: string;
    endTime: number;
    enabled: boolean;
    tokenaddr: string;
    tokenAmount: string;
    takerAmountTotal: string;
    makerReceiveTotal: string;
    onlyHolder: boolean;
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
    logJoin: (id: any, taker: any, priv: any, ethAmount: any, tracker: any, amount: any, event: Log) => Promise<void>;
    pool(id: number): Promise<FloatPoolNative | null>;
    getLogs(fromBlock?: string | number, toBlock?: number | string): Promise<void>;
}
export {};
