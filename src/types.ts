export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  fully_diluted_valuation: number;
  total_supply: number;
  max_supply: number;
  circulating_supply: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  image: string;
}

export interface ComparisonData {
  gizaToken: TokenData | null;
  newtonToken: TokenData | null;
  almanakSupply: number;
  csnapperAllocation: number;
  csnapperAllocationValue: number;
  pointProgramTokens: number;
  pointProgramAllocation: number;
  pointProgramAllocationValue: number;
  // Point Program Phases
  phase1PointsPerDay: number;
  phase1TotalPoints: number;
  phase1TotalValue: number;
  phase2PointsPerDay: number;
  phase2TotalPoints: number;
  phase2TotalValue: number;
  loading: boolean;
  error: string | null;
}

export interface GizaTvlData {
  armaTvl: number;
  pulseTvlEth: number;
  pulseTvlUsd: number;
  totalTvl: number;
  ethPrice: number;
}

export interface CoinGeckoResponse {
  data: TokenData[];
}


