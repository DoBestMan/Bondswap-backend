"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nows = exports.parseOffsetLimit = exports.between = exports.parseNum = void 0;
function parseNum(hex) {
    if (hex && hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
    return parseInt(hex, 16);
}
exports.parseNum = parseNum;
function between(num, min, max) {
    num = num * 1;
    if (isNaN(num))
        return min;
    if (num < min)
        return min;
    if (max && num > max)
        return max;
    return num;
}
exports.between = between;
function parseOffsetLimit(_offset, _limit) {
    return {
        offset: between(parseInt(_offset, 10), 0),
        limit: between(parseInt(_limit, 10), 0, 20),
    };
}
exports.parseOffsetLimit = parseOffsetLimit;
function nows() {
    return Math.floor(Date.now() / 1000);
}
exports.nows = nows;
//# sourceMappingURL=utils.js.map