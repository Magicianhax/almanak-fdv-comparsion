import axios from 'axios';
import { TokenData } from '../types';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export const fetchTokenData = async (tokenId: string): Promise<TokenData> => {
  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/coins/${tokenId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });

    return {
      id: response.data.id,
      symbol: response.data.symbol.toUpperCase(),
      name: response.data.name,
      current_price: response.data.market_data.current_price.usd,
      market_cap: response.data.market_data.market_cap.usd,
      fully_diluted_valuation: response.data.market_data.fully_diluted_valuation.usd,
      total_supply: response.data.market_data.total_supply,
      max_supply: response.data.market_data.max_supply,
      circulating_supply: response.data.market_data.circulating_supply,
      price_change_percentage_24h: response.data.market_data.price_change_percentage_24h,
      market_cap_rank: response.data.market_data.market_cap_rank,
      image: response.data.image.large
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw new Error('Failed to fetch token data');
  }
};

/**
 * Fetch current ETH price in USD from CoinGecko
 * @returns Promise<number> - ETH price in USD
 */
export const fetchEthPrice = async (): Promise<number> => {
  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/simple/price`, {
      params: {
        ids: 'ethereum',
        vs_currencies: 'usd'
      }
    });
    
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    throw new Error('Failed to fetch ETH price');
  }
};