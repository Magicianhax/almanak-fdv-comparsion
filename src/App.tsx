import React, { useState, useEffect, useCallback } from 'react';
import { fetchTokenData } from './services/coingecko';
import { fetchUSDCBalance } from './services/ethereum';
import { fetchPulseTvlData } from './services/pulse';
import { ComparisonData, GizaTvlData } from './types';
import ComparisonCard from './components/ComparisonCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [data, setData] = useState<ComparisonData>({
    gizaToken: null,
    newtonToken: null,
    almanakSupply: 1000000000, // 1 billion tokens default
    csnapperAllocation: 0.5, // 0.5% allocation
    csnapperAllocationValue: 0,
    pointProgramTokens: 483333, // 483,333 tokens default
    pointProgramAllocation: 0.048333, // 0.048333% allocation (483,333 / 1,000,000,000 * 100)
    pointProgramAllocationValue: 0,
    // Point Program Phases
    phase1PointsPerDay: 150000, // 150,000 points per day
    phase1TotalPoints: 4650000, // 4,650,000 total points
    phase1TotalValue: 0,
    phase2PointsPerDay: 333333, // 333,333 points per day
    phase2TotalPoints: 12987000, // 12,987,000 total points
    phase2TotalValue: 0,
    loading: true,
    error: null
  });

  const [customPoints, setCustomPoints] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'basic' | 'tvl' | 'bonus'>('basic');
  const [almanakTvl, setAlmanakTvl] = useState<number>(0);
  const [almanakDefiLlamaTvl, setAlmanakDefiLlamaTvl] = useState<number>(0);
  const [almanakUsdcBalance, setAlmanakUsdcBalance] = useState<number>(0);
  const [gizaTvlData, setGizaTvlData] = useState<GizaTvlData>({
    armaTvl: 0,
    pulseTvlEth: 0,
    pulseTvlUsd: 0,
    totalTvl: 16389772, // Default fallback value
    ethPrice: 0
  });
  const [tvlLoading, setTvlLoading] = useState<boolean>(false);

  // Handle URL routing for tabs
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'basic' || hash === 'tvl' || hash === 'bonus') {
      setActiveTab(hash);
    } else {
      // Set default tab and update URL
      setActiveTab('basic');
      window.location.hash = 'basic';
    }
  }, []);

  const handleTabChange = (tab: 'basic' | 'tvl' | 'bonus') => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Bonus calculator state
  const [bonusInputs, setBonusInputs] = useState({
    assumedFdv: 0, // in millions USD
    userDeposit: 0, // in USD
    currentTvl: 0 // in USD (full value, not millions)
  });

  // Calculate bonus APR based on Phase 2 points
  const calculateBonusApr = () => {
    if (bonusInputs.currentTvl <= 0 || bonusInputs.userDeposit <= 0 || bonusInputs.assumedFdv <= 0) {
      return 0;
    }
    
    // Phase 2 points per day: 333,333
    // Total Phase 2 points: 12,987,000
    // Calculate points value based on FDV
    const pointsValuePerDay = (data.phase2PointsPerDay * bonusInputs.assumedFdv * 1000000) / data.almanakSupply;
    
    // Calculate user's share of points based on their deposit vs total TVL
    const userShareOfPoints = (bonusInputs.userDeposit / bonusInputs.currentTvl) * pointsValuePerDay;
    
    // Calculate APR: (daily value * 365 / user deposit) * 100
    const apr = (userShareOfPoints * 365 / bonusInputs.userDeposit) * 100;
    
    return apr;
  };

  // Calculate yearly bonus in USD
  const calculateYearlyBonus = () => {
    const apr = calculateBonusApr();
    return (bonusInputs.userDeposit * apr) / 100;
  };

  const fetchTokenDataForComparison = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch both Giza and Newton data
      const [gizaToken, newtonToken] = await Promise.all([
        fetchTokenData('giza'),
        fetchTokenData('newton-protocol')
      ]);
      
      // Calculate allocation values based on Giza FDV (as reference)
      const csnapperAllocationValue = (gizaToken.fully_diluted_valuation * data.csnapperAllocation) / 100;
      const pointProgramAllocationValue = (gizaToken.fully_diluted_valuation * data.pointProgramAllocation) / 100;
      
      // Calculate point program phase values based on Giza FDV
      const phase1TotalValue = (gizaToken.fully_diluted_valuation * data.phase1TotalPoints) / data.almanakSupply;
      const phase2TotalValue = (gizaToken.fully_diluted_valuation * data.phase2TotalPoints) / data.almanakSupply;
      
      setData(prev => ({
        ...prev,
        gizaToken,
        newtonToken,
        csnapperAllocationValue,
        pointProgramAllocationValue,
        phase1TotalValue,
        phase2TotalValue,
        loading: false
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch token data. Please try again.'
      }));
    }
  }, [data.csnapperAllocation, data.pointProgramAllocation, data.phase1TotalPoints, data.phase2TotalPoints, data.almanakSupply]);

  const fetchAlmanakTvl = useCallback(async () => {
    try {
      // Target address for USDC balance
      const targetAddress = '0x6402D60bEE5e67226F19CFD08A1734586e6c3954';
      
      // Fetch DeFiLlama TVL and USDC balance separately for transparency
      const [defiLlamaTvl, usdcBalance] = await Promise.all([
        fetch('https://api.llama.fi/tvl/almanak').then(res => res.json()).catch(() => 0),
        fetchUSDCBalance(targetAddress).catch(() => 0)
      ]);
      
      // Set individual components
      setAlmanakDefiLlamaTvl(defiLlamaTvl);
      setAlmanakUsdcBalance(usdcBalance);
      
      // Set combined TVL
      const combinedTvl = defiLlamaTvl + usdcBalance;
      setAlmanakTvl(combinedTvl);
    } catch (error) {
      console.error('Failed to fetch Almanak TVL:', error);
      setAlmanakTvl(0);
      setAlmanakDefiLlamaTvl(0);
      setAlmanakUsdcBalance(0);
    }
  }, []);

  const fetchGizaTvl = useCallback(async () => {
    try {
      setTvlLoading(true);
      const backendUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';
      
      // Fetch both Arma and Pulse TVL data in parallel
      const [armaResponse, pulseData] = await Promise.all([
        fetch(`${backendUrl}/api/arma/stats`).then(res => res.json()).catch(() => ({ total_balance: 0 })),
        fetchPulseTvlData().catch(() => ({ tvlEth: 0, tvlUsd: 0, ethPrice: 0 }))
      ]);

      const armaTvl = armaResponse.total_balance || 0;
      const totalTvl = armaTvl + pulseData.tvlUsd;

      setGizaTvlData({
        armaTvl,
        pulseTvlEth: pulseData.tvlEth,
        pulseTvlUsd: pulseData.tvlUsd,
        totalTvl,
        ethPrice: pulseData.ethPrice
      });
    } catch (error) {
      console.error('Failed to fetch Giza TVL data:', error);
      // Keep the default fallback values
    } finally {
      setTvlLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenDataForComparison();
    fetchAlmanakTvl();
    fetchGizaTvl();
  }, [fetchTokenDataForComparison, fetchAlmanakTvl, fetchGizaTvl]);

  const handleCustomPointsChange = (newPoints: number) => {
    setCustomPoints(newPoints);
  };

  const calculateCustomPointsValue = (fdv: number) => {
    return (fdv * customPoints) / data.almanakSupply;
  };



  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorDisplay error={data.error} onRetry={fetchTokenDataForComparison} />
      </div>
    );
  }

  if (!data.gizaToken || !data.newtonToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-800 text-lg font-semibold">No token data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Almanak vs Giza vs Newton FDV Comparison
          </h1>
          <p className="text-gray-700 text-lg">
            Compare the Fully Diluted Valuation of Almanak token with Giza and Newton Protocol
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-green-200 shadow-lg">
            <div className="flex space-x-1">
              <button
                onClick={() => handleTabChange('basic')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'basic'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => handleTabChange('tvl')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'tvl'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                TVL Based
              </button>
              <button
                onClick={() => handleTabChange('bonus')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'bonus'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Bonus
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'basic' && (
          <>
            {/* Custom Points Input */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-green-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Calculate Custom Points Value</h2>
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <label className="block text-gray-800 font-semibold mb-2 text-center">
                    Enter Your Points
                  </label>
                  <input
                    type="number"
                    value={customPoints}
                    onChange={(e) => handleCustomPointsChange(Number(e.target.value))}
                    className="w-full p-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-center text-lg"
                    placeholder="Enter points amount"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Calculate the value of your points at both Giza and Newton FDVs
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="mb-8">
              <ComparisonCard
                gizaToken={data.gizaToken}
                newtonToken={data.newtonToken}
                almanakSupply={data.almanakSupply}
                csnapperAllocation={data.csnapperAllocation}
                csnapperAllocationValue={data.csnapperAllocationValue}
                pointProgramTokens={data.pointProgramTokens}
                pointProgramAllocation={data.pointProgramAllocation}
                pointProgramAllocationValue={data.pointProgramAllocationValue}
                phase1PointsPerDay={data.phase1PointsPerDay}
                phase1TotalPoints={data.phase1TotalPoints}
                phase1TotalValue={data.phase1TotalValue}
                phase2PointsPerDay={data.phase2PointsPerDay}
                phase2TotalPoints={data.phase2TotalPoints}
                phase2TotalValue={data.phase2TotalValue}
                customPoints={customPoints}
                calculateCustomPointsValue={calculateCustomPointsValue}
                isTvlBased={false}
                gizaTvl={gizaTvlData.totalTvl}
                almanakTvl={almanakTvl}
                tvlLoading={tvlLoading}
              />
            </div>
          </>
        )}

        {activeTab === 'tvl' && (
          <div className="mb-8">

            {/* Custom Points Input for TVL */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-green-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Calculate Your Points Value (TVL Based)</h2>
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <label className="block text-gray-800 font-semibold mb-2 text-center">
                    Enter Your Points
                  </label>
                  <input
                    type="number"
                    value={customPoints}
                    onChange={(e) => handleCustomPointsChange(Number(e.target.value))}
                    className="w-full p-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-center text-lg"
                    placeholder="Enter points amount"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Calculate the value of your points based on TVL ratio and Giza FDV
                  </p>
                </div>
              </div>
            </div>



            {/* TVL Based Comparison Card */}
            <div className="mb-8">
              <ComparisonCard
                gizaToken={data.gizaToken}
                newtonToken={data.newtonToken}
                almanakSupply={data.almanakSupply}
                csnapperAllocation={data.csnapperAllocation}
                csnapperAllocationValue={data.csnapperAllocationValue}
                pointProgramTokens={data.pointProgramTokens}
                pointProgramAllocation={data.pointProgramAllocation}
                pointProgramAllocationValue={data.pointProgramAllocationValue}
                phase1PointsPerDay={data.phase1PointsPerDay}
                phase1TotalPoints={data.phase1TotalPoints}
                phase1TotalValue={data.phase1TotalValue}
                phase2PointsPerDay={data.phase2PointsPerDay}
                phase2TotalPoints={data.phase2TotalPoints}
                phase2TotalValue={data.phase2TotalValue}
                customPoints={customPoints}
                calculateCustomPointsValue={calculateCustomPointsValue}
                isTvlBased={true}
                gizaTvl={gizaTvlData.totalTvl}
                almanakTvl={almanakTvl}
                tvlLoading={tvlLoading}
              />
            </div>

            {/* Additional TVL Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Almanak vs Giza TVL & Token Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Giza TVL Breakdown */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 text-center">Giza Total TVL: ${gizaTvlData.totalTvl.toLocaleString()}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Arma TVL:</span>
                        <span className="font-semibold">${gizaTvlData.armaTvl.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Pulse TVL (USD):</span>
                        <span className="font-semibold">${gizaTvlData.pulseTvlUsd.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Pulse TVL (ETH):</span>
                        <span className="font-semibold">{gizaTvlData.pulseTvlEth.toFixed(2)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">ETH Price:</span>
                        <span className="font-semibold">${gizaTvlData.ethPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Almanak TVL Breakdown */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2 text-center">Almanak Total TVL: ${almanakTvl.toLocaleString()}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">DeFiLlama TVL:</span>
                        <span className="font-semibold">${almanakDefiLlamaTvl.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">USDC Balance:</span>
                        <span className="font-semibold">${almanakUsdcBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TVL Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 text-center">TVL Ratio</h4>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {almanakTvl > 0 ? (almanakTvl / gizaTvlData.totalTvl).toFixed(2) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Almanak/Giza</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 text-center">TVL Difference</h4>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ${(almanakTvl - gizaTvlData.totalTvl).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Almanak - Giza</p>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2 text-center">Percentage</h4>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {almanakTvl > 0 ? ((almanakTvl / gizaTvlData.totalTvl) * 100).toFixed(1) : 'N/A'}%
                    </p>
                    <p className="text-sm text-gray-600">of Giza TVL</p>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2 text-center">Almanak TVL-based</h4>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Projected FDV</p>
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 text-center">Giza FDV</h4>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      ${(data.gizaToken?.fully_diluted_valuation || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Current FDV</p>
                  </div>
                </div>
              </div>

              {/* Almanak Token Details Based on TVL Ratio */}
              <div className="space-y-6 mb-6">
                {/* CSNapper Allocation */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-900 mb-3 text-center">CSNapper Allocation (TVL Based)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h6 className="font-semibold text-purple-800 mb-2 text-center">Based on TVL Ratio</h6>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Allocation %:</span>
                          <span className="font-semibold text-gray-900">{data.csnapperAllocation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Tokens:</span>
                          <span className="font-semibold text-gray-900">{((data.almanakSupply * data.csnapperAllocation) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Value at TVL Ratio:</span>
                          <span className="font-semibold text-green-600">
                            ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl) * data.csnapperAllocation / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h6 className="font-semibold text-purple-800 mb-2 text-center">Based on Giza FDV</h6>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Allocation %:</span>
                          <span className="font-semibold text-gray-900">{data.csnapperAllocation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Tokens:</span>
                          <span className="font-semibold text-gray-900">{((data.almanakSupply * data.csnapperAllocation) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Value at Giza FDV:</span>
                          <span className="font-semibold text-green-600">
                            ${((data.gizaToken?.fully_diluted_valuation || 0) * data.csnapperAllocation / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point Program Phases */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h5 className="font-semibold text-indigo-900 mb-3 text-center">Point Program Phases (TVL Based)</h5>
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded border border-indigo-100">
                      <h6 className="font-semibold text-indigo-800 mb-2 text-center">Phase 1</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div>
                           <div className="font-semibold text-indigo-700 mb-1 block text-center">Based on TVL Ratio</div>
                           <div className="space-y-1 text-sm">
                             <div className="flex justify-between">
                               <span className="text-indigo-700">Points/Day:</span>
                               <span className="font-semibold text-gray-900">{data.phase1PointsPerDay.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-indigo-700">Total Points:</span>
                               <span className="font-semibold text-gray-900">{data.phase1TotalPoints.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-indigo-700">Total Value:</span>
                               <span className="font-semibold text-green-600">
                                 ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl) * data.phase1TotalPoints / data.almanakSupply).toLocaleString()}
                               </span>
                             </div>
                           </div>
                         </div>
                         <div>
                           <div className="font-semibold text-indigo-700 mb-1 block text-center">Based on Giza FDV</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-indigo-700">Points/Day:</span>
                              <span className="font-semibold text-gray-900">{data.phase1PointsPerDay.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-indigo-700">Total Points:</span>
                              <span className="font-semibold text-gray-900">{data.phase1TotalPoints.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-indigo-700">Total Value:</span>
                              <span className="font-semibold text-green-600">
                                ${((data.gizaToken?.fully_diluted_valuation || 0) * data.phase1TotalPoints / data.almanakSupply).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-indigo-100">
                      <h6 className="font-semibold text-indigo-800 mb-2 text-center">Phase 2</h6>
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <div className="font-semibold text-indigo-700 mb-1 block text-center">Based on TVL Ratio</div>
                           <div className="space-y-1 text-sm">
                             <div className="flex justify-between">
                               <span className="text-indigo-700">Points/Day:</span>
                               <span className="font-semibold text-gray-900">{data.phase2PointsPerDay.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-indigo-700">Total Points:</span>
                               <span className="font-semibold text-gray-900">{data.phase2TotalPoints.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-indigo-700">Total Value:</span>
                               <span className="font-semibold text-green-600">
                                 ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl) * data.phase2TotalPoints / data.almanakSupply).toLocaleString()}
                               </span>
                             </div>
                           </div>
                         </div>
                         <div>
                           <div className="font-semibold text-indigo-700 mb-1 block text-center">Based on Giza FDV</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-indigo-700">Points/Day:</span>
                              <span className="font-semibold text-gray-900">{data.phase2PointsPerDay.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-indigo-700">Total Points:</span>
                              <span className="font-semibold text-gray-900">{data.phase2TotalPoints.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-indigo-700">Total Value:</span>
                              <span className="font-semibold text-green-600">
                                ${((data.gizaToken?.fully_diluted_valuation || 0) * data.phase2TotalPoints / data.almanakSupply).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">TVL & Token Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">Giza TVL: <strong className="text-green-600">${gizaTvlData.totalTvl.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">Almanak TVL: <strong className="text-blue-600">${almanakTvl.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">├─ DeFiLlama: <strong className="text-cyan-600">${almanakDefiLlamaTvl.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">└─ USDC Balance: <strong className="text-purple-600">${almanakUsdcBalance.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">TVL Ratio: <strong className="text-purple-600">{almanakTvl > 0 ? (almanakTvl / gizaTvlData.totalTvl).toFixed(2) : 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">Almanak is <strong className="text-orange-600">{almanakTvl > gizaTvlData.totalTvl ? 'higher' : 'lower'}</strong> than Giza TVL</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">CSNapper Value (TVL): <strong className="text-indigo-600">
                      ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl) * data.csnapperAllocation / 100).toLocaleString()}
                    </strong></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-gray-800">Phase 1 Value (TVL): <strong className="text-yellow-600">
                      ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl) * data.phase1TotalPoints / data.almanakSupply).toLocaleString()}
                    </strong></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                    <span className="text-gray-800">Phase 2 Value (TVL): <strong className="text-yellow-600">
                      ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl) * data.phase2TotalPoints / data.almanakSupply).toLocaleString()}
                    </strong></span>
                  </div>
                  {customPoints > 0 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-800">Your Points Value (TVL): <strong className="text-red-600">
                        ${((data.gizaToken?.fully_diluted_valuation || 0) * (almanakTvl / gizaTvlData.totalTvl) * customPoints / data.almanakSupply).toLocaleString()}
                      </strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

                 {activeTab === 'bonus' && (
           <div className="mb-8">
             {/* Calculator Inputs */}
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-green-200 shadow-lg">
               <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ALMANAK BONUS APR CALCULATOR</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-gray-800 font-semibold mb-2">
                     Assumed FDV Value (Millions USD)
                   </label>
                   <div className="flex items-center">
                     <input
                       type="number"
                       value={bonusInputs.assumedFdv}
                       onChange={(e) => setBonusInputs(prev => ({ ...prev, assumedFdv: Number(e.target.value) }))}
                       className="flex-1 p-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-center text-lg"
                       placeholder="Enter FDV in millions"
                     />
                     <span className="ml-2 text-gray-600 font-semibold">M USD</span>
                   </div>
                 </div>
                 <div>
                   <label className="block text-gray-800 font-semibold mb-2">
                     Your deposit in Almanak Vaults (USD)
                   </label>
                   <div className="flex items-center">
                     <input
                       type="number"
                       value={bonusInputs.userDeposit}
                       onChange={(e) => setBonusInputs(prev => ({ ...prev, userDeposit: Number(e.target.value) }))}
                       className="flex-1 p-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-center text-lg"
                       placeholder="Enter deposit amount"
                     />
                     <span className="ml-2 text-gray-600 font-semibold">USD</span>
                   </div>
                 </div>
                 <div>
                   <label className="block text-gray-800 font-semibold mb-2">
                     Current Almanak TVL (USD)
                   </label>
                   <div className="flex items-center">
                     <input
                       type="number"
                       value={bonusInputs.currentTvl}
                       onChange={(e) => setBonusInputs(prev => ({ ...prev, currentTvl: Number(e.target.value) }))}
                       className="flex-1 p-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-center text-lg"
                       placeholder="Enter TVL (e.g., 24157038)"
                     />
                     <span className="ml-2 text-gray-600 font-semibold">USD</span>
                   </div>
                 </div>
               </div>
             </div>

             {/* Calculated Results */}
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-green-200 shadow-lg">
               <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Calculated Results</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="text-center">
                   <h3 className="text-xl font-bold text-gray-900 mb-4">Bonus APR</h3>
                   <div className="text-4xl font-bold text-green-600 mb-2">
                     {calculateBonusApr().toFixed(2)}%
                   </div>
                   <p className="text-sm text-gray-600">
                     Annual Percentage Rate based on Phase 2 points
                   </p>
                 </div>
                 <div className="text-center">
                   <h3 className="text-xl font-bold text-gray-900 mb-4">Yearly Bonus (USD)</h3>
                   <div className="text-4xl font-bold text-green-600 mb-2">
                     ${calculateYearlyBonus().toFixed(2)}
                   </div>
                   <p className="text-sm text-gray-600">
                     Estimated yearly bonus earnings
                   </p>
                 </div>
               </div>
             </div>

             {/* Phase 2 Points Information */}
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-green-200 shadow-lg">
               <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Phase 2 Points Information</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="text-center">
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Points Per Day</h3>
                   <div className="text-2xl font-bold text-purple-600">
                     {data.phase2PointsPerDay.toLocaleString()}
                   </div>
                   <p className="text-sm text-gray-600">Daily point distribution</p>
                 </div>
                 <div className="text-center">
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Total Phase 2 Points</h3>
                   <div className="text-2xl font-bold text-purple-600">
                     {data.phase2TotalPoints.toLocaleString()}
                   </div>
                   <p className="text-sm text-gray-600">Total points in Phase 2</p>
                 </div>
                 <div className="text-center">
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Points Value (Daily)</h3>
                   <div className="text-2xl font-bold text-purple-600">
                     ${bonusInputs.assumedFdv > 0 ? ((data.phase2PointsPerDay * bonusInputs.assumedFdv * 1000000) / data.almanakSupply).toFixed(2) : '0.00'}
                   </div>
                   <p className="text-sm text-gray-600">Daily points value at assumed FDV</p>
                 </div>
               </div>
             </div>

             
           </div>
         )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Data provided by CoinGecko API & DefiLlama API</p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
