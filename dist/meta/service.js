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
var MetaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entity_1 = require("./entity");
let MetaService = MetaService_1 = class MetaService {
    constructor(address) {
        this.address = address;
        this.logger = new common_1.Logger(MetaService_1.name);
    }
    async addAddress(address) {
        for (let i = 0; i < address.length; i++) {
            try {
                await this.address.save({
                    address: address[i],
                });
            }
            catch (e) {
                this.logger.error(`failed to add official-address: ${address[i]}`);
            }
        }
    }
    async delAddress(address) {
        for (let i = 0; i < address.length; i++) {
            try {
                await this.address.delete({
                    address: address[i],
                });
            }
            catch (e) {
                this.logger.error(`failed to delete official-address: ${address[i]}`);
            }
        }
    }
    async getAddress() {
        const items = await this.address.find({});
        if (items && items.length > 0) {
            return items.map(item => item.address);
        }
        return [];
    }
};
MetaService = MetaService_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(entity_1.OfficialAddress)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MetaService);
exports.MetaService = MetaService;
//# sourceMappingURL=service.js.map