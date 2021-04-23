"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const market_price_abi_1 = __importDefault(require("./market-price.abi"));
class Contract {
    constructor(address, network, appkey) {
        this.address = address;
        this.getLatestMarketPrice = async (aggregatorAddress) => {
            const price = await this.contract.getLatestMarketPrice(aggregatorAddress);
            return ethers_1.ethers.BigNumber.from(price).toString();
        };
        this.getPriceOfBatch = async (aggregatorAddresses) => {
            const prices = await this.contract.priceOfBatch(aggregatorAddresses);
            return prices;
        };
        this.provider = new ethers_1.ethers.providers.InfuraProvider(network, appkey);
        this.contract = new ethers_1.ethers.Contract(address, market_price_abi_1.default, this.provider);
    }
}
exports.default = Contract;
//# sourceMappingURL=market-price.contract.js.map