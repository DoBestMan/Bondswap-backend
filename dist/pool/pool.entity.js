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
exports.State = exports.JoinLog = exports.Pool = void 0;
const typeorm_1 = require("typeorm");
const type_1 = require("../typings/type");
let Pool = class Pool {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Pool.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Pool.prototype, "poolId", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
        charset: 'utf8mb4',
    }),
    __metadata("design:type", String)
], Pool.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Pool.prototype, "maker", void 0);
__decorate([
    typeorm_1.Column({
        default: false,
    }),
    __metadata("design:type", Boolean)
], Pool.prototype, "priv", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Pool.prototype, "tracker", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "leftAmount", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "takerAmount", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "makerAmount", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "rate", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "units", void 0);
__decorate([
    typeorm_1.Column({
        default: false,
    }),
    __metadata("design:type", Boolean)
], Pool.prototype, "closed", void 0);
__decorate([
    typeorm_1.Column({
        unique: true
    }),
    __metadata("design:type", String)
], Pool.prototype, "txHash", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "blockHash", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Pool.prototype, "endTime", void 0);
__decorate([
    typeorm_1.Column({
        length: 1500,
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "extra", void 0);
__decorate([
    typeorm_1.Column({
        default: false,
    }),
    __metadata("design:type", Boolean)
], Pool.prototype, "isFloat", void 0);
__decorate([
    typeorm_1.Column({
        default: 'Live',
    }),
    __metadata("design:type", String)
], Pool.prototype, "status", void 0);
__decorate([
    typeorm_1.Column({
        default: 0,
    }),
    __metadata("design:type", Number)
], Pool.prototype, "createAt", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], Pool.prototype, "contract", void 0);
Pool = __decorate([
    typeorm_1.Entity(),
    typeorm_1.Index('tracker_dex', ['tracker']),
    typeorm_1.Index('poolId', ['poolId'])
], Pool);
exports.Pool = Pool;
let JoinLog = class JoinLog {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], JoinLog.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], JoinLog.prototype, "poolId", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JoinLog.prototype, "taker", void 0);
__decorate([
    typeorm_1.Column({
        default: false,
    }),
    __metadata("design:type", Boolean)
], JoinLog.prototype, "priv", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JoinLog.prototype, "ethAmount", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], JoinLog.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JoinLog.prototype, "tracker", void 0);
__decorate([
    typeorm_1.Column({
        unique: true
    }),
    __metadata("design:type", String)
], JoinLog.prototype, "txHash", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], JoinLog.prototype, "blockHash", void 0);
__decorate([
    typeorm_1.Column({
        default: false,
    }),
    __metadata("design:type", Boolean)
], JoinLog.prototype, "isFloat", void 0);
__decorate([
    typeorm_1.Column({
        default: 0,
    }),
    __metadata("design:type", Number)
], JoinLog.prototype, "createAt", void 0);
__decorate([
    typeorm_1.Column({
        default: '',
    }),
    __metadata("design:type", String)
], JoinLog.prototype, "contract", void 0);
JoinLog = __decorate([
    typeorm_1.Entity(),
    typeorm_1.Index('tracker_dex', ['tracker']),
    typeorm_1.Index('poolId', ['poolId']),
    typeorm_1.Index('taker', ['taker'])
], JoinLog);
exports.JoinLog = JoinLog;
let State = class State {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], State.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        unique: true,
    }),
    __metadata("design:type", String)
], State.prototype, "key", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], State.prototype, "value", void 0);
State = __decorate([
    typeorm_1.Entity()
], State);
exports.State = State;
//# sourceMappingURL=pool.entity.js.map