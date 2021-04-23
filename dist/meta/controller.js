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
var MetaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const service_1 = require("./service");
let MetaController = MetaController_1 = class MetaController {
    constructor(service) {
        this.service = service;
        this.logger = new common_1.Logger(MetaController_1.name);
    }
    checkAPIKEY(key) {
        return key === 'bswap';
    }
    async getOfficialAddress() {
        return this.service.getAddress();
    }
    async GetImage(_url) {
        if (!_url)
            return {};
        const res = await axios_1.default.get(_url);
        return res ? res.data : {};
    }
    async getTime() {
        return Date.now();
    }
    async addOficialAddress(data, key) {
        if (this.checkAPIKEY(key)) {
            await this.service.addAddress(data);
            return 'ok';
        }
        return 'bad';
    }
    async delOficialAddress(data, key) {
        if (this.checkAPIKEY(key)) {
            await this.service.delAddress(data);
            return 'ok';
        }
        return 'bad';
    }
};
__decorate([
    common_1.Get('/official-address'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "getOfficialAddress", null);
__decorate([
    common_1.Get('/image'),
    __param(0, common_1.Query('url')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "GetImage", null);
__decorate([
    common_1.Get('/getTime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "getTime", null);
__decorate([
    common_1.Post('/official-address'),
    __param(0, common_1.Body()), __param(1, common_1.Headers('X-API-KEY')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "addOficialAddress", null);
__decorate([
    common_1.Delete('/official-address'),
    __param(0, common_1.Body()), __param(1, common_1.Headers('X-API-KEY')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "delOficialAddress", null);
MetaController = MetaController_1 = __decorate([
    common_1.Controller('/api/v1/meta'),
    __metadata("design:paramtypes", [service_1.MetaService])
], MetaController);
exports.MetaController = MetaController;
//# sourceMappingURL=controller.js.map