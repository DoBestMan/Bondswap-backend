import { Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { getLogs } from '../api';
import abi from './fixed-pool-abi';
import { Provider } from '@ethersproject/abstract-provider';
import { FixedPool, JoinLog } from './pool.entity';
// import { Result } from '@ethersproject/abi/lib/coders/abstract-coder';
import { Log } from '../typings/type';

export type CreateEvent = Omit<FixedPool, 'id' | 'isFloat' | 'createAt' | 'status'> & { blockHash: string };

export type JoinEvent = Omit<JoinLog, 'id' | 'isFloat' | 'createAt'> & { leftAmount: string; };

export interface CloseEvent {
  poolId: number;
  priv: boolean;
  txHash: string;
  contract: string;
}

export interface FixedPoolNative {
  name: string;
  maker: string;
  endTime: number;
  enabled: boolean;
  tokenRate: string;
  tokenaddr: string;
  tokenAmount: string;
  units: string;
  onlyHolder: boolean;
}

interface Handler {
  onCreate(event: CreateEvent): Promise<void>;

  onJoin(event: JoinEvent): Promise<void>;

  onClose(event: CloseEvent): Promise<void>;
}

export default class Contract {
  private readonly logger = new Logger('fixed-contract');

  private abi: ethers.utils.Interface;
  private provider: Provider;
  private contract: ethers.Contract;

  constructor(private readonly address: string, private handler: Handler, network: string, appkey: string) {
    this.logger.log(`fixed contract: ${address}`);
    this.abi = new ethers.utils.Interface(abi as any);
    this.provider = new ethers.providers.InfuraProvider(network, appkey);
    this.contract = new ethers.Contract(address, abi, this.provider);
    this.contract.on('CreatePool', this.logCreatePool);
    this.contract.on('Join', this.logJoin);
    this.contract.on('Close', this.logClose);
  }

  // event CreatePool(uint32 indexed id, address indexed maker, bool priv, address tracker, uint256 amount, uint256 rate, uint256 units);
  // event Join(uint32 indexed id, address indexed taker, bool priv, uint256 ethAmount, address tracker, uint256 amount);
  // event Close(uint32 indexed id, bool priv);
  logCreatePool = async (id, maker, priv, tracker, amount, rate, units, event: Log) => {
    let pool: FixedPoolNative;
    let takers = [];
    if (priv) {
      pool = await this.contract.privFixedPools(id);
      takers = await this.contract.privFixedPoolTakers(id);
    } else {
      pool = await this.contract.fixedPools(id);
    }

    const eventCreate: CreateEvent = {
      poolId: id,
      maker: maker,
      priv: priv,
      tracker: tracker,
      amount: amount.toString(),
      rate: rate.toString(),
      units: units.toString(),
      name: pool.name,
      endTime: pool.endTime,
      leftAmount: pool.tokenAmount.toString(),
      txHash: event.transactionHash,
      blockHash: event.blockHash,
      extra: JSON.stringify({ takers }),
      contract: this.address,
    };
    await this.handler.onCreate(eventCreate);
  };

  poolLeftAmount = async (id: number, priv: boolean) => {
    let pool: FixedPoolNative;
    if (priv) {
      pool = await this.contract.privFixedPools(id);
    } else {
      pool = await this.contract.fixedPools(id);
    }
    return pool.tokenAmount.toString();
  };

  logJoin = async (id, taker, priv, ethAmount, tracker, amount, event: Log) => {
    const eventJoin: JoinEvent = {
      poolId: id,
      taker: taker,
      priv: priv,
      ethAmount: ethAmount.toString(),
      tracker: tracker.toString(),
      amount: amount.toString(),
      leftAmount: await this.poolLeftAmount(id, priv),
      txHash: event.transactionHash,
      blockHash: event.blockHash,
      contract: this.address,
    };
    await this.handler.onJoin(eventJoin);
  };

  logClose = async (id, priv, event: Log) => {
    const eventClose: CloseEvent = {
      poolId: id,
      priv: priv,
      txHash: event.transactionHash,
      contract: this.address,
    };
    await this.handler.onClose(eventClose);
  };

  async fixedPool(id: number): Promise<FixedPoolNative | null> {
    return this.contract.fixedPools(id);
  }

  async privPool(id: number): Promise<FixedPoolNative | null> {
    return this.contract.privFixedPools(id);
  }

  async privPoolTakers(id: number): Promise<string[]> {
    return this.contract.privFixedPoolTakers(id);
  }

  async getLogs(fromBlock?: string | number, toBlock?: number | string): Promise<void> {
    if (typeof fromBlock === 'number') {
      fromBlock = ethers.utils.hexValue(fromBlock);
    }

    if (typeof toBlock === 'number') {
      toBlock = ethers.utils.hexValue(toBlock);
    }

    const logs = await getLogs(this.address, fromBlock, toBlock);
    if (logs) {
      this.logger.log(`get ${logs.length} log from ${fromBlock} to ${toBlock}`);
      for (const log of logs) {
        const { name, args } = this.abi.parseLog(log);
        this.logger.log(`log: ${name}, ${args}, ${log.blockNumber}`);
        switch (name) {
          case 'CreatePool':
            await this.logCreatePool(args.id, args.maker, args.priv, args.tracker, args.amount, args.rate, args.units, log);
            break;
          case 'Join':
            await this.logJoin(args.id, args.taker, args.priv, args.ethAmount, args.tracker, args.amount, log);
            break;
          case 'Close':
            await this.logClose(args.id, args.priv, log);
            break;
        }
      }
    }
  }
}
