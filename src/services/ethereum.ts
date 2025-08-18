import axios from 'axios';

// USDC Contract Address on Ethereum  
const USDC_CONTRACT_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48';
// Free Ethereum RPC endpoint (you can replace with your preferred RPC)
const ETHEREUM_RPC_URL = 'https://eth.llamarpc.com';

// USDC has 6 decimal places
const USDC_DECIMALS = 6;

/**
 * Fetch USDC balance for a given Ethereum address
 * @param address - The Ethereum address to check USDC balance for
 * @returns Promise<number> - USDC balance in USD (human readable format)
 */
export const fetchUSDCBalance = async (address: string): Promise<number> => {
  try {
    // ERC-20 balanceOf function signature
    const methodId = '0x70a08231'; // balanceOf(address)
    
    // Encode the address parameter (remove 0x prefix and pad to 64 chars)
    const encodedAddress = address.replace('0x', '').padStart(64, '0');
    
    // Construct the data payload
    const data = methodId + encodedAddress;

    const response = await axios.post(ETHEREUM_RPC_URL, {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: USDC_CONTRACT_ADDRESS,
          data: data
        },
        'latest'
      ],
      id: 1
    });

    if (response.data.error) {
      throw new Error(`RPC Error: ${response.data.error.message}`);
    }

    // Parse the hex result and convert from wei to USDC
    const hexBalance = response.data.result;
    const balance = parseInt(hexBalance, 16);
    
    // Convert from USDC smallest unit to actual USDC (divide by 10^6)
    const usdcBalance = balance / Math.pow(10, USDC_DECIMALS);
    
    return usdcBalance;
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    throw new Error('Failed to fetch USDC balance');
  }
};

/**
 * Fetch combined Almanak TVL (DeFiLlama + USDC balance)
 * @param targetAddress - The Ethereum address to check USDC balance for
 * @returns Promise<number> - Combined TVL in USD
 */
export const fetchCombinedAlmanakTvl = async (targetAddress: string): Promise<number> => {
  try {
    // Fetch both DeFiLlama TVL and USDC balance in parallel
    const [defiLlamaTvl, usdcBalance] = await Promise.all([
      fetchDefiLlamaTvl(),
      fetchUSDCBalance(targetAddress)
    ]);

    return defiLlamaTvl + usdcBalance;
  } catch (error) {
    console.error('Error fetching combined Almanak TVL:', error);
    throw new Error('Failed to fetch combined TVL');
  }
};

/**
 * Fetch TVL from DeFiLlama API
 * @returns Promise<number> - TVL in USD
 */
const fetchDefiLlamaTvl = async (): Promise<number> => {
  try {
    const response = await axios.get('https://api.llama.fi/tvl/almanak');
    return response.data;
  } catch (error) {
    console.error('Error fetching DeFiLlama TVL:', error);
    return 0; // Return 0 as fallback
  }
};
