"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const erc20_entity_1 = require("./erc20/erc20.entity");
const erc20_module_1 = require("./erc20/erc20.module");
const pool_entity_1 = require("./pool/pool.entity");
const nftpool_entity_1 = require("./nft/nftpool.entity");
const pool_module_1 = require("./pool/pool.module");
const nftpool_module_1 = require("./nft/nftpool.module");
const app_config_1 = __importDefault(require("./app.config"));
const entity_1 = require("./meta/entity");
const module_1 = require("./meta/module");
const app_config_2 = require("./app.config");
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: app_config_1.default.DB.HOST,
                port: app_config_1.default.DB.PORT,
                username: app_config_1.default.DB.USERNAME,
                password: app_config_1.default.DB.PASSPORT,
                database: app_config_2.IS_DEV ? 'rinkeby' : 'ethereum',
                entities: [
                    erc20_entity_1.Erc20Token,
                    pool_entity_1.Pool,
                    pool_entity_1.JoinLog,
                    pool_entity_1.State,
                    entity_1.OfficialAddress,
                    nftpool_entity_1.NFTPool,
                    nftpool_entity_1.NftJoinLog
                ],
                synchronize: true,
                retryDelay: 1000,
            }),
            erc20_module_1.Erc20Module,
            pool_module_1.PoolModule,
            module_1.MetaModule,
            nftpool_module_1.NFTPoolModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map