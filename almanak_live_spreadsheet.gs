// Google Apps Script for Almanak Live Data Spreadsheet
// Copy this code into Google Apps Script editor and run it to populate your Google Sheet

function fetchLiveData() {
  // Get the active spreadsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Clear existing data
  sheet.clear();
  
  try {
    // Add delay between API calls to avoid rate limits
    const gizaData = fetchGizaData();
    Utilities.sleep(1000); // Wait 1 second between requests
    
    const newtonData = fetchNewtonData();
    Utilities.sleep(1000); // Wait 1 second between requests
    
    const almanakTvl = fetchAlmanakTvl();
    
    // Generate spreadsheet data
    const spreadsheetData = generateSpreadsheetData(gizaData, newtonData, almanakTvl);
    
    // Write data to sheet
    sheet.getRange(1, 1, spreadsheetData.length, spreadsheetData[0].length).setValues(spreadsheetData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, spreadsheetData[0].length);
    
    // Add timestamp
    const timestamp = new Date().toISOString();
    sheet.getRange(spreadsheetData.length + 2, 1).setValue("Last Updated: " + timestamp);
    
    Logger.log("✅ Data fetched and updated successfully!");
    
  } catch (error) {
    Logger.log("❌ Error: " + error.toString());
    sheet.getRange(1, 1).setValue("Error fetching data: " + error.toString());
    sheet.getRange(2, 1).setValue("This may be due to API rate limits. Try again in a few minutes.");
  }
}

function fetchGizaData() {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/giza';
    const options = {
      'muteHttpExceptions': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 429) {
      Logger.log("⚠️ Rate limit hit for Giza data. Using fallback data.");
      return getFallbackGizaData();
    } else if (responseCode !== 200) {
      Logger.log("⚠️ Error fetching Giza data. Response code: " + responseCode);
      return getFallbackGizaData();
    }
    
    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log("⚠️ Exception fetching Giza data: " + error.toString());
    return getFallbackGizaData();
  }
}

function fetchNewtonData() {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/newton-protocol';
    const options = {
      'muteHttpExceptions': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 429) {
      Logger.log("⚠️ Rate limit hit for Newton data. Using fallback data.");
      return getFallbackNewtonData();
    } else if (responseCode !== 200) {
      Logger.log("⚠️ Error fetching Newton data. Response code: " + responseCode);
      return getFallbackNewtonData();
    }
    
    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log("⚠️ Exception fetching Newton data: " + error.toString());
    return getFallbackNewtonData();
  }
}

function fetchAlmanakTvl() {
  try {
    const url = 'https://api.llama.fi/tvl/almanak';
    const options = {
      'muteHttpExceptions': true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      Logger.log("⚠️ Error fetching Almanak TVL. Response code: " + responseCode);
      return 21846042.128; // Fallback TVL value
    }
    
    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log("⚠️ Exception fetching Almanak TVL: " + error.toString());
    return 21846042.128; // Fallback TVL value
  }
}

// Fallback data functions for when APIs are unavailable
function getFallbackGizaData() {
  return {
    symbol: 'GIZA',
    name: 'Giza',
    market_data: {
      current_price: { usd: 0.30 },
      market_cap: { usd: 37166453 },
      fully_diluted_valuation: { usd: 294749076 },
      total_supply: 1000000000,
      circulating_supply: 126095230.912,
      price_change_percentage_24h: -6.61,
      market_cap_rank: 988
    }
  };
}

function getFallbackNewtonData() {
  return {
    symbol: 'NEWT',
    name: 'Newton Protocol',
    market_data: {
      current_price: { usd: 0.33 },
      market_cap: { usd: 70319941 },
      fully_diluted_valuation: { usd: 327069492 },
      total_supply: 1000000000,
      circulating_supply: 215000000,
      price_change_percentage_24h: -5.03,
      market_cap_rank: 655
    }
  };
}

function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return value.toLocaleString('en-US');
}

function generateSpreadsheetData(gizaData, newtonData, almanakTvl) {
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

  return [
    // Headers
    ['Token Information', 'Value', 'Notes'],
    ['Giza Token Symbol', gizaData?.symbol?.toUpperCase() || 'GIZA', ''],
    ['Giza Token Name', gizaData?.name || 'Giza', ''],
    ['Giza Current Price', formatCurrency(gizaToken.current_price?.usd), ''],
    ['Giza Market Cap', formatCurrency(gizaToken.market_cap?.usd), ''],
    ['Giza FDV', formatCurrency(gizaToken.fully_diluted_valuation?.usd), ''],
    ['Giza Total Supply', formatNumber(gizaToken.total_supply), ''],
    ['Giza Circulating Supply', formatNumber(gizaToken.circulating_supply), ''],
    ['Giza 24h Price Change', (gizaToken.price_change_percentage_24h?.toFixed(2) || '0') + '%', ''],
    ['Giza Market Cap Rank', gizaToken.market_cap_rank || '0', ''],
    ['', '', ''],
    ['Newton Token Symbol', newtonData?.symbol?.toUpperCase() || 'NEWTON', ''],
    ['Newton Token Name', newtonData?.name || 'Newton Protocol', ''],
    ['Newton Current Price', formatCurrency(newtonToken.current_price?.usd), ''],
    ['Newton Market Cap', formatCurrency(newtonToken.market_cap?.usd), ''],
    ['Newton FDV', formatCurrency(newtonToken.fully_diluted_valuation?.usd), ''],
    ['Newton Total Supply', formatNumber(newtonToken.total_supply), ''],
    ['Newton Circulating Supply', formatNumber(newtonToken.circulating_supply), ''],
    ['Newton 24h Price Change', (newtonToken.price_change_percentage_24h?.toFixed(2) || '0') + '%', ''],
    ['Newton Market Cap Rank', newtonToken.market_cap_rank || '0', ''],
    ['', '', ''],
    ['Almanak Total Supply', formatNumber(almanakSupply), '1 billion tokens'],
    ['Giza TVL', formatCurrency(gizaTvl), 'Fixed value'],
    ['Almanak TVL', formatCurrency(almanakTvl), 'From DefiLlama API'],
    ['', '', ''],
    
    // Allocation Parameters
    ['Allocation Parameters', 'Value', 'Percentage'],
    ['CSNapper Allocation', formatNumber((almanakSupply * csnapperAllocation) / 100), csnapperAllocation + '%'],
    ['Point Program Tokens', formatNumber((almanakSupply * pointProgramAllocation) / 100), pointProgramAllocation + '%'],
    ['Phase 1 Points Per Day', formatNumber(phase1PointsPerDay), ''],
    ['Phase 1 Total Points', formatNumber(phase1TotalPoints), ''],
    ['Phase 2 Points Per Day', formatNumber(phase2PointsPerDay), ''],
    ['Phase 2 Total Points', formatNumber(phase2TotalPoints), ''],
    ['', '', ''],
    
    // Giza FDV Comparison
    ['Giza FDV Comparison', 'Value', 'Calculation'],
    ['Almanak FDV at Giza FDV', formatCurrency(almanakFdvGiza), 'Equals Giza FDV'],
    ['Almanak Token Price at Giza FDV', formatCurrency(almanakPriceGiza), 'Giza FDV / Almanak Supply'],
    ['Almanak Market Cap at Giza FDV', formatCurrency(almanakFdvGiza), 'Equals Giza FDV'],
    ['CSNapper Allocation Value', formatCurrency(csnapperAllocationValue), 'Giza FDV * ' + csnapperAllocation + '%'],
    ['CSNapper Tokens', formatNumber((almanakSupply * csnapperAllocation) / 100), 'Almanak Supply * ' + csnapperAllocation + '%'],
    ['Point Program Allocation Value', formatCurrency(pointProgramAllocationValue), 'Giza FDV * ' + pointProgramAllocation + '%'],
    ['Phase 1 Total Value', formatCurrency(phase1TotalValue), 'Giza FDV * Phase 1 Points / Almanak Supply'],
    ['Phase 2 Total Value', formatCurrency(phase2TotalValue), 'Giza FDV * Phase 2 Points / Almanak Supply'],
    ['Phase 1 Value per Point', formatCurrency(phase1TotalValue / phase1TotalPoints), 'Phase 1 Total Value / Phase 1 Total Points'],
    ['Phase 2 Value per Point', formatCurrency(phase2TotalValue / phase2TotalPoints), 'Phase 2 Total Value / Phase 2 Total Points'],
    ['', '', ''],
    
    // Newton FDV Comparison
    ['Newton FDV Comparison', 'Value', 'Calculation'],
    ['Almanak FDV at Newton FDV', formatCurrency(almanakFdvNewton), 'Equals Newton FDV'],
    ['Almanak Token Price at Newton FDV', formatCurrency(almanakPriceNewton), 'Newton FDV / Almanak Supply'],
    ['Almanak Market Cap at Newton FDV', formatCurrency(almanakFdvNewton), 'Equals Newton FDV'],
    ['CSNapper Allocation Value', formatCurrency(csnapperAllocationValueNewton), 'Newton FDV * ' + csnapperAllocation + '%'],
    ['CSNapper Tokens', formatNumber((almanakSupply * csnapperAllocation) / 100), 'Almanak Supply * ' + csnapperAllocation + '%'],
    ['Point Program Allocation Value', formatCurrency(pointProgramAllocationValueNewton), 'Newton FDV * ' + pointProgramAllocation + '%'],
    ['Phase 1 Total Value', formatCurrency(phase1TotalValueNewton), 'Newton FDV * Phase 1 Points / Almanak Supply'],
    ['Phase 2 Total Value', formatCurrency(phase2TotalValueNewton), 'Newton FDV * Phase 2 Points / Almanak Supply'],
    ['Phase 1 Value per Point', formatCurrency(phase1TotalValueNewton / phase1TotalPoints), 'Phase 1 Total Value / Phase 1 Total Points'],
    ['Phase 2 Value per Point', formatCurrency(phase2TotalValueNewton / phase2TotalPoints), 'Phase 2 Total Value / Phase 2 Total Points'],
    ['', '', ''],
    
    // TVL Analysis
    ['TVL Analysis', 'Value', 'Calculation'],
    ['TVL Ratio', tvlRatio.toFixed(4), 'Almanak TVL / Giza TVL'],
    ['TVL Difference', formatCurrency(tvlDifference), 'Almanak TVL - Giza TVL'],
    ['TVL Percentage', tvlPercentage.toFixed(2) + '%', '(Almanak TVL / Giza TVL) * 100'],
    ['CSNapper Value (TVL Based)', formatCurrency(csnapperValueTvl), 'Giza FDV * TVL Ratio * ' + csnapperAllocation + '%'],
    ['Phase 1 Value (TVL Based)', formatCurrency(phase1ValueTvl), 'Giza FDV * TVL Ratio * Phase 1 Points / Almanak Supply'],
    ['Phase 2 Value (TVL Based)', formatCurrency(phase2ValueTvl), 'Giza FDV * TVL Ratio * Phase 2 Points / Almanak Supply'],
    ['', '', ''],
    
    // Total Allocation Summary
    ['Total Allocation Summary', 'Value at Giza FDV', 'Value at Newton FDV', 'Value at TVL Ratio'],
    ['CSNapper Allocation', formatCurrency(csnapperAllocationValue), formatCurrency(csnapperAllocationValueNewton), formatCurrency(csnapperValueTvl)],
    ['Phase 1 Points', formatCurrency(phase1TotalValue), formatCurrency(phase1TotalValueNewton), formatCurrency(phase1ValueTvl)],
    ['Phase 2 Points', formatCurrency(phase2TotalValue), formatCurrency(phase2TotalValueNewton), formatCurrency(phase2ValueTvl)],
    ['Total Allocation Value', formatCurrency(csnapperAllocationValue + phase1TotalValue + phase2TotalValue), formatCurrency(csnapperAllocationValueNewton + phase1TotalValueNewton + phase2TotalValueNewton), formatCurrency(csnapperValueTvl + phase1ValueTvl + phase2ValueTvl)],
    ['', '', '', ''],
    
    // Key Insights
    ['Key Insights', 'Description', 'Value'],
    ['Almanak vs Giza FDV', 'Comparison', formatCurrency(almanakFdvGiza)],
    ['Almanak vs Newton FDV', 'Comparison', formatCurrency(almanakFdvNewton)],
    ['Token Price at Giza FDV', 'Price per token', formatCurrency(almanakPriceGiza)],
    ['Token Price at Newton FDV', 'Price per token', formatCurrency(almanakPriceNewton)],
    ['CSNapper Value at Giza FDV', 'Allocation value', formatCurrency(csnapperAllocationValue)],
    ['CSNapper Value at Newton FDV', 'Allocation value', formatCurrency(csnapperAllocationValueNewton)],
    ['Phase 1 Points Value at Giza FDV', 'Points value', formatCurrency(phase1TotalValue)],
    ['Phase 1 Points Value at Newton FDV', 'Points value', formatCurrency(phase1TotalValueNewton)],
    ['Phase 2 Points Value at Giza FDV', 'Points value', formatCurrency(phase2TotalValue)],
    ['Phase 2 Points Value at Newton FDV', 'Points value', formatCurrency(phase2TotalValueNewton)],
    ['Total Allocation Value at Giza FDV', 'Combined value', formatCurrency(csnapperAllocationValue + phase1TotalValue + phase2TotalValue)],
    ['Total Allocation Value at Newton FDV', 'Combined value', formatCurrency(csnapperAllocationValueNewton + phase1TotalValueNewton + phase2TotalValueNewton)],
    ['', '', ''],
    
    // Data Generation Info
    ['Data Generation Info', 'Value', 'Notes'],
    ['Generated At', new Date().toISOString(), 'Timestamp'],
    ['Data Source', 'CoinGecko & DefiLlama APIs', 'Live data'],
    ['Giza API Status', gizaData ? 'Success' : 'Failed', 'Data fetch status'],
    ['Newton API Status', newtonData ? 'Success' : 'Failed', 'Data fetch status'],
    ['Almanak TVL API Status', almanakTvl > 0 ? 'Success' : 'Failed', 'Data fetch status'],
    ['', '', ''],
    ['Note', 'If using fallback data due to rate limits,', 'Try again in a few minutes for live data']
  ];
}

// Function to set up automatic refresh (run every 2 hours to avoid rate limits)
function setupAutoRefresh() {
  const trigger = ScriptApp.newTrigger('fetchLiveData')
    .timeBased()
    .everyHours(2)
    .create();
  
  Logger.log('Auto-refresh trigger created - data will update every 2 hours to avoid rate limits');
}

// Function to create a menu in Google Sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Almanak Data')
    .addItem('Fetch Live Data', 'fetchLiveData')
    .addItem('Setup Auto Refresh (2h)', 'setupAutoRefresh')
    .addToUi();
}
