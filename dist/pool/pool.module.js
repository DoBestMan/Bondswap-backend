"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pool_entity_1 = require("./pool.entity");
const pool_controller_1 = require("./pool.controller");
const pool_service_1 = require("./pool.service");
const erc20_service_1 = require("../erc20/erc20.service");
const erc20_entity_1 = require("../erc20/erc20.entity");
let PoolModule = class PoolModule {
};
PoolModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                pool_entity_1.Pool,
                erc20_entity_1.Erc20Token,
                pool_entity_1.JoinLog,
                pool_entity_1.State,
            ]),
        ],
        providers: [
            pool_service_1.PoolService,
            erc20_service_1.Erc20Service,
        ],
        controllers: [
            pool_controller_1.PoolController
        ],
    })
], PoolModule);
exports.PoolModule = PoolModule;
//# sourceMappingURL=pool.module.js.map