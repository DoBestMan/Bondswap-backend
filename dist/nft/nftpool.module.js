"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTPoolModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const nftpool_entity_1 = require("./nftpool.entity");
const pool_entity_1 = require("../pool/pool.entity");
const nftpool_service_1 = require("./nftpool.service");
const nftpool_controller_1 = require("./nftpool.controller");
let NFTPoolModule = class NFTPoolModule {
};
NFTPoolModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                nftpool_entity_1.NFTPool,
                nftpool_entity_1.NftJoinLog,
                pool_entity_1.State,
            ]),
        ],
        providers: [
            nftpool_service_1.NFTPoolService
        ],
        controllers: [
            nftpool_controller_1.NFTPoolController
        ],
    })
], NFTPoolModule);
exports.NFTPoolModule = NFTPoolModule;
//# sourceMappingURL=nftpool.module.js.map