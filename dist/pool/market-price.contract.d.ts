export default class Contract {
    private readonly address;
    private provider;
    private contract;
    constructor(address: string, network: string, appkey: string);
    getLatestMarketPrice: (aggregatorAddress?: any) => Promise<string>;
    getPriceOfBatch: (aggregatorAddresses?: string[]) => Promise<any>;
}
