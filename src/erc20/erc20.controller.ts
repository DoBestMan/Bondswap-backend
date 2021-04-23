import { Controller, Get, Param, Logger } from '@nestjs/common';
import { Erc20Service } from './erc20.service';
import { getEthPrice } from '../api/cmc';
import { IS_DEV } from '../app.config';
import { State } from '../pool/pool.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import fetch from 'node-fetch';

@Controller('/api/v1/erc20')
export class Erc20Controller {
  private readonly logger = new Logger(Erc20Controller.name);

  private uniClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    cache: new InMemoryCache(),
    fetch,
  });

  constructor(private readonly service: Erc20Service,
    @InjectRepository(State)
    private state: Repository<State>
  ) {}

  @Get('/:address')
  async getCoin(@Param('address') address: string) {
    const coin = await this.service.getERC20Token(address);
    return coin || {};
  }

  private lastEthTime = 0;

  private ethPrice = '400';

  private readonly bondlyQL = gql`query pairs($tokenAddress: ID!) {
    pairs(where: { id: $tokenAddress }) {
      token0Price
      token1Price
      totalSupply
      reserveUSD
    }
  }`;

  bondlyResult = {
    price: '',
    totalSupply: 0,
    reserveUSD: 0,
  };

  ethResult = {
    price: '',
    totalSupply: 0,
    reserveUSD: 0,
  };

  bondlyResultTime = 0;
  ethResultTime = 0;

  @Get('/liquid/zom')
  async zomPrice() {
    const now = Date.now();
    if (now - this.bondlyResultTime < 10 * 1000 && this.bondlyResult) {
      return this.bondlyResult;
    }

    try {
      const data = await this.uniClient.query({
        query: this.bondlyQL,
        variables: {
          tokenAddress: "0xdc43e671428b4e7b7848ea92cd8691ac1b80903c"
        },
        fetchPolicy: 'no-cache',
      });

      const pairs = data?.data?.pairs || [];

      const pair = pairs[0];
      if (pair) {
        this.logger.log(`Bondly pair: ${JSON.stringify(pair)}`);
        this.bondlyResultTime = now;
        const bondly = parseFloat(pair.token1Price);
        if (bondly) {
          this.bondlyResult = {
            price: bondly.toFixed(4),
            totalSupply: parseInt(pair.totalSupply, 10),
            reserveUSD: parseFloat(pair.reserveUSD),
          };
        }
      }
    } catch (e) {
      this.logger.error(`failed to get bondly price from uniswap ${e}`);
    }

    return this.bondlyResult;
  }

  @Get('/price/eth')
  async price() {
    const now = Date.now();
    if (now - this.ethResultTime < 10 * 1000 && this.ethResultTime) {
      return this.ethResult.price;
    }

    try {
      const data = await this.uniClient.query({
        query: this.bondlyQL,
        variables: {
          tokenAddress: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"
        },
        fetchPolicy: 'no-cache',
      });

      const pairs = data?.data?.pairs || [];

      const pair = pairs[0];
      if (pair) {
        this.logger.log(`ETH pair: ${JSON.stringify(pair)}`);
        this.ethResultTime = now;
        const eth = parseFloat(pair.token1Price);
        if (eth) {
          this.ethResult = {
            price: eth.toFixed(4),
            totalSupply: parseInt(pair.totalSupply, 10),
            reserveUSD: parseFloat(pair.reserveUSD),
          };
        }
      }
    } catch (e) {
      this.logger.error(`failed to get eth price from uniswap ${e}`);
    }

    return this.ethResult.price;
  }
}
