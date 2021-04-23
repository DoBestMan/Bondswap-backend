import { Repository } from 'typeorm';
import { OfficialAddress } from './entity';
export declare class MetaService {
    private address;
    private readonly logger;
    constructor(address: Repository<OfficialAddress>);
    addAddress(address: string[]): Promise<void>;
    delAddress(address: string[]): Promise<void>;
    getAddress(): Promise<string[]>;
}
