"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockByHash = exports.getLogs = exports.getBlockNumber = void 0;
const axios_1 = __importDefault(require("axios"));
const app_config_1 = __importDefault(require("../app.config"));
const utils_1 = require("../utils");
const INFURA_URL = `https://${app_config_1.default.INFURA_NETWORK}.infura.io/v3/${app_config_1.default.INFURA_APP_ID}`;
const fetcher = axios_1.default.create({
    baseURL: INFURA_URL,
    timeout: 5000,
});
let reqId = 1;
async function post(method, params = [], headers = {}) {
    const data = {
        jsonrpc: '2.0',
        id: reqId,
        method,
        params,
    };
    const res = await fetcher.post('', data, {
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        responseType: 'json',
    }).then(res => res.data).catch(e => "");
    return res.result;
}
async function getBlockNumber() {
    let blockNumber = "";
    try {
        blockNumber = await post('eth_blockNumber');
    }
    catch (e) {
        return 0;
    }
    return utils_1.parseNum(blockNumber);
}
exports.getBlockNumber = getBlockNumber;
async function getLogs(address, fromBlock = "earliest", toBlock = "latest") {
    return post('eth_getLogs', [{
            address,
            fromBlock,
            toBlock,
        }]);
}
exports.getLogs = getLogs;
async function getBlockByHash(hash) {
    const block = await post('eth_getBlockByHash', [hash, false]);
    return {
        number: utils_1.parseNum(block.number),
        timestamp: utils_1.parseNum(block.timestamp),
        hash,
    };
}
exports.getBlockByHash = getBlockByHash;
//# sourceMappingURL=index.js.map