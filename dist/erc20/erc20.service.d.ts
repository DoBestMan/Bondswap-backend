import { Repository } from 'typeorm';
import { Provider } from '@ethersproject/abstract-provider';
import { Erc20Token, Erc20DTO } from './erc20.entity';
export declare class Erc20Service {
    private erc20Tokens;
    private readonly logger;
    private erc20Contracts;
    private erc20TokensCache;
    provider: Provider;
    constructor(erc20Tokens: Repository<Erc20Token>);
    getERC20Token(tracker: string): Promise<Erc20DTO | null>;
    getTrakersBySymbol(trackerSymbol: string): Promise<string[]>;
}
