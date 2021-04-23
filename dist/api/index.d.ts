import { Log } from '../typings/type';
export declare function getBlockNumber(): Promise<number>;
export declare function getLogs(address: string, fromBlock?: string, toBlock?: string): Promise<Log[]>;
export interface Block {
    number: number;
    timestamp: number;
    hash: string;
}
export declare function getBlockByHash(hash: string): Promise<Block>;
