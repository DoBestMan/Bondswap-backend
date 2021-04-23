export declare class Erc20Token {
    id: number;
    tracker: string;
    name: string;
    symbol: string;
    decimals: number;
}
export declare type Erc20DTO = Omit<Erc20Token, 'id'>;
