import axios from 'axios';
import config from '../app.config';

export async function getEthPrice(): Promise<string> {
  const res = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH&convert=USD', {
    headers: {
      'X-CMC_PRO_API_KEY': config.CMC_KEY,
    },
  }).catch((e: any) => {
      return {
        data: null
      };
  } );
  const { data } = res.data;
  if (data === null) return "0";
  return data.ETH.quote.USD.price;
}
