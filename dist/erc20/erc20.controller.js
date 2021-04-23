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
var Erc20Controller_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc20Controller = void 0;
const common_1 = require("@nestjs/common");
const erc20_service_1 = require("./erc20.service");
const pool_entity_1 = require("../pool/pool.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const apollo_boost_1 = __importDefault(require("apollo-boost"));
const apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const node_fetch_1 = __importDefault(require("node-fetch"));
let Erc20Controller = Erc20Controller_1 = class Erc20Controller {
    constructor(service, state) {
        this.service = service;
        this.state = state;
        this.logger = new common_1.Logger(Erc20Controller_1.name);
        this.uniClient = new apollo_boost_1.default({
            uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
            cache: new apollo_cache_inmemory_1.InMemoryCache(),
            fetch: node_fetch_1.default,
        });
        this.lastEthTime = 0;
        this.ethPrice = '400';
        this.bondlyQL = graphql_tag_1.default `query pairs($tokenAddress: ID!) {
    pairs(where: { id: $tokenAddress }) {
      token0Price
      token1Price
      totalSupply
      reserveUSD
    }
  }`;
        this.bondlyResult = {
            price: '',
            totalSupply: 0,
            reserveUSD: 0,
        };
        this.ethResult = {
            price: '',
            totalSupply: 0,
            reserveUSD: 0,
        };
        this.bondlyResultTime = 0;
        this.ethResultTime = 0;
    }
    async getCoin(address) {
        const coin = await this.service.getERC20Token(address);
        return coin || {};
    }
    async zomPrice() {
        var _a;
        const now = Date.now();
        if (now - this.bondlyResultTime < 10 * 1000 && this.bondlyResult) {
            return this.bondlyResult;
        }
        try {
            const data = await this.uniClient.query({
                query: this.bondlyQL,
                variables: {
                    tokenAddress: "0xdc43e671428b4e7b7848ea92cd8691ac1b80903c"
                },
                fetchPolicy: 'no-cache',
            });
            const pairs = ((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.pairs) || [];
            const pair = pairs[0];
            if (pair) {
                this.logger.log(`Bondly pair: ${JSON.stringify(pair)}`);
                this.bondlyResultTime = now;
                const bondly = parseFloat(pair.token1Price);
                if (bondly) {
                    this.bondlyResult = {
                        price: bondly.toFixed(4),
                        totalSupply: parseInt(pair.totalSupply, 10),
                        reserveUSD: parseFloat(pair.reserveUSD),
                    };
                }
            }
        }
        catch (e) {
            this.logger.error(`failed to get bondly price from uniswap ${e}`);
        }
        return this.bondlyResult;
    }
    async price() {
        var _a;
        const now = Date.now();
        if (now - this.ethResultTime < 10 * 1000 && this.ethResultTime) {
            return this.ethResult.price;
        }
        try {
            const data = await this.uniClient.query({
                query: this.bondlyQL,
                variables: {
                    tokenAddress: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"
                },
                fetchPolicy: 'no-cache',
            });
            const pairs = ((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.pairs) || [];
            const pair = pairs[0];
            if (pair) {
                this.logger.log(`ETH pair: ${JSON.stringify(pair)}`);
                this.ethResultTime = now;
                const eth = parseFloat(pair.token1Price);
                if (eth) {
                    this.ethResult = {
                        price: eth.toFixed(4),
                        totalSupply: parseInt(pair.totalSupply, 10),
                        reserveUSD: parseFloat(pair.reserveUSD),
                    };
                }
            }
        }
        catch (e) {
            this.logger.error(`failed to get eth price from uniswap ${e}`);
        }
        return this.ethResult.price;
    }
};
__decorate([
    common_1.Get('/:address'),
    __param(0, common_1.Param('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Erc20Controller.prototype, "getCoin", null);
__decorate([
    common_1.Get('/liquid/zom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Erc20Controller.prototype, "zomPrice", null);
__decorate([
    common_1.Get('/price/eth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Erc20Controller.prototype, "price", null);
Erc20Controller = Erc20Controller_1 = __decorate([
    common_1.Controller('/api/v1/erc20'),
    __param(1, typeorm_1.InjectRepository(pool_entity_1.State)),
    __metadata("design:paramtypes", [erc20_service_1.Erc20Service,
        typeorm_2.Repository])
], Erc20Controller);
exports.Erc20Controller = Erc20Controller;
//# sourceMappingURL=erc20.controller.js.map