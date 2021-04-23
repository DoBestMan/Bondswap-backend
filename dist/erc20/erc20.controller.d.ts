import { Erc20Service } from './erc20.service';
import { State } from '../pool/pool.entity';
import { Repository } from 'typeorm';
export declare class Erc20Controller {
    private readonly service;
    private state;
    private readonly logger;
    private uniClient;
    constructor(service: Erc20Service, state: Repository<State>);
    getCoin(address: string): Promise<{}>;
    private lastEthTime;
    private ethPrice;
    private readonly bondlyQL;
    bondlyResult: {
        price: string;
        totalSupply: number;
        reserveUSD: number;
    };
    ethResult: {
        price: string;
        totalSupply: number;
        reserveUSD: number;
    };
    bondlyResultTime: number;
    ethResultTime: number;
    zomPrice(): Promise<{
        price: string;
        totalSupply: number;
        reserveUSD: number;
    }>;
    price(): Promise<string>;
}
