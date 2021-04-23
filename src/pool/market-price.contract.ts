
import { ethers } from 'ethers';
import abi from './market-price.abi';
import { Provider } from '@ethersproject/abstract-provider';


export default class Contract {
    private provider: Provider;
    private contract: ethers.Contract;

    constructor(private readonly address: string, network: string, appkey: string) {
        this.provider = new ethers.providers.InfuraProvider(network, appkey);
        this.contract = new ethers.Contract(address, abi, this.provider);
    }

    getLatestMarketPrice = async (aggregatorAddress?: any) => {
        const price = await this.contract.getLatestMarketPrice(aggregatorAddress);
        return ethers.BigNumber.from(price).toString();
    }

    getPriceOfBatch = async (aggregatorAddresses?: string[]) => {
        const prices = await this.contract.priceOfBatch(aggregatorAddresses);
        return prices;
    }
}
