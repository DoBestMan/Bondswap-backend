interface Handler {
    onCreate(event: any): Promise<void>;
    onSwap(event: any): Promise<void>;
    onClose(event: any): Promise<void>;
}
export default class Contract {
    private readonly address;
    private handler;
    private readonly logger;
    private abi;
    private provider;
    private contract;
    constructor(address: string, handler: Handler, network: string, appkey: string);
    logCreateNFTPool: (args: any, log: any) => Promise<void>;
    logNFTSwapped: (args: any, log: any) => Promise<void>;
    logNFTClosed: (args: any) => Promise<void>;
    getLogs(fromBlock?: string | number, toBlock?: number | string): Promise<void>;
}
export {};
