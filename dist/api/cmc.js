"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthPrice = void 0;
const axios_1 = __importDefault(require("axios"));
const app_config_1 = __importDefault(require("../app.config"));
async function getEthPrice() {
    const res = await axios_1.default.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH&convert=USD', {
        headers: {
            'X-CMC_PRO_API_KEY': app_config_1.default.CMC_KEY,
        },
    }).catch((e) => {
        return {
            data: null
        };
    });
    const { data } = res.data;
    if (data === null)
        return "0";
    return data.ETH.quote.USD.price;
}
exports.getEthPrice = getEthPrice;
//# sourceMappingURL=cmc.js.map