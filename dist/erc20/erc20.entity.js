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
exports.Erc20Token = void 0;
const typeorm_1 = require("typeorm");
let Erc20Token = class Erc20Token {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Erc20Token.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        unique: true,
    }),
    __metadata("design:type", String)
], Erc20Token.prototype, "tracker", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Erc20Token.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Erc20Token.prototype, "symbol", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Erc20Token.prototype, "decimals", void 0);
Erc20Token = __decorate([
    typeorm_1.Entity()
], Erc20Token);
exports.Erc20Token = Erc20Token;
//# sourceMappingURL=erc20.entity.js.map