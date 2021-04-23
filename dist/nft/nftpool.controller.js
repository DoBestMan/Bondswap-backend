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
exports.NFTPoolController = void 0;
const common_1 = require("@nestjs/common");
const nftpool_service_1 = require("./nftpool.service");
const utils_1 = require("../utils");
let NFTPoolController = class NFTPoolController {
    constructor(service) {
        this.service = service;
    }
    async getNFTPoolByTxHash(_txHash) {
        const pool = await this.service.findNFTPoolByTxHash(_txHash);
        return pool || {};
    }
    async getNFTPoolById(_id) {
        const pool = await this.service.findNFTPoolById(_id);
        return pool || {};
    }
    async getPublicPools(_offset, _limit, _swaptype, _addr, _searchtype, _searchtext, _showall) {
        const { offset, limit } = utils_1.parseOffsetLimit(_offset, _limit);
        return this.service.findPools(offset, limit, parseInt(_swaptype), _addr, _searchtype, _searchtext, parseInt(_showall));
    }
};
__decorate([
    common_1.Get('/pool-tx/:txHash'),
    __param(0, common_1.Param('txHash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NFTPoolController.prototype, "getNFTPoolByTxHash", null);
__decorate([
    common_1.Get('/pool-id/:id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NFTPoolController.prototype, "getNFTPoolById", null);
__decorate([
    common_1.Get('/nft-pools'),
    __param(0, common_1.Query('offset')),
    __param(1, common_1.Query('limit')),
    __param(2, common_1.Query('swaptype')),
    __param(3, common_1.Query('addr')),
    __param(4, common_1.Query('searchtype')),
    __param(5, common_1.Query('searchtext')),
    __param(6, common_1.Query('showall')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], NFTPoolController.prototype, "getPublicPools", null);
NFTPoolController = __decorate([
    common_1.Controller('/api/v1/nftpool'),
    __metadata("design:paramtypes", [nftpool_service_1.NFTPoolService])
], NFTPoolController);
exports.NFTPoolController = NFTPoolController;
//# sourceMappingURL=nftpool.controller.js.map