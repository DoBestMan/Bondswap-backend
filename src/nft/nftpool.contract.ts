import { Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { getLogs } from '../api';
import abi from './nftpool-abi';
import { Provider } from '@ethersproject/abstract-provider';
import { IS_DEV } from '../app.config';


const supportTokenList = [
  [
    ["0x8CB813bf27Dc744Fc5Fb6BA7515504de45d39e08", "polkapets tcg"],
    ["0x8280d56ac92b5bff058d60c99932fdecdcc9441a", "bccg hero"],
    ["0xe3782b8688ad2b0d5ba42842d400f7adf310f88d", "bccg2 villian"],
    ["0xD92e44Ac213b9EBda0178E1523cc0cE177b7fA96", "Beeple Everyday"],
    ["0x8F5d3b489EFdaaE6E61d747d616d5DEc75CAFb83", "TBE"],
    ["0xf37e6eBd1cDc07b4D2eD6CB867bEee33534e34DE", "Logan Paul Store"],
    ["0x8A5e616aBd226DB865B99B9d98A4b2d45B3565d3", "DeFi Now"],
    ["0xe4605d46Fd0B3f8329d936a8b258D69276cBa264", "Meme Ltd."],
    ["0xd4e4078ca3495DE5B1d4dB434BEbc5a986197782", "Autoglyphs"],
    ["0x4fe99deb8f0be517c31faaad49b4b054ed28c267", "ChainGuardians"],
    ["0xE3ea3eafE3fc255f3Ebc5b6a2b3345E59e3f2C78", "Pellek"],
    ["0x47dD306909fcD7cD22dFBF2548f7E43a8594b243", "Tory Lanez"],
    ["0x0b509f4b044f713a91bb50535914f7ad160532fe", "Digitalax"],
    ["0x7c40c393dc0f283f318791d746d894ddd3693572", "Wrapped MoonCatsRescue"],
    ["0x31385d3520bCED94f77AaE104b406994D8F2168C", "Bastard Gan PunksV2"],
    ["0x12f28e2106ce8fd8464885b80ea865e98b465149", "Beeple Special Edition"],
    ["0x4690b1eFAb2eA1232fB95a89e175aBd3331b0F62", "Cyber Wonder WOman"],    
  ],
  [
    ["0xc70e9d1d282c02217c944f0230d6ed2d6408bdbc", "bccg"],
    ["0x2d730e7d5c85134a38d835042688a8fa3ff87623", "lootbox"],
    ["0x92b751358148207C3BdF5a6989f372c610075923", "bccg xmas"],
    ["0x4469c4fc07ea287ed31c26367e14c76656058ea6", "polkapet"],
  ]
]

interface Handler {
    onCreate(event): Promise<void>;
    onSwap(event): Promise<void>;
    onClose(event): Promise<void>;
}

export default class Contract {
    private readonly logger = new Logger('nftswap-contract');
    private abi: ethers.utils.Interface;
    private provider: Provider;
    private contract: ethers.Contract;

    constructor(private readonly address: string, private handler: Handler, network: string, appkey: string) {
        this.logger.log(`nftswap contract: ${address}`);
        this.abi = new ethers.utils.Interface(abi as any);
        this.provider = new ethers.providers.InfuraProvider(network, appkey);
        this.contract = new ethers.Contract(address, abi, this.provider);
        this.contract.on('NFTListed', this.logCreateNFTPool);
        this.contract.on('NFTSwapped', this.logNFTSwapped);
        this.contract.on('NFTClosed', this.logNFTClosed);
    }

    logCreateNFTPool = async (args, log) => {
      if (!args.listId) return;
      try {
        const poolId = args.listId.toString(); 
        const isPrivate = await this.contract.isPrivate(poolId);
        const endTime = await this.contract.getEndingTime(poolId);
        let swapType = await this.contract.getSwapType(poolId);
        const token = await this.contract.getOfferingTokens(poolId);
        const amount = await this.contract.getTotalAmount(poolId);
        const tokenAddress = token[1][0].toLowerCase();
        const list = IS_DEV ? supportTokenList[1]: supportTokenList[0];
        let name = '';
        for (let i = 0; i < list.length; i ++) {
          if (list[i][0].toLowerCase() === tokenAddress) {
            name = list[i][1].toLowerCase(); break;
          }
        }
        swapType = parseInt(swapType.toString());
        console.log(swapType)
        const eventCreate = {
            poolId,
            lister: args.lister,
            tokenType: token[0][0],
            tokenAddress,
            tokenId: token[2][0].toString(),
            txHash: log.transactionHash,
            batchCount: amount.toString(),
            isPrivate,
            name,
            status: 'Live',
            endTime: swapType?0:parseInt(endTime.toString()),
            swapType
        }
        await this.handler.onCreate(eventCreate);
      } catch(e) {
        console.log(e);
      }
    }

    logNFTSwapped = async (args, log) => {
      if (!args.listId) return;
      try {
        const poolId = args.listId.toString();
        const count = args.count.toString();
        const eventSwap = {
          poolId,
          count,
          txHash: log.transactionHash
        };
        await this.handler.onSwap(eventSwap);
      } catch(e) {
        console.log(e);
      }
    }

    logNFTClosed = async (args) => {
      try {
        const poolId = args.listId.toString();
        const eventClose = {
          poolId,
        };
        await this.handler.onClose(eventClose);
      } catch(e) {
        console.log(e);
      }
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
              case 'NFTListed':
                await this.logCreateNFTPool(args, log);
                break;
              case 'NFTSwapped':
                await this.logNFTSwapped(args, log);
                break;
              case 'NFTClosed':
                await this.logNFTClosed(args);
            }
          }
        }
    }
}