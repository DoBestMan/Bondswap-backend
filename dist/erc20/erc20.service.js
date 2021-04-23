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
var Erc20Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc20Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ethers_1 = require("ethers");
const typeorm_2 = require("typeorm");
const erc20_entity_1 = require("./erc20.entity");
const erc20_abi_1 = __importDefault(require("./erc20-abi"));
const app_config_1 = __importDefault(require("../app.config"));
let Erc20Service = Erc20Service_1 = class Erc20Service {
    constructor(erc20Tokens) {
        this.erc20Tokens = erc20Tokens;
        this.logger = new common_1.Logger(Erc20Service_1.name);
        this.erc20Contracts = {};
        this.erc20TokensCache = {};
        this.logger.log(`Erc20Service init`);
        this.provider = new ethers_1.ethers.providers.InfuraProvider(app_config_1.default.INFURA_NETWORK, app_config_1.default.INFURA_APP_ID);
    }
    async getERC20Token(tracker) {
        tracker = tracker.toLowerCase();
        if (this.erc20TokensCache[tracker]) {
            return this.erc20TokensCache[tracker];
        }
        const erc20 = await this.erc20Tokens.findOne({ tracker });
        if (erc20) {
            this.erc20TokensCache[tracker] = erc20;
            return erc20;
        }
        let erc20Contract = this.erc20Contracts[tracker];
        if (!erc20Contract) {
            erc20Contract = new ethers_1.ethers.Contract(tracker, erc20_abi_1.default, this.provider);
            this.erc20Contracts[tracker] = erc20Contract;
        }
        try {
            const [name, symbol, decimals] = await Promise.all([
                erc20Contract.name(), erc20Contract.symbol(), erc20Contract.decimals(),
            ]);
            const erc20 = {
                name,
                symbol,
                decimals,
                tracker,
            };
            this.erc20TokensCache[tracker] = erc20;
            if (erc20.symbol != null && erc20.decimals != null) {
                try {
                    await this.erc20Tokens.save(erc20);
                }
                catch (err) {
                    this.logger.error(`failed to save erc20 token ${tracker}: ${err}`);
                }
            }
            return erc20;
        }
        catch (err) {
            this.logger.error(`failed to get erc20 from infura: ${err}`);
            return null;
        }
    }
    async getTrakersBySymbol(trackerSymbol) {
        const tokens = await this.erc20Tokens.find({ symbol: trackerSymbol.toLowerCase() });
        if (!tokens || tokens.length === 0) {
            return [];
        }
        return tokens.map(t => t.tracker);
    }
};
Erc20Service = Erc20Service_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(erc20_entity_1.Erc20Token)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], Erc20Service);
exports.Erc20Service = Erc20Service;
//# sourceMappingURL=erc20.service.js.map