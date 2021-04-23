import axios from 'axios';
import config from '../app.config';
import { Req, ReqParams } from './type';
import { parseNum } from '../utils';
import { Log } from '../typings/type';

type Headers = Record<string, string>;

const INFURA_URL = `https://${config.INFURA_NETWORK}.infura.io/v3/${config.INFURA_APP_ID}`;

const fetcher = axios.create({
  baseURL: INFURA_URL,
  timeout: 5000,
});

let reqId = 1;

async function post<T>(method: string, params: ReqParams = [], headers: Headers = {}): Promise<T> {
  const data: Req = {
    jsonrpc: '2.0',
    id: reqId,
    method,
    params,
  };

  const res = await fetcher.post('', data, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    responseType: 'json',
  }).then(res => res.data).catch(e => "");

  return res.result;
}

export async function getBlockNumber(): Promise<number> {
  let blockNumber = "";
  try {
    blockNumber = await post<string>('eth_blockNumber')
  } catch (e) {
    return 0;
  }
  return parseNum(blockNumber);
}

// from to, hex string
export async function getLogs(address: string, fromBlock = "earliest", toBlock = "latest"): Promise<Log[]> {
  return post<Log[]>('eth_getLogs', [{
    address,
    fromBlock,
    toBlock,
  }]);
}

interface _Block {
  number: string;
  timestamp: string;
  hash: string;
}

export interface Block {
  number: number;
  timestamp: number;
  hash: string;
}
export async function getBlockByHash(hash: string): Promise<Block> {
  const block = await post<_Block>('eth_getBlockByHash', [ hash, false ]);

  return {
    number: parseNum(block.number),
    timestamp: parseNum(block.timestamp),
    hash,
  };
}
