"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "aggregatorAddr",
                "type": "address"
            }
        ],
        "name": "getLatestMarketPrice",
        "outputs": [
            {
                "internalType": "int256",
                "name": "",
                "type": "int256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_aggregators",
                "type": "address[]"
            }
        ],
        "name": "priceOfBatch",
        "outputs": [
            {
                "internalType": "int256[]",
                "name": "",
                "type": "int256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
//# sourceMappingURL=market-price.abi.js.map