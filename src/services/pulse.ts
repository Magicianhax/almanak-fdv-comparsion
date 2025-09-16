import axios from 'axios';
import { fetchEthPrice } from './coingecko';

export interface PulseStatsResponse {
  total_balance: string;
  total_deposits: string;
  total_users: number;
  total_transactions: number;
  total_apr: number;
  positions_distribution: Array<{
    chain_id: number;
    balances: Record<string, string>;
  }>;
}

/**
 * Convert wei (18 decimals) to ETH
 * @param weiValue - Value in wei as string
 * @returns number - Value in ETH
 */
const weiToEth = (weiValue: string): number => {
  return parseFloat(weiValue) / Math.pow(10, 18);
};

/**
 * Fetch Pulse API stats and convert ETH values to USD
 * @returns Promise<{ tvlEth: number, tvlUsd: number, ethPrice: number }> - TVL data
 */
export const fetchPulseTvlData = async (): Promise<{ tvlEth: number, tvlUsd: number, ethPrice: number }> => {
  try {
    // Determine backend URL based on environment
    const backendUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';
    
    // Fetch Pulse stats and ETH price in parallel
    const [pulseResponse, ethPrice] = await Promise.all([
      axios.get(`${backendUrl}/api/pulse/stats`),
      fetchEthPrice()
    ]);

    const pulseData: PulseStatsResponse = pulseResponse.data;
    
    // Convert total_balance from wei to ETH
    const tvlEth = weiToEth(pulseData.total_balance);
    
    // Convert ETH to USD
    const tvlUsd = tvlEth * ethPrice;

    return {
      tvlEth,
      tvlUsd,
      ethPrice
    };
  } catch (error) {
    console.error('Error fetching Pulse TVL data:', error);
    throw new Error('Failed to fetch Pulse TVL data');
  }
};

/**
 * Fetch Pulse API stats directly (for debugging)
 * @returns Promise<PulseStatsResponse> - Raw Pulse API response
 */
export const fetchPulseStatsRaw = async (): Promise<PulseStatsResponse> => {
  try {
    const backendUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';
    const response = await axios.get(`${backendUrl}/api/pulse/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching raw Pulse stats:', error);
    throw new Error('Failed to fetch raw Pulse stats');
  }
};
