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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolController = void 0;
const common_1 = require("@nestjs/common");
const pool_service_1 = require("./pool.service");
const utils_1 = require("../utils");
let PoolController = class PoolController {
    constructor(service) {
        this.service = service;
    }
    async getPublicPools(type, status, _offset, _limit) {
        const { offset, limit } = utils_1.parseOffsetLimit(_offset, _limit);
        return this.service.findPublicPools(type, status, offset, limit);
    }
    async getPrivatePools(status, _offset, _limit) {
        const { offset, limit } = utils_1.parseOffsetLimit(_offset, _limit);
        return this.service.findPrivatePools(status, offset, limit);
    }
    async getMimePools(address, _offset, _limit) {
        const { offset, limit } = utils_1.parseOffsetLimit(_offset, _limit);
        return this.service.findPoolsByMaker(address, offset, limit);
    }
    async getMimeJoinPools(address, _offset, _limit) {
        const { offset, limit } = utils_1.parseOffsetLimit(_offset, _limit);
        return this.service.findJoinsByTaker(address, offset, limit);
    }
    async getJoinPools(address, type, status, _offset, _limit) {
        const { offset, limit } = utils_1.parseOffsetLimit(_offset, _limit);
        return this.service.findJoinedPoolsByTaker(address, type, status, offset, limit);
    }
    async getPoolsById(_poolId) {
        const pool = await this.service.findPool(_poolId);
        return pool || {};
    }
    async getPoolByTxHash(_txHash) {
        const pool = await this.service.findPoolByTxHash(_txHash);
        return pool || {};
    }
    async getJoinByTxHash(_txHash) {
        const join = await this.service.findJoinByTxHash(_txHash);
        return join || {};
    }
    async getPoolsByTracker(tracker) {
        return this.service.findPoolsByTracker(tracker);
    }
    async getPoolsByTrackerName(trackerSymbol) {
        return this.service.findPoolsByTrackerSymbol(trackerSymbol);
    }
};
__decorate([
    common_1.Get('/public-pools'),
    __param(0, common_1.Query('type')),
    __param(1, common_1.Query('status')),
    __param(2, common_1.Query('offset')),
    __param(3, common_1.Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPublicPools", null);
__decorate([
    common_1.Get('/private-pools'),
    __param(0, common_1.Query('status')),
    __param(1, common_1.Query('offset')),
    __param(2, common_1.Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPrivatePools", null);
__decorate([
    common_1.Get('/mime-pools'),
    __param(0, common_1.Query('address')),
    __param(1, common_1.Query('offset')),
    __param(2, common_1.Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getMimePools", null);
__decorate([
    common_1.Get('/mime-join-pools'),
    __param(0, common_1.Query('address')), __param(1, common_1.Query('offset')), __param(2, common_1.Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getMimeJoinPools", null);
__decorate([
    common_1.Get('/join-pools/:address'),
    __param(0, common_1.Param('address')),
    __param(1, common_1.Query('type')),
    __param(2, common_1.Query('status')),
    __param(3, common_1.Query('offset')),
    __param(4, common_1.Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getJoinPools", null);
__decorate([
    common_1.Get('/pool/:poolId'),
    __param(0, common_1.Param('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolsById", null);
__decorate([
    common_1.Get('/pool-tx/:txHash'),
    __param(0, common_1.Param('txHash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolByTxHash", null);
__decorate([
    common_1.Get('/join-tx/:txHash'),
    __param(0, common_1.Param('txHash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getJoinByTxHash", null);
__decorate([
    common_1.Get('/pools-tracker/:tracker'),
    __param(0, common_1.Param('tracker')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolsByTracker", null);
__decorate([
    common_1.Get('/pools-tracker-symbol/:trackerSymbol'),
    __param(0, common_1.Param('trackerSymbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolsByTrackerName", null);
PoolController = __decorate([
    common_1.Controller('/api/v1/pool'),
    __metadata("design:paramtypes", [pool_service_1.PoolService])
], PoolController);
exports.PoolController = PoolController;
//# sourceMappingURL=pool.controller.js.map