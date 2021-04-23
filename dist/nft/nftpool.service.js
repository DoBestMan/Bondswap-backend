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
var NFTPoolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTPoolService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const nftpool_entity_1 = require("./nftpool.entity");
const pool_entity_1 = require("../pool/pool.entity");
const nftpool_contract_1 = __importDefault(require("./nftpool.contract"));
const app_config_1 = __importDefault(require("../app.config"));
const api_1 = require("../api");
const moment = require('moment');
let NFTPoolService = NFTPoolService_1 = class NFTPoolService {
    constructor(pools, joins, state) {
        this.pools = pools;
        this.joins = joins;
        this.state = state;
        this.logger = new common_1.Logger(NFTPoolService_1.name);
        this.nftSwapContract = new nftpool_contract_1.default(app_config_1.default.NFT_SWAP_CONTRACT, {
            onCreate: this.onNFTSwapCreate.bind(this),
            onSwap: this.onNFTSwap.bind(this),
            onClose: this.onNFTClose.bind(this)
        }, app_config_1.default.INFURA_NETWORK, app_config_1.default.INFURA_APP_ID);
        this.height = 0;
        this.logger.log(`NFTPoolService init`);
    }
    async onNFTSwapCreate(event) {
        this.logger.log(`onNFTSwapCreate: ${JSON.stringify(event)}`);
        const pool = await this.pools.findOne({
            poolId: event.poolId
        });
        if (!pool) {
            try {
                await this.pools.save(event);
            }
            catch (e) {
                this.logger.error(`failed to save NFTSwap ${e}`);
            }
        }
    }
    async onNFTSwap(event) {
        this.logger.log(`onNFTSwapped: ${JSON.stringify(event)}`);
        try {
            const pool = await this.pools.findOne({
                poolId: event.poolId
            });
            const join = await this.joins.findOne({
                txHash: event.txHash
            });
            if (pool && !join) {
                await this.joins.save(event);
                let query = this.pools.createQueryBuilder('pool');
                const newCount = pool.batchCount - parseInt(event.count);
                await query.andWhere('poolId = :id', { id: event.poolId }).update({ batchCount: newCount }).execute();
            }
        }
        catch (e) {
            this.logger.error(`failed to update NFTSwap ${e}`);
        }
    }
    async onNFTClose(event) {
        this.logger.log(`onNFTClosed: ${JSON.stringify(event)}`);
        try {
            const pool = await this.pools.findOne({
                poolId: event.poolId
            });
            if (pool) {
                let query = this.pools.createQueryBuilder('pool');
                await query.andWhere('poolId = :id', { id: event.poolId }).update({ status: 'Closed' }).execute();
            }
        }
        catch (e) {
            this.logger.error(`failed to close NFTSwap ${e}`);
        }
    }
    async findNFTPoolByTxHash(txHash) {
        const pool = await this.pools.findOne({
            txHash,
        });
        if (!pool) {
            return null;
        }
        return pool;
    }
    async findNFTPoolById(id) {
        const pool = await this.pools.findOne({
            poolId: parseInt(id),
        });
        if (!pool) {
            return null;
        }
        return pool;
    }
    async findPools(offset = 0, limit = 4, type = 0, addr = '', searchtype = '', searchtext = '', showall = 1) {
        let query = this.pools.createQueryBuilder('nft_pool').addOrderBy("poolId", "DESC");
        if (type === 0) {
            query = query.andWhere('nft_pool.isPrivate = false');
        }
        else if (type === 1) {
            query = query.andWhere('nft_pool.isPrivate = true');
        }
        else {
            query = query.andWhere('nft_pool.lister = :addr', { addr });
        }
        if (searchtext) {
            if (searchtype === 'id') {
                query = query.andWhere('nft_pool.poolId = :id', { id: searchtext });
            }
            else if (searchtype === "name") {
                const search = searchtext.toLowerCase();
                query = query.andWhere("nft_pool.name LIKE :search", { search: `%${search}%` });
            }
            else if (searchtype === "contract") {
                query = query.andWhere('nft_pool.tokenAddress = :addr', { addr: searchtext.toLowerCase() });
            }
        }
        if (!showall) {
            query = query.andWhere('nft_pool.status = :text', { text: 'Live' });
            query = query.andWhere("nft_pool.batchCount > 0");
            const utcMoment = moment.utc();
            const curTime = utcMoment.valueOf() / 1000;
            query = query.andWhere(new typeorm_2.Brackets(qb => {
                qb.where("nft_pool.endTime = 0")
                    .orWhere("nft_pool.endTime > :curTime", { curTime });
            }));
        }
        const total = await query.getCount();
        const data = await query.skip(offset).take(limit).getMany();
        return {
            total,
            data: data,
        };
    }
    async crawlerHeight() {
        const st = (await this.state.findOne({ key: 'eth_height_1' })) || { key: 'eth_height_1', value: '0' };
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
    async crawlerNFTPool() {
        const st = (await this.state.findOne({ key: 'eth_nft_pool_height' })) || { key: 'eth_nft_pool_height', value: '0' };
        const _height = parseInt(st.value, 10) || 0;
        const height = this.height;
        if (height > _height) {
            await this.nftSwapContract.getLogs(Math.max(_height - 1, 0), height);
            st.value = `${height}`;
            await this.state.save(st);
        }
    }
};
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NFTPoolService.prototype, "crawlerHeight", null);
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NFTPoolService.prototype, "crawlerNFTPool", null);
NFTPoolService = NFTPoolService_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(nftpool_entity_1.NFTPool)),
    __param(1, typeorm_1.InjectRepository(nftpool_entity_1.NftJoinLog)),
    __param(2, typeorm_1.InjectRepository(pool_entity_1.State)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NFTPoolService);
exports.NFTPoolService = NFTPoolService;
//# sourceMappingURL=nftpool.service.js.map