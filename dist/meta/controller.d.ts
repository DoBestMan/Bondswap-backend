import { MetaService } from './service';
export declare class MetaController {
    private readonly service;
    private readonly logger;
    constructor(service: MetaService);
    private checkAPIKEY;
    getOfficialAddress(): Promise<string[]>;
    GetImage(_url: string): Promise<any>;
    getTime(): Promise<number>;
    addOficialAddress(data: string[], key: string): Promise<string>;
    delOficialAddress(data: string[], key: string): Promise<string>;
}
