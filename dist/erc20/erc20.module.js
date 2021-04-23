"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc20Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const erc20_entity_1 = require("./erc20.entity");
const erc20_service_1 = require("./erc20.service");
const erc20_controller_1 = require("./erc20.controller");
const pool_entity_1 = require("../pool/pool.entity");
let Erc20Module = class Erc20Module {
};
Erc20Module = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                erc20_entity_1.Erc20Token,
                pool_entity_1.State,
            ]),
        ],
        providers: [
            erc20_service_1.Erc20Service,
        ],
        controllers: [
            erc20_controller_1.Erc20Controller,
        ],
    })
], Erc20Module);
exports.Erc20Module = Erc20Module;
//# sourceMappingURL=erc20.module.js.map