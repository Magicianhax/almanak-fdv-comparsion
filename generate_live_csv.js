const fs = require('fs');
const https = require('https');

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fetch Giza token data from CoinGecko
async function fetchGizaData() {
  try {
    const response = await makeRequest('https://api.coingecko.com/api/v3/coins/giza');
    return response;
  } catch (error) {
    console.error('Error fetching Giza data:', error);
    return null;
  }
}

// Fetch Newton token data from CoinGecko
async function fetchNewtonData() {
  try {
    const response = await makeRequest('https://api.coingecko.com/api/v3/coins/newton-protocol');
    return response;
  } catch (error) {
    console.error('Error fetching Newton data:', error);
    return null;
  }
}

// Fetch Almanak TVL from DefiLlama
async function fetchAlmanakTvl() {
  try {
    const response = await makeRequest('https://api.llama.fi/tvl/almanak');
    return response;
  } catch (error) {
    console.error('Error fetching Almanak TVL:', error);
    return 0;
  }
}

// Format currency
function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format number
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
}

// Generate CSV content
function generateCSV(gizaData, newtonData, almanakTvl) {
  const almanakSupply = 1000000000; // 1 billion tokens
  const csnapperAllocation = 0.5; // 0.5%
  const pointProgramAllocation = 0.048333; // 0.048333%
  const phase1PointsPerDay = 150000;
  const phase1TotalPoints = 4650000;
  const phase2PointsPerDay = 333333;
  const phase2TotalPoints = 12987000;
  const gizaTvl = 16389772; // Fixed Giza TVL

  // Extract token data
  const gizaToken = gizaData?.market_data || {};
  const newtonToken = newtonData?.market_data || {};

  // Calculate values
  const gizaFdv = gizaToken.fully_diluted_valuation?.usd || 0;
  const newtonFdv = newtonToken.fully_diluted_valuation?.usd || 0;
  
  // Giza FDV calculations
  const almanakFdvGiza = gizaFdv;
  const almanakPriceGiza = gizaFdv / almanakSupply;
  const csnapperAllocationValue = (gizaFdv * csnapperAllocation) / 100;
  const pointProgramAllocationValue = (gizaFdv * pointProgramAllocation) / 100;
  const phase1TotalValue = (gizaFdv * phase1TotalPoints) / almanakSupply;
  const phase2TotalValue = (gizaFdv * phase2TotalPoints) / almanakSupply;

  // Newton FDV calculations
  const almanakFdvNewton = newtonFdv;
  const almanakPriceNewton = newtonFdv / almanakSupply;
  const csnapperAllocationValueNewton = (newtonFdv * csnapperAllocation) / 100;
  const pointProgramAllocationValueNewton = (newtonFdv * pointProgramAllocation) / 100;
  const phase1TotalValueNewton = (newtonFdv * phase1TotalPoints) / almanakSupply;
  const phase2TotalValueNewton = (newtonFdv * phase2TotalPoints) / almanakSupply;

  // TVL calculations
  const tvlRatio = almanakTvl > 0 ? almanakTvl / gizaTvl : 0;
  const tvlDifference = almanakTvl - gizaTvl;
  const tvlPercentage = almanakTvl > 0 ? (almanakTvl / gizaTvl) * 100 : 0;
  const csnapperValueTvl = gizaFdv * tvlRatio * csnapperAllocation / 100;
  const phase1ValueTvl = gizaFdv * tvlRatio * phase1TotalPoints / almanakSupply;
  const phase2ValueTvl = gizaFdv * tvlRatio * phase2TotalPoints / almanakSupply;

  const csvContent = `Token Information,Value,Notes
Giza Token Symbol,${gizaData?.symbol?.toUpperCase() || 'GIZA'},
Giza Token Name,${gizaData?.name || 'Giza'},
Giza Current Price,${formatCurrency(gizaToken.current_price?.usd)},
Giza Market Cap,${formatCurrency(gizaToken.market_cap?.usd)},
Giza FDV,${formatCurrency(gizaToken.fully_diluted_valuation?.usd)},
Giza Total Supply,${formatNumber(gizaToken.total_supply)},
Giza Circulating Supply,${formatNumber(gizaToken.circulating_supply)},
Giza 24h Price Change,${gizaToken.price_change_percentage_24h?.toFixed(2) || '0'}%,
Giza Market Cap Rank,${gizaToken.market_cap_rank || '0'},
Newton Token Symbol,${newtonData?.symbol?.toUpperCase() || 'NEWTON'},
Newton Token Name,${newtonData?.name || 'Newton Protocol'},
Newton Current Price,${formatCurrency(newtonToken.current_price?.usd)},
Newton Market Cap,${formatCurrency(newtonToken.market_cap?.usd)},
Newton FDV,${formatCurrency(newtonToken.fully_diluted_valuation?.usd)},
Newton Total Supply,${formatNumber(newtonToken.total_supply)},
Newton Circulating Supply,${formatNumber(newtonToken.circulating_supply)},
Newton 24h Price Change,${newtonToken.price_change_percentage_24h?.toFixed(2) || '0'}%,
Newton Market Cap Rank,${newtonToken.market_cap_rank || '0'},
Almanak Total Supply,${formatNumber(almanakSupply)},1 billion tokens
Giza TVL,${formatCurrency(gizaTvl)},Fixed value
Almanak TVL,${formatCurrency(almanakTvl)},From DefiLlama API

Allocation Parameters,Value,Percentage,Notes
CSNapper Allocation,${formatNumber((almanakSupply * csnapperAllocation) / 100)},${csnapperAllocation}%,5 million tokens out of 1 billion
Point Program Tokens,${formatNumber((almanakSupply * pointProgramAllocation) / 100)},${pointProgramAllocation}%,483,333 tokens out of 1 billion
Phase 1 Points Per Day,${formatNumber(phase1PointsPerDay)},,150,000 points per day
Phase 1 Total Points,${formatNumber(phase1TotalPoints)},,4,650,000 total points
Phase 2 Points Per Day,${formatNumber(phase2PointsPerDay)},,333,333 points per day
Phase 2 Total Points,${formatNumber(phase2TotalPoints)},,12,987,000 total points

Giza FDV Comparison,Value,Calculation
Almanak FDV at Giza FDV,${formatCurrency(almanakFdvGiza)},Equals Giza FDV
Almanak Token Price at Giza FDV,${formatCurrency(almanakPriceGiza)},Giza FDV / Almanak Supply
Almanak Market Cap at Giza FDV,${formatCurrency(almanakFdvGiza)},Equals Giza FDV
CSNapper Allocation Value,${formatCurrency(csnapperAllocationValue)},Giza FDV * ${csnapperAllocation}%
CSNapper Tokens,${formatNumber((almanakSupply * csnapperAllocation) / 100)},Almanak Supply * ${csnapperAllocation}%
Point Program Allocation Value,${formatCurrency(pointProgramAllocationValue)},Giza FDV * ${pointProgramAllocation}%
Phase 1 Total Value,${formatCurrency(phase1TotalValue)},Giza FDV * Phase 1 Points / Almanak Supply
Phase 2 Total Value,${formatCurrency(phase2TotalValue)},Giza FDV * Phase 2 Points / Almanak Supply
Phase 1 Value per Point,${formatCurrency(phase1TotalValue / phase1TotalPoints)},Phase 1 Total Value / Phase 1 Total Points
Phase 2 Value per Point,${formatCurrency(phase2TotalValue / phase2TotalPoints)},Phase 2 Total Value / Phase 2 Total Points

Newton FDV Comparison,Value,Calculation
Almanak FDV at Newton FDV,${formatCurrency(almanakFdvNewton)},Equals Newton FDV
Almanak Token Price at Newton FDV,${formatCurrency(almanakPriceNewton)},Newton FDV / Almanak Supply
Almanak Market Cap at Newton FDV,${formatCurrency(almanakFdvNewton)},Equals Newton FDV
CSNapper Allocation Value,${formatCurrency(csnapperAllocationValueNewton)},Newton FDV * ${csnapperAllocation}%
CSNapper Tokens,${formatNumber((almanakSupply * csnapperAllocation) / 100)},Almanak Supply * ${csnapperAllocation}%
Point Program Allocation Value,${formatCurrency(pointProgramAllocationValueNewton)},Newton FDV * ${pointProgramAllocation}%
Phase 1 Total Value,${formatCurrency(phase1TotalValueNewton)},Newton FDV * Phase 1 Points / Almanak Supply
Phase 2 Total Value,${formatCurrency(phase2TotalValueNewton)},Newton FDV * Phase 2 Points / Almanak Supply
Phase 1 Value per Point,${formatCurrency(phase1TotalValueNewton / phase1TotalPoints)},Phase 1 Total Value / Phase 1 Total Points
Phase 2 Value per Point,${formatCurrency(phase2TotalValueNewton / phase2TotalPoints)},Phase 2 Total Value / Phase 2 Total Points

TVL Analysis,Value,Calculation
TVL Ratio,${tvlRatio.toFixed(4)},Almanak TVL / Giza TVL
TVL Difference,${formatCurrency(tvlDifference)},Almanak TVL - Giza TVL
TVL Percentage,${tvlPercentage.toFixed(2)}%,(Almanak TVL / Giza TVL) * 100
CSNapper Value (TVL Based),${formatCurrency(csnapperValueTvl)},Giza FDV * TVL Ratio * ${csnapperAllocation}%
Phase 1 Value (TVL Based),${formatCurrency(phase1ValueTvl)},Giza FDV * TVL Ratio * Phase 1 Points / Almanak Supply
Phase 2 Value (TVL Based),${formatCurrency(phase2ValueTvl)},Giza FDV * TVL Ratio * Phase 2 Points / Almanak Supply

Total Allocation Summary,Category,Value at Giza FDV,Value at Newton FDV,Value at TVL Ratio
CSNapper Allocation,${formatCurrency(csnapperAllocationValue)},${formatCurrency(csnapperAllocationValueNewton)},${formatCurrency(csnapperValueTvl)}
Phase 1 Points,${formatCurrency(phase1TotalValue)},${formatCurrency(phase1TotalValueNewton)},${formatCurrency(phase1ValueTvl)}
Phase 2 Points,${formatCurrency(phase2TotalValue)},${formatCurrency(phase2TotalValueNewton)},${formatCurrency(phase2ValueTvl)}
Total Allocation Value,${formatCurrency(csnapperAllocationValue + phase1TotalValue + phase2TotalValue)},${formatCurrency(csnapperAllocationValueNewton + phase1TotalValueNewton + phase2TotalValueNewton)},${formatCurrency(csnapperValueTvl + phase1ValueTvl + phase2ValueTvl)}

Key Insights,Description,Value
Almanak vs Giza FDV,Comparison,${formatCurrency(almanakFdvGiza)}
Almanak vs Newton FDV,Comparison,${formatCurrency(almanakFdvNewton)}
Token Price at Giza FDV,Price per token,${formatCurrency(almanakPriceGiza)}
Token Price at Newton FDV,Price per token,${formatCurrency(almanakPriceNewton)}
CSNapper Value at Giza FDV,Allocation value,${formatCurrency(csnapperAllocationValue)}
CSNapper Value at Newton FDV,Allocation value,${formatCurrency(csnapperAllocationValueNewton)}
Phase 1 Points Value at Giza FDV,Points value,${formatCurrency(phase1TotalValue)}
Phase 1 Points Value at Newton FDV,Points value,${formatCurrency(phase1TotalValueNewton)}
Phase 2 Points Value at Giza FDV,Points value,${formatCurrency(phase2TotalValue)}
Phase 2 Points Value at Newton FDV,Points value,${formatCurrency(phase2TotalValueNewton)}
Total Allocation Value at Giza FDV,Combined value,${formatCurrency(csnapperAllocationValue + phase1TotalValue + phase2TotalValue)}
Total Allocation Value at Newton FDV,Combined value,${formatCurrency(csnapperAllocationValueNewton + phase1TotalValueNewton + phase2TotalValueNewton)}

Data Generation Info,Value,Notes
Generated At,${new Date().toISOString()},Timestamp
Data Source,CoinGecko & DefiLlama APIs,Live data
Giza API Status,${gizaData ? 'Success' : 'Failed'},Data fetch status
Newton API Status,${newtonData ? 'Success' : 'Failed'},Data fetch status
Almanak TVL API Status,${almanakTvl > 0 ? 'Success' : 'Failed'},Data fetch status`;

  return csvContent;
}

// Main function
async function main() {
  console.log('Fetching live data from APIs...');
  
  try {
    // Fetch all data concurrently
    const [gizaData, newtonData, almanakTvl] = await Promise.all([
      fetchGizaData(),
      fetchNewtonData(),
      fetchAlmanakTvl()
    ]);

    console.log('Generating CSV with live data...');
    
    // Generate CSV content
    const csvContent = generateCSV(gizaData, newtonData, almanakTvl);
    
    // Write to file
    fs.writeFileSync('almanak_live_data.csv', csvContent);
    
    console.log('✅ CSV file generated successfully: almanak_live_data.csv');
    console.log(`📊 Data fetched at: ${new Date().toISOString()}`);
    console.log(`💰 Giza FDV: ${gizaData?.market_data?.fully_diluted_valuation?.usd ? '$' + gizaData.market_data.fully_diluted_valuation.usd.toLocaleString() : 'N/A'}`);
    console.log(`💰 Newton FDV: ${newtonData?.market_data?.fully_diluted_valuation?.usd ? '$' + newtonData.market_data.fully_diluted_valuation.usd.toLocaleString() : 'N/A'}`);
    console.log(`📈 Almanak TVL: $${almanakTvl.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error generating CSV:', error);
  }
}

// Run the script
main();
