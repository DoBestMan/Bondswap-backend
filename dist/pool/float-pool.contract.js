"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const api_1 = require("../api");
const float_pool_abi_1 = __importDefault(require("./float-pool-abi"));
class Contract {
    constructor(address, handler, network, appkey) {
        this.address = address;
        this.handler = handler;
        this.logger = new common_1.Logger('float-contract');
        this.logCreatePool = async (id, maker, priv, tracker, amount, rate, units, event) => {
            const pool = await this.pool(id);
            const eventCreate = {
                poolId: id,
                maker,
                tracker,
                amount: amount.toString(),
                name: pool.name,
                endTime: pool.endTime,
                txHash: event.transactionHash,
                takerAmount: pool.takerAmountTotal.toString(),
                makerAmount: pool.makerReceiveTotal.toString(),
                blockHash: event.blockHash,
                contract: this.address,
            };
            await this.handler.onCreate(eventCreate);
        };
        this.logJoin = async (id, taker, priv, ethAmount, tracker, amount, event) => {
            const eventJoin = {
                poolId: id,
                taker,
                ethAmount: ethAmount.toString(),
                tracker: tracker.toString(),
                txHash: event.transactionHash,
                blockHash: event.blockHash,
                contract: this.address,
            };
            await this.handler.onJoin(eventJoin);
        };
        this.logger.log(`float contract: ${address}`);
        this.abi = new ethers_1.ethers.utils.Interface(float_pool_abi_1.default);
        this.provider = new ethers_1.ethers.providers.InfuraProvider(network, appkey);
        this.contract = new ethers_1.ethers.Contract(address, float_pool_abi_1.default, this.provider);
        this.contract.on('CreatePool', this.logCreatePool);
        this.contract.on('Join', this.logJoin);
    }
    async pool(id) {
        return this.contract.bidPools(id);
    }
    async getLogs(fromBlock, toBlock) {
        if (typeof fromBlock === 'number') {
            fromBlock = ethers_1.ethers.utils.hexValue(fromBlock);
        }
        if (typeof toBlock === 'number') {
            toBlock = ethers_1.ethers.utils.hexValue(toBlock);
        }
        const logs = await api_1.getLogs(this.address, fromBlock, toBlock);
        if (logs) {
            this.logger.log(`get ${logs.length} log from ${fromBlock} to ${toBlock}`);
            for (const log of logs) {
                try {
                    const { name, args } = this.abi.parseLog(log);
                    this.logger.log(`log: ${name}, ${args}`);
                    switch (name) {
                        case 'CreatePool':
                            await this.logCreatePool(args.id, args.maker, args.priv, args.tracker, args.amount, args.rate, args.units, log);
                            break;
                        case 'Join':
                            await this.logJoin(args.id, args.taker, args.priv, args.ethAmount, args.tracker, args.amount, log);
                            break;
                    }
                }
                catch (err) {
                    this.logger.error(`failed to parse log: ${err}`);
                }
            }
        }
    }
}
exports.default = Contract;
//# sourceMappingURL=float-pool.contract.js.map