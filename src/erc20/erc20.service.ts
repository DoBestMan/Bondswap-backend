import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import { Repository } from 'typeorm';
import { Provider } from '@ethersproject/abstract-provider';
import { Erc20Token, Erc20DTO } from './erc20.entity';
import abi from './erc20-abi';
import config from '../app.config';

@Injectable()
export class Erc20Service {
  private readonly logger = new Logger(Erc20Service.name);

  private erc20Contracts: Record<string, ethers.Contract> = {};
  private erc20TokensCache: Record<string, Erc20DTO> = {};

  provider: Provider;

  constructor(
    @InjectRepository(Erc20Token)
    private erc20Tokens: Repository<Erc20Token>,
  ) {
    this.logger.log(`Erc20Service init`);
    this.provider = new ethers.providers.InfuraProvider(config.INFURA_NETWORK, config.INFURA_APP_ID);
  }

  async getERC20Token(tracker: string): Promise<Erc20DTO | null> {
    tracker = tracker.toLowerCase();

    if (this.erc20TokensCache[tracker]) {
      return this.erc20TokensCache[tracker];
    }

    const erc20 = await this.erc20Tokens.findOne({ tracker });
    if (erc20) {
      this.erc20TokensCache[tracker] = erc20;
      return erc20;
    }

    let erc20Contract = this.erc20Contracts[tracker];
    if (!erc20Contract) {
      erc20Contract = new ethers.Contract(tracker, abi, this.provider);
      this.erc20Contracts[tracker] = erc20Contract;
    }

    try {
      const [name, symbol, decimals] = await Promise.all([
        erc20Contract.name(), erc20Contract.symbol(), erc20Contract.decimals(),
      ]);

      const erc20 = {
        name,
        symbol,
        decimals,
        tracker,
      };

      this.erc20TokensCache[tracker] = erc20;

      if (erc20.symbol != null && erc20.decimals != null) {
        try {
          await this.erc20Tokens.save(erc20);
        } catch (err) {
          this.logger.error(`failed to save erc20 token ${tracker}: ${err}`);
        }
      }

      return erc20;
    } catch (err) {
      this.logger.error(`failed to get erc20 from infura: ${err}`);
      return null;
    }
  }

  async getTrakersBySymbol(trackerSymbol: string): Promise<string[]> {
    const tokens = await this.erc20Tokens.find({ symbol: trackerSymbol.toLowerCase() });
    if (!tokens || tokens.length === 0) {
      return [];
    }

    return tokens.map(t => t.tracker);
  }

  // async addPoolTrackerDetail<T extends { tracker: string; }>(pool: T): Promise<T & { trackerName: string; trackerSymbol: string; trackerDecimals: number; }> {
  //   const tracker = pool.tracker;
  //   const erc20 = await this.getERC20Token(tracker);
  //   if (erc20) {
  //     return {
  //       ...pool,
  //       trackerName: erc20.name,
  //       trackerSymbol: erc20.symbol,
  //       trackerDecimals: erc20.decimals,
  //     };
  //   }
  // }
}
