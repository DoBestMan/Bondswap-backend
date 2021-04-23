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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NftJoinLog = exports.NFTPool = void 0;
const typeorm_1 = require("typeorm");
let NFTPool = class NFTPool {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], NFTPool.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NFTPool.prototype, "poolId", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], NFTPool.prototype, "lister", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NFTPool.prototype, "tokenType", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], NFTPool.prototype, "tokenAddress", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NFTPool.prototype, "tokenId", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NFTPool.prototype, "batchCount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], NFTPool.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({
        unique: true,
    }),
    __metadata("design:type", String)
], NFTPool.prototype, "txHash", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], NFTPool.prototype, "isPrivate", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], NFTPool.prototype, "status", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NFTPool.prototype, "endTime", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NFTPool.prototype, "swapType", void 0);
NFTPool = __decorate([
    typeorm_1.Entity(),
    typeorm_1.Index('poolId', ['poolId'])
], NFTPool);
exports.NFTPool = NFTPool;
let NftJoinLog = class NftJoinLog {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], NftJoinLog.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NftJoinLog.prototype, "poolId", void 0);
__decorate([
    typeorm_1.Column({
        unique: true,
    }),
    __metadata("design:type", String)
], NftJoinLog.prototype, "txHash", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], NftJoinLog.prototype, "count", void 0);
NftJoinLog = __decorate([
    typeorm_1.Entity(),
    typeorm_1.Index('poolId', ['poolId']),
    typeorm_1.Index('txHash', ['txHash'])
], NftJoinLog);
exports.NftJoinLog = NftJoinLog;
//# sourceMappingURL=nftpool.entity.js.map