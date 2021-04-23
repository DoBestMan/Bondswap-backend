"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PoolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const lru_cache_1 = __importDefault(require("lru-cache"));
const pool_entity_1 = require("./pool.entity");
const erc20_service_1 = require("../erc20/erc20.service");
const fixed_pool_contract_1 = __importDefault(require("./fixed-pool.contract"));
const float_pool_contract_1 = __importDefault(require("./float-pool.contract"));
const market_price_contract_1 = __importDefault(require("./market-price.contract"));
const app_config_1 = __importDefault(require("../app.config"));
const api_1 = require("../api");
const utils_1 = require("../utils");
const ethers_1 = require("ethers");
const sdk_1 = require("@uniswap/sdk");
let PoolService = PoolService_1 = class PoolService {
    constructor(pools, joins, state, erc20Service) {
        this.pools = pools;
        this.joins = joins;
        this.state = state;
        this.erc20Service = erc20Service;
        this.logger = new common_1.Logger(PoolService_1.name);
        this.fixedPoolContractV2 = new fixed_pool_contract_1.default(app_config_1.default.FIXED_POOL_CONTRACT_V2, {
            onCreate: this.onFixedPoolCreate.bind(this),
            onJoin: this.onFixedPoolJoin.bind(this),
            onClose: this.onFixedPoolClose.bind(this),
        }, app_config_1.default.INFURA_NETWORK, app_config_1.default.INFURA_APP_ID);
        this.floatPoolContractV2 = new float_pool_contract_1.default(app_config_1.default.FLOAT_POOL_CONTRACT_V2, {
            onCreate: this.onFloatPoolCreate.bind(this),
            onJoin: this.onFloatPoolJoin.bind(this),
        }, app_config_1.default.INFURA_NETWORK, app_config_1.default.INFURA_APP_ID);
        this.marketPriceContract = new market_price_contract_1.default(app_config_1.default.MARKET_PRICE_CONTRACT, app_config_1.default.INFURA_NETWORK, app_config_1.default.INFURA_APP_ID);
        this.getTokenPrice = async (coin) => {
            let price = '0';
            try {
                let provider = new ethers_1.ethers.providers.InfuraProvider(app_config_1.default.INFURA_NETWORK, app_config_1.default.INFURA_APP_ID);
                const token = new sdk_1.Token(sdk_1.ChainId.MAINNET, coin.tracker, coin.decimals);
                const pair = await sdk_1.Fetcher.fetchPairData(token, sdk_1.WETH[sdk_1.ChainId.MAINNET], provider);
                const route = new sdk_1.Route([pair], token);
                console.log(route.midPrice);
                console.log(app_config_1.default.INFURA_NETWORK);
                price = route.midPrice.toSignificant(coin.decimals);
            }
            catch (e) {
            }
            return price;
        };
        this.deleteUselessFields = async (pool) => {
            if (!pool)
                return null;
            if (pool.isFloat) {
                delete pool.leftAmount;
                delete pool.rate;
                delete pool.units;
                delete pool.extra;
            }
            else {
                delete pool.takerAmount;
                delete pool.makerAmount;
            }
            const coin = await this.erc20Service.getERC20Token(pool.tracker);
            let pairSymbols = pool.name.split(' ').join("").split('<>');
            let marketPrice = "...";
            for (let i = 0; i < app_config_1.default.PRICE_FEEDS.length; i++) {
                let priceObj = Object.entries(app_config_1.default.PRICE_FEEDS[i]).find(([key, value]) => {
                    let symbols = key.split('/');
                    return symbols[0].includes(pairSymbols[0]) && symbols[1].includes('USD');
                });
                if (!!priceObj) {
                    marketPrice = await this.marketPriceContract.getLatestMarketPrice(priceObj[1]);
                    break;
                }
            }
            return Object.assign(Object.assign({}, pool), { trackerSymbol: (coin === null || coin === void 0 ? void 0 : coin.symbol) || '', trackerDecimals: (coin === null || coin === void 0 ? void 0 : coin.decimals) || -1, marketPrice: marketPrice });
        };
        this.height = 0;
        this.updateBatch = 50;
        this.logger.log(`poolService init`);
        this.blockCache = new lru_cache_1.default({
            max: 1000,
            maxAge: 1000 * 60 * 30,
        });
    }
    async getBlock(hash) {
        const block = this.blockCache.get(hash);
        if (block) {
            return block;
        }
        const block2 = await api_1.getBlockByHash(hash);
        this.blockCache.set(hash, block2);
        return block2;
    }
    async getBlockTime(hash) {
        const block = await this.getBlock(hash);
        return block ? block.timestamp : -1;
    }
    async onFixedPoolCreate(event) {
        this.logger.log("Create Fixed Pool " + event.poolId);
        const pool = await this.pools.findOne({
            poolId: event.poolId,
            txHash: event.txHash,
        });
        if (!pool) {
            try {
                const time = await this.getBlockTime(event.blockHash);
                const pool = Object.assign(Object.assign({}, event), { closed: false, isFloat: false, createAt: time, status: 'Live', contract: event.contract });
                await this.pools.save(pool);
            }
            catch (e) {
                this.logger.error(`failed to save fixedPool ${e}`);
            }
        }
    }
    async onFixedPoolJoin(event) {
        this.logger.log(`onFixedPoolJoin: ${JSON.stringify(event)}`);
        try {
            const join = await this.joins.findOne({
                poolId: event.poolId,
                priv: event.priv,
                taker: event.taker,
                txHash: event.txHash,
                isFloat: false,
                contract: event.contract,
            });
            if (!join) {
                await this.joins.save(Object.assign(Object.assign({}, event), { isFloat: false, contract: event.contract }));
            }
        }
        catch (e) {
        }
        const pool = await this.pools.findOne({
            poolId: event.poolId,
            priv: event.priv,
            isFloat: false,
            contract: event.contract,
        });
        if (pool) {
            console.log('join', pool.leftAmount, event.leftAmount, BigInt(pool.leftAmount) > BigInt(event.leftAmount));
            if (BigInt(pool.leftAmount) > BigInt(event.leftAmount)) {
                pool.leftAmount = event.leftAmount;
                if (parseFloat(pool.leftAmount) === 0 && pool.status === 'Live') {
                    pool.status = 'Filled';
                }
                await this.pools.save(pool);
            }
        }
    }
    async onFixedPoolClose(event) {
        this.logger.log(`onClose: ${JSON.stringify(event)}`);
        const pool = await this.pools.findOne({
            poolId: event.poolId,
            priv: event.priv,
            isFloat: false,
            contract: event.contract,
        });
        if (pool) {
            pool.closed = true;
            pool.status = 'Closed';
            await this.pools.save(pool);
        }
        else {
            this.logger.error(`close pool not exist: id ${event.poolId}, priv ${event.priv}`);
        }
    }
    async onFloatPoolCreate(event) {
        this.logger.log(`onCreate: ${JSON.stringify(event)}`);
        const pool = await this.pools.findOne({
            txHash: event.txHash
        });
        if (!pool) {
            try {
                const block = await this.getBlock(event.blockHash);
                const time = block ? block.timestamp : 0;
                const pool = Object.assign(Object.assign({}, event), { isFloat: true, createAt: time, status: 'Live', contract: event.contract });
                await this.pools.save(pool);
            }
            catch (e) {
                this.logger.error(`failed to save floatPool ${e}`);
            }
        }
    }
    async onFloatPoolJoin(event) {
        this.logger.log(`onJoin: ${JSON.stringify(event)}`);
        const join = await this.joins.findOne({
            poolId: event.poolId,
            taker: event.taker,
            txHash: event.txHash,
            isFloat: true,
            contract: event.contract,
        });
        if (!join) {
            await this.joins.save(Object.assign(Object.assign({}, event), { isFloat: true, contract: event.contract }));
        }
        const pool = await this.pools.findOne({
            poolId: event.poolId,
            isFloat: true,
            contract: event.contract,
        });
        if (pool) {
            const poolNative = await this.floatPoolContractV2.pool(event.poolId);
            pool.makerAmount = poolNative.makerReceiveTotal.toString();
            pool.takerAmount = poolNative.takerAmountTotal.toString();
            try {
                await this.pools.save(pool);
            }
            catch (e) {
            }
        }
    }
    async findPublicPools(type, status, offset = 0, limit = 20) {
        type = type || 'public';
        status = status || 'All';
        const where = {
            priv: false,
        };
        if (type === 'fixed') {
            where.isFloat = false;
        }
        else if (type === 'float') {
            where.isFloat = true;
        }
        if (status !== 'All') {
            where.status = status;
        }
        const [data, total] = await this.pools.findAndCount({
            where,
            order: {
                poolId: 'DESC',
                createAt: 'DESC',
            },
            skip: offset,
            take: limit,
        });
        return {
            total,
            data: await Promise.all(data.map(this.deleteUselessFields)),
        };
    }
    async findPrivatePools(status, offset = 0, limit = 20) {
        status = status || 'All';
        const where = {
            priv: true,
        };
        if (status !== 'All') {
            where.status = status;
        }
        const [data, total] = await this.pools.findAndCount({
            where,
            order: {
                poolId: 'DESC',
                createAt: 'DESC',
            },
            skip: offset,
            take: limit,
        });
        return {
            total,
            data: await Promise.all(data.map(this.deleteUselessFields)),
        };
    }
    async findPools(offset = 0, limit = 20) {
        const total = await this.pools.count();
        const data = await this.pools.find({
            skip: offset,
            take: limit,
            order: {
                poolId: 'DESC',
                createAt: 'DESC',
            },
        });
        return {
            total,
            data: await Promise.all(data.map(this.deleteUselessFields)),
        };
    }
    async findPoolsByTracker(tracker) {
        const [data, total] = await this.pools.findAndCount({
            where: {
                tracker,
            },
            order: {
                poolId: 'DESC',
                createAt: 'DESC',
            },
        });
        return {
            total,
            data: await Promise.all(data.map(this.deleteUselessFields)),
        };
    }
    async findJoinsByTaker(taker, offset, limit) {
        const [data, total] = await this.joins.findAndCount({
            where: {
                taker,
            },
            order: {
                poolId: 'DESC',
                createAt: 'DESC',
            },
            skip: offset,
            take: limit,
        });
        return {
            total,
            data,
        };
    }
    async findJoinedPoolsByTaker(address, type, status, offset, limit) {
        status = status || 'All';
        let query = this.pools.createQueryBuilder('pool')
            .innerJoin(pool_entity_1.JoinLog, 'join_log', 'pool.poolId=join_log.poolId and pool.priv=join_log.priv and pool.isFloat=join_log.isFloat')
            .where('join_log.taker = :address', { address });
        if (type === 'public') {
            query = query.andWhere('pool.priv = false');
        }
        else if (type === 'private') {
            query = query.andWhere('pool.priv = true');
        }
        else if (type === 'fixed') {
            query = query.andWhere('pool.isFloat = false');
        }
        else if (type === 'float') {
            query = query.andWhere('pool.isFloat = true');
        }
        if (status !== 'All') {
            query = query.andWhere(`pool.status = ${status}`);
        }
        const total = await query.getCount();
        if (total > 0) {
            const data = await query.skip(offset).take(limit).getMany();
            return {
                total,
                data: await Promise.all(data.map(this.deleteUselessFields)),
            };
        }
        return {
            total: 0,
            data: [],
        };
    }
    async findPoolsByTrackerSymbol(trackerSymbol) {
        const trackers = await this.erc20Service.getTrakersBySymbol(trackerSymbol);
        if (trackers.length === 0) {
            return {
                total: 0,
                data: [],
            };
        }
        const [data, total] = await this.pools.findAndCount({
            where: {
                tracker: typeorm_2.In(trackers),
            },
            order: {
                poolId: 'DESC',
                createAt: 'DESC',
            },
        });
        return {
            total,
            data: await Promise.all(data.map(this.deleteUselessFields)),
        };
    }
    async findPool(poolId) {
        poolId = poolId.toLowerCase();
        let pool = null;
        if (poolId.startsWith('f')) {
            const id = parseInt(poolId.slice(1), 10);
            if (isNaN(id)) {
                return null;
            }
            pool = await this.pools.findOne({
                poolId: id,
                isFloat: true,
            });
        }
        else if (poolId.startsWith('p')) {
            const id = parseInt(poolId.slice(1), 10);
            if (isNaN(id)) {
                return null;
            }
            pool = await this.pools.findOne({
                poolId: id,
                priv: true,
            });
        }
        else {
            const id = parseInt(poolId, 10);
            if (isNaN(id)) {
                return null;
            }
            pool = await this.pools.findOne({
                poolId: id,
                isFloat: false,
                priv: false,
            });
        }
        if (pool) {
            return this.deleteUselessFields(pool);
        }
        return null;
    }
    async findPoolByTxHash(txHash) {
        const pool = await this.pools.findOne({
            txHash,
        });
        if (!pool) {
            return null;
        }
        return this.deleteUselessFields(pool);
    }
    async findJoinByTxHash(txHash) {
        const join = await this.joins.findOne({
            txHash,
        });
        return join;
    }
    async findPoolsByMaker(maker, offset = 0, limit = 20) {
        const data = await this.pools.find({
            where: {
                maker: maker,
            },
            skip: offset,
            take: limit,
            order: {
                poolId: 'DESC',
                createAt: 'DESC',
            },
        });
        const total = await this.pools.count({
            maker: maker,
        });
        return {
            total,
            data: await Promise.all(data.map(this.deleteUselessFields)),
        };
    }
    async crawlerHeight() {
        const st = (await this.state.findOne({ key: 'eth_height' })) || { key: 'eth_height', value: '0' };
        const _height = parseInt(st.value, 10) || 0;
        this.height = _height;
        const number = await api_1.getBlockNumber().catch((e) => {
            console.error(e);
            return 0;
        });
        if (number > _height) {
            this.height = number;
            st.value = `${number}`;
            await this.state.save(st);
        }
    }
    async crawlerFixedPool() {
        const st = (await this.state.findOne({ key: 'eth_fixed_pool_height' })) || { key: 'eth_fixed_pool_height', value: '0' };
        const _height = parseInt(st.value, 10) || 0;
        const height = this.height;
        if (height > _height) {
            await this.fixedPoolContractV2.getLogs(Math.max(_height - 1, 0), height);
            st.value = `${height}`;
            await this.state.save(st);
        }
    }
    async crawlerFloatPool() {
        const st = (await this.state.findOne({ key: 'eth_float_pool_height' })) || { key: 'eth_float_pool_height', value: '0' };
        const _height = parseInt(st.value, 10) || 0;
        const height = this.height;
        if (height > _height) {
            await this.floatPoolContractV2.getLogs(Math.max(_height - 1, 0), height);
            st.value = `${height}`;
            await this.state.save(st);
        }
    }
    async updateExpiredPoolStatus() {
        const now = utils_1.nows();
        let skip = 0;
        while (true) {
            const pools = await this.pools.find({
                where: {
                    closed: false,
                    endTime: typeorm_2.LessThanOrEqual(now),
                },
                order: {
                    poolId: 'ASC',
                },
                skip,
                take: this.updateBatch,
            });
            if (pools && pools.length > 0) {
                const pros = pools.map(async (pool) => {
                    let shouldUpdate = false;
                    if (pool.status !== 'Closed') {
                        pool.status = 'Closed';
                        shouldUpdate = true;
                    }
                    let poolNative = null;
                    if (pool.contract === app_config_1.default.FIXED_POOL_CONTRACT_V2 || pool.contract === app_config_1.default.FLOAT_POOL_CONTRACT_V2) {
                        poolNative = pool.isFloat ?
                            await this.floatPoolContractV2.pool(pool.poolId) :
                            pool.priv ?
                                await this.fixedPoolContractV2.privPool(pool.poolId) :
                                await this.fixedPoolContractV2.fixedPool(pool.poolId);
                    }
                    if (!poolNative.enabled) {
                        pool.closed = true;
                        shouldUpdate = true;
                        this.logger.warn(`close pool ${pool.isFloat ? 'float' : pool.priv ? 'priv' : ''}: ${pool.poolId}`);
                    }
                    if (pool.isFloat) {
                        pool.makerAmount = poolNative.makerReceiveTotal.toString();
                        pool.takerAmount = poolNative.takerAmountTotal.toString();
                    }
                    if (pool.createAt < 1 && pool.blockHash) {
                        shouldUpdate = true;
                        pool.createAt = await this.getBlockTime(pool.blockHash);
                    }
                    if (shouldUpdate) {
                        await this.pools.save(pool);
                    }
                });
                await Promise.all(pros);
                skip += pools.length;
                if (pools.length < this.updateBatch) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
};
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoolService.prototype, "crawlerHeight", null);
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoolService.prototype, "crawlerFixedPool", null);
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoolService.prototype, "crawlerFloatPool", null);
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoolService.prototype, "updateExpiredPoolStatus", null);
PoolService = PoolService_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(pool_entity_1.Pool)),
    __param(1, typeorm_1.InjectRepository(pool_entity_1.JoinLog)),
    __param(2, typeorm_1.InjectRepository(pool_entity_1.State)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        erc20_service_1.Erc20Service])
], PoolService);
exports.PoolService = PoolService;
//# sourceMappingURL=pool.service.js.map