"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const api_1 = require("../api");
const fixed_pool_abi_1 = __importDefault(require("./fixed-pool-abi"));
class Contract {
    constructor(address, handler, network, appkey) {
        this.address = address;
        this.handler = handler;
        this.logger = new common_1.Logger('fixed-contract');
        this.logCreatePool = async (id, maker, priv, tracker, amount, rate, units, event) => {
            let pool;
            let takers = [];
            if (priv) {
                pool = await this.contract.privFixedPools(id);
                takers = await this.contract.privFixedPoolTakers(id);
            }
            else {
                pool = await this.contract.fixedPools(id);
            }
            const eventCreate = {
                poolId: id,
                maker: maker,
                priv: priv,
                tracker: tracker,
                amount: amount.toString(),
                rate: rate.toString(),
                units: units.toString(),
                name: pool.name,
                endTime: pool.endTime,
                leftAmount: pool.tokenAmount.toString(),
                txHash: event.transactionHash,
                blockHash: event.blockHash,
                extra: JSON.stringify({ takers }),
                contract: this.address,
            };
            await this.handler.onCreate(eventCreate);
        };
        this.poolLeftAmount = async (id, priv) => {
            let pool;
            if (priv) {
                pool = await this.contract.privFixedPools(id);
            }
            else {
                pool = await this.contract.fixedPools(id);
            }
            return pool.tokenAmount.toString();
        };
        this.logJoin = async (id, taker, priv, ethAmount, tracker, amount, event) => {
            const eventJoin = {
                poolId: id,
                taker: taker,
                priv: priv,
                ethAmount: ethAmount.toString(),
                tracker: tracker.toString(),
                amount: amount.toString(),
                leftAmount: await this.poolLeftAmount(id, priv),
                txHash: event.transactionHash,
                blockHash: event.blockHash,
                contract: this.address,
            };
            await this.handler.onJoin(eventJoin);
        };
        this.logClose = async (id, priv, event) => {
            const eventClose = {
                poolId: id,
                priv: priv,
                txHash: event.transactionHash,
                contract: this.address,
            };
            await this.handler.onClose(eventClose);
        };
        this.logger.log(`fixed contract: ${address}`);
        this.abi = new ethers_1.ethers.utils.Interface(fixed_pool_abi_1.default);
        this.provider = new ethers_1.ethers.providers.InfuraProvider(network, appkey);
        this.contract = new ethers_1.ethers.Contract(address, fixed_pool_abi_1.default, this.provider);
        this.contract.on('CreatePool', this.logCreatePool);
        this.contract.on('Join', this.logJoin);
        this.contract.on('Close', this.logClose);
    }
    async fixedPool(id) {
        return this.contract.fixedPools(id);
    }
    async privPool(id) {
        return this.contract.privFixedPools(id);
    }
    async privPoolTakers(id) {
        return this.contract.privFixedPoolTakers(id);
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
                const { name, args } = this.abi.parseLog(log);
                this.logger.log(`log: ${name}, ${args}, ${log.blockNumber}`);
                switch (name) {
                    case 'CreatePool':
                        await this.logCreatePool(args.id, args.maker, args.priv, args.tracker, args.amount, args.rate, args.units, log);
                        break;
                    case 'Join':
                        await this.logJoin(args.id, args.taker, args.priv, args.ethAmount, args.tracker, args.amount, log);
                        break;
                    case 'Close':
                        await this.logClose(args.id, args.priv, log);
                        break;
                }
            }
        }
    }
}
exports.default = Contract;
//# sourceMappingURL=fixed-pool.contract.js.map