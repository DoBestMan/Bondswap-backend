import { Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { getLogs } from '../api';
import abi from './float-pool-abi';
import { Provider } from '@ethersproject/abstract-provider';
import { FloatPool, JoinLog } from './pool.entity';
// import { Result } from '@ethersproject/abi/lib/coders/abstract-coder';
import { Log } from '../typings/type';

export type CreateEvent = Omit<FloatPool, 'id' | 'isFloat' | 'createAt' | 'status'> & { blockHash: string; };
export type JoinEvent = Omit<JoinLog, 'id' | 'priv' | 'isFloat' | 'createAt' | 'amount'>;

interface Handler {
  onCreate(event: CreateEvent): Promise<void>;
  onJoin(event: JoinEvent): Promise<void>;
}

export interface FloatPoolNative {
  name: string;
  maker: string;
  endTime: number;
  enabled: boolean;
  tokenaddr: string;
  tokenAmount: string;
  takerAmountTotal: string;
  makerReceiveTotal: string;
  onlyHolder: boolean;
}

export default class Contract {
  private readonly logger = new Logger('float-contract');

  private abi: ethers.utils.Interface;
  private provider: Provider;
  private contract: ethers.Contract;

  constructor(private readonly address: string, private handler: Handler, network: string, appkey: string) {
    this.logger.log(`float contract: ${address}`);
    this.abi = new ethers.utils.Interface(abi as any);
    this.provider = new ethers.providers.InfuraProvider(network, appkey);
    this.contract = new ethers.Contract(address, abi, this.provider);
    this.contract.on('CreatePool', this.logCreatePool);
    this.contract.on('Join', this.logJoin);
  }

  // event CreatePool(uint32 indexed id, address indexed maker, bool priv, address tracker, uint256 amount, uint256 rate, uint256 units);
  // event Join(uint32 indexed id, address indexed taker, bool priv, uint256 ethAmount, address tracker, uint256 amount);
  // event Close(uint32 indexed id, bool priv);
  logCreatePool = async (id, maker, priv, tracker, amount, rate, units, event: Log) => {
    const pool: FloatPoolNative = await this.pool(id);
    const eventCreate: CreateEvent = {
      poolId: id,
      maker,
      tracker,
      amount: amount.toString(),
      name: pool.name,
      endTime: pool.endTime,
      txHash: event.transactionHash,
      takerAmount: pool.takerAmountTotal.toString(),
      makerAmount: pool.makerReceiveTotal.toString(),
      blockHash: event.blockHash,
      contract: this.address,
    };

    await this.handler.onCreate(eventCreate);
  };

  logJoin = async (id, taker, priv, ethAmount, tracker, amount, event: Log) => {
    const eventJoin: JoinEvent = {
      poolId: id,
      taker,
      ethAmount: ethAmount.toString(),
      tracker: tracker.toString(),
      txHash: event.transactionHash,
      blockHash: event.blockHash,
      contract: this.address,
    };

    await this.handler.onJoin(eventJoin);
  };

  async pool(id: number): Promise<FloatPoolNative | null> {
    return this.contract.bidPools(id);
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
          try {
            const { name, args } = this.abi.parseLog(log);
            this.logger.log(`log: ${name}, ${args}`);
            switch (name) {
              case 'CreatePool':
                await this.logCreatePool(args.id, args.maker, args.priv, args.tracker, args.amount, args.rate, args.units, log);
                break;
              case 'Join':
                await this.logJoin(args.id, args.taker, args.priv, args.ethAmount, args.tracker, args.amount, log);
                break;
            }
          } catch (err) {
            this.logger.error(`failed to parse log: ${err}`);
          }
        }
      }
    }
}
