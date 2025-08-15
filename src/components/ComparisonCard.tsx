import React from 'react';
import { TokenData } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ComparisonCardProps {
  gizaToken: TokenData;
  newtonToken: TokenData;
  almanakSupply: number;
  csnapperAllocation: number;
  csnapperAllocationValue: number;
  pointProgramTokens: number;
  pointProgramAllocation: number;
  pointProgramAllocationValue: number;
  phase1PointsPerDay: number;
  phase1TotalPoints: number;
  phase1TotalValue: number;
  phase2PointsPerDay: number;
  phase2TotalPoints: number;
  phase2TotalValue: number;
  customPoints: number;
  calculateCustomPointsValue: (fdv: number) => number;
  isTvlBased?: boolean;
  // TVL comparison props
  gizaTvl?: number;
  almanakTvl?: number;
  tvlLoading?: boolean;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  gizaToken,
  newtonToken,
  almanakSupply,
  csnapperAllocation,
  csnapperAllocationValue,
  pointProgramTokens,
  pointProgramAllocation,
  pointProgramAllocationValue,
  phase1PointsPerDay,
  phase1TotalPoints,
  phase1TotalValue,
  phase2PointsPerDay,
  phase2TotalPoints,
  phase2TotalValue,
  customPoints,
  calculateCustomPointsValue,
  isTvlBased = false,
  gizaTvl = 0,
  almanakTvl = 0,
  tvlLoading = false
}) => {
  const almanakFdvGiza = gizaToken.fully_diluted_valuation;
  const almanakFdvNewton = newtonToken.fully_diluted_valuation;
  const almanakPriceGiza = almanakFdvGiza / almanakSupply;
  const almanakPriceNewton = almanakFdvNewton / almanakSupply;
  const csnapperTokens = (almanakSupply * csnapperAllocation) / 100;
  const csnapperAllocationValueNewton = (newtonToken.fully_diluted_valuation * csnapperAllocation) / 100;
  const pointProgramAllocationValueNewton = (newtonToken.fully_diluted_valuation * pointProgramAllocation) / 100;
  
  // Calculate point program phase values for Newton FDV
  const phase1TotalValueNewton = (newtonToken.fully_diluted_valuation * phase1TotalPoints) / almanakSupply;
  const phase2TotalValueNewton = (newtonToken.fully_diluted_valuation * phase2TotalPoints) / almanakSupply;

  // Calculate custom points values
  const customPointsValueGiza = calculateCustomPointsValue(almanakFdvGiza);
  const customPointsValueNewton = calculateCustomPointsValue(almanakFdvNewton);

  return (
    <div className="w-full max-w-7xl space-y-8">
      {/* Custom Points - Dedicated Card at Top */}
      {customPoints > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-yellow-900 mb-2">
              Your Custom Points ({isTvlBased ? 'TVL Based' : 'FDV Based'})
            </h3>
            <p className="text-yellow-700 text-lg">
              {isTvlBased ? 'Personal Points Allocation Analysis' : 'Personal Points FDV Analysis'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Points Overview */}
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3 text-center">Points Overview</h4>
              <div className="space-y-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{formatNumber(customPoints)}</div>
                  <div className="text-sm text-yellow-700">Total Points</div>
                </div>
                <div className="border-t border-yellow-200 pt-3">
                  <div className="text-lg font-semibold text-gray-900">Your Allocation</div>
                  <div className="text-sm text-gray-600">
                    {isTvlBased ? 'Based on TVL contribution' : 'Based on FDV contribution'}
                  </div>
                </div>
              </div>
            </div>

            {/* Giza FDV Value */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 text-center">Value at Giza FDV</h4>
              <div className="space-y-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(customPointsValueGiza)}</div>
                  <div className="text-sm text-green-700">Total Value</div>
                </div>
                <div className="border-t border-green-200 pt-3">
                  <div className="text-lg font-semibold text-gray-900">{formatCurrency(customPointsValueGiza / customPoints)}</div>
                  <div className="text-sm text-gray-600">Value per Point</div>
                </div>
                <div className="text-sm text-gray-600">
                  Token Price: {formatCurrency(almanakPriceGiza)}
                </div>
              </div>
            </div>

            {/* TVL Projection Value (only for TVL-based view) */}
            {isTvlBased && (
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3 text-center">Value at TVL Projection</h4>
                <div className="space-y-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency((gizaToken.fully_diluted_valuation * (almanakTvl / gizaTvl) * customPoints / almanakSupply))}
                    </div>
                    <div className="text-sm text-purple-700">Total Value</div>
                  </div>
                  <div className="border-t border-purple-200 pt-3">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency((gizaToken.fully_diluted_valuation * (almanakTvl / gizaTvl) / almanakSupply))}
                    </div>
                    <div className="text-sm text-gray-600">Value per Point</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    TVL Ratio: {(almanakTvl / gizaTvl).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Newton FDV Value (only for basic view) */}
            {!isTvlBased && (
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 text-center">Value at Newton FDV</h4>
                <div className="space-y-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(customPointsValueNewton)}</div>
                    <div className="text-sm text-blue-700">Total Value</div>
                  </div>
                  <div className="border-t border-blue-200 pt-3">
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(customPointsValueNewton / customPoints)}</div>
                    <div className="text-sm text-gray-600">Value per Point</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Token Price: {formatCurrency(almanakPriceNewton)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Summary */}
          <div className="mt-6 bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-3 text-center">Value Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {isTvlBased ? (
                <>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-green-700">Giza FDV Value:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(customPointsValueGiza)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="text-purple-700">TVL Projection Value:</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency((gizaToken.fully_diluted_valuation * (almanakTvl / gizaTvl) * customPoints / almanakSupply))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-yellow-700">Value Difference:</span>
                    <span className={`font-semibold ${customPointsValueGiza > (gizaToken.fully_diluted_valuation * (almanakTvl / gizaTvl) * customPoints / almanakSupply) ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(customPointsValueGiza - (gizaToken.fully_diluted_valuation * (almanakTvl / gizaTvl) * customPoints / almanakSupply)))}
                      {customPointsValueGiza > (gizaToken.fully_diluted_valuation * (almanakTvl / gizaTvl) * customPoints / almanakSupply) ? ' (FDV higher)' : ' (TVL higher)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Average Value:</span>
                    <span className="font-semibold text-gray-600">
                      {formatCurrency((customPointsValueGiza + (gizaToken.fully_diluted_valuation * (almanakTvl / gizaTvl) * customPoints / almanakSupply)) / 2)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-green-700">Giza FDV Value:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(customPointsValueGiza)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-blue-700">Newton FDV Value:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(customPointsValueNewton)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-yellow-700">Value Difference:</span>
                    <span className={`font-semibold ${customPointsValueGiza > customPointsValueNewton ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(customPointsValueGiza - customPointsValueNewton))}
                      {customPointsValueGiza > customPointsValueNewton ? ' (Giza higher)' : ' (Newton higher)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Average Value:</span>
                    <span className="font-semibold text-gray-600">{formatCurrency((customPointsValueGiza + customPointsValueNewton) / 2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

             {/* TVL Comparison Section */}
       {isTvlBased && (gizaTvl > 0 || almanakTvl > 0) && (
         <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-purple-300">
           <div className="text-center mb-6">
             <h3 className="text-3xl font-bold text-purple-900 mb-2">
               TVL Comparison
             </h3>
             <p className="text-purple-700 text-lg">
               Live TVL data comparison between Giza and Almanak
             </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Giza TVL */}
             <div className="bg-white p-4 rounded-lg border border-green-200">
               <h4 className="font-semibold text-green-900 mb-3 text-center">Giza TVL</h4>
               <div className="space-y-3 text-center">
                 <div>
                   <div className="text-2xl font-bold text-green-600">{formatCurrency(gizaTvl)}</div>
                   <div className="text-sm text-green-700">Total TVL</div>
                 </div>
                 <div className="border-t border-green-200 pt-3">
                   <div className="text-lg font-semibold text-gray-900">Live Data</div>
                   <div className="text-sm text-gray-600">
                     From Arma API
                   </div>
                 </div>
               </div>
             </div>

             {/* Almanak TVL */}
             <div className="bg-white p-4 rounded-lg border border-blue-200">
               <h4 className="font-semibold text-blue-900 mb-3 text-center">Almanak TVL</h4>
               <div className="space-y-3 text-center">
                 <div>
                   {tvlLoading ? (
                     <div className="flex items-center justify-center">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                       <span className="ml-2 text-gray-600">Loading...</span>
                     </div>
                   ) : (
                     <>
                       <div className="text-2xl font-bold text-blue-600">{formatCurrency(almanakTvl)}</div>
                       <div className="text-sm text-blue-700">Total TVL</div>
                     </>
                   )}
                 </div>
                 <div className="border-t border-blue-200 pt-3">
                   <div className="text-lg font-semibold text-gray-900">Live Data</div>
                   <div className="text-sm text-gray-600">
                     From DefiLlama API
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* TVL Analysis */}
           <div className="mt-6 bg-white p-4 rounded-lg border border-purple-200">
             <h4 className="font-semibold text-purple-900 mb-3 text-center">TVL Analysis</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
               <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                 <span className="text-green-700">Giza TVL:</span>
                 <span className="font-semibold text-green-600">{formatCurrency(gizaTvl)}</span>
               </div>
               <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                 <span className="text-blue-700">Almanak TVL:</span>
                 <span className="font-semibold text-blue-600">{formatCurrency(almanakTvl)}</span>
               </div>
               <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                 <span className="text-purple-700">TVL Ratio:</span>
                 <span className="font-semibold text-purple-600">
                   {gizaTvl > 0 ? (almanakTvl / gizaTvl).toFixed(4) : 'N/A'}
                 </span>
               </div>
               <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                 <span className="text-yellow-700">TVL Difference:</span>
                 <span className={`font-semibold ${gizaTvl > almanakTvl ? 'text-green-600' : 'text-red-600'}`}>
                   {formatCurrency(Math.abs(gizaTvl - almanakTvl))}
                   {gizaTvl > almanakTvl ? ' (Giza higher)' : ' (Almanak higher)'}
                 </span>
               </div>
               <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                 <span className="text-indigo-700">TVL Percentage:</span>
                 <span className="font-semibold text-indigo-600">
                   {gizaTvl > 0 ? ((almanakTvl / gizaTvl) * 100).toFixed(2) : 'N/A'}%
                 </span>
               </div>
               <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                 <span className="text-gray-700">Average TVL:</span>
                 <span className="font-semibold text-gray-600">{formatCurrency((gizaTvl + almanakTvl) / 2)}</span>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* Comparison Cards Grid - Only show when not TVL based */}
      {!isTvlBased && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Giza Comparison Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Almanak vs Giza Comparison
              </h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Giza FDV: {formatCurrency(gizaToken.fully_diluted_valuation)}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Giza Price: {formatCurrency(gizaToken.current_price)}</span>
                </div>
              </div>
            </div>

            {/* Almanak at Giza FDV */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <h4 className="font-semibold text-green-900 mb-3 text-center">Almanak at Giza FDV</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Supply:</span>
                    <span className="font-semibold text-gray-900">{formatNumber(almanakSupply)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">FDV:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(almanakFdvGiza)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Token Price:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(almanakPriceGiza)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Market Cap:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(almanakFdvGiza)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocations at Giza FDV */}
            <div className="space-y-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-2">CSNapper Allocation</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Allocation %:</span>
                      <span className="font-semibold text-gray-900">{csnapperAllocation}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Tokens:</span>
                      <span className="font-semibold text-gray-900">{formatNumber(csnapperTokens)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(csnapperAllocationValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Price per Token:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(almanakPriceGiza)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point Program Phases */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-indigo-900 mb-3 text-center">Point Program Phases</h5>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-indigo-100">
                    <h6 className="font-semibold text-indigo-800 mb-2">Phase 1</h6>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Points/Day:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase1PointsPerDay)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Points:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase1TotalPoints)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Value:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(phase1TotalValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Value/Point:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(phase1TotalValue / phase1TotalPoints)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-indigo-100">
                    <h6 className="font-semibold text-indigo-800 mb-2">Phase 2</h6>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Points/Day:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase2PointsPerDay)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Points:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase2TotalPoints)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Value:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(phase2TotalValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Value/Point:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(phase2TotalValue / phase2TotalPoints)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">Key Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">Almanak FDV: <strong className="text-green-600">{formatCurrency(almanakFdvGiza)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">Token Price: <strong className="text-green-600">{formatCurrency(almanakPriceGiza)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">CSNapper Value: <strong className="text-purple-600">{formatCurrency(csnapperAllocationValue)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">Phase 1 Points Value: <strong className="text-indigo-600">{formatCurrency(phase1TotalValue)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                  <span className="text-gray-800">Phase 2 Points Value: <strong className="text-indigo-600">{formatCurrency(phase2TotalValue)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  <span className="text-gray-800">Total Allocation Value: <strong className="text-green-600">{formatCurrency(csnapperAllocationValue + phase1TotalValue + phase2TotalValue)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Newton Comparison Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Almanak vs Newton Comparison
              </h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Newton FDV: {formatCurrency(newtonToken.fully_diluted_valuation)}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Newton Price: {formatCurrency(newtonToken.current_price)}</span>
                </div>
              </div>
            </div>

            {/* Almanak at Newton FDV */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3 text-center">Almanak at Newton FDV</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Supply:</span>
                    <span className="font-semibold text-gray-900">{formatNumber(almanakSupply)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">FDV:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(almanakFdvNewton)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Token Price:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(almanakPriceNewton)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Market Cap:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(almanakFdvNewton)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocations at Newton FDV */}
            <div className="space-y-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-2">CSNapper Allocation</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Allocation %:</span>
                      <span className="font-semibold text-gray-900">{csnapperAllocation}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Tokens:</span>
                      <span className="font-semibold text-gray-900">{formatNumber(csnapperTokens)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Value:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(csnapperAllocationValueNewton)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Price per Token:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(almanakPriceNewton)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point Program Phases */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-indigo-900 mb-3 text-center">Point Program Phases</h5>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-indigo-100">
                    <h6 className="font-semibold text-indigo-800 mb-2">Phase 1</h6>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Points/Day:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase1PointsPerDay)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Points:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase1TotalPoints)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Value:</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(phase1TotalValueNewton)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Value/Point:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(phase1TotalValueNewton / phase1TotalPoints)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-indigo-100">
                    <h6 className="font-semibold text-indigo-800 mb-2">Phase 2</h6>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Points/Day:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase2PointsPerDay)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Points:</span>
                          <span className="font-semibold text-gray-900">{formatNumber(phase2TotalPoints)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Total Value:</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(phase2TotalValueNewton)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Value/Point:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(phase2TotalValueNewton / phase2TotalPoints)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">Key Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">Almanak FDV: <strong className="text-blue-600">{formatCurrency(almanakFdvNewton)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">Token Price: <strong className="text-blue-600">{formatCurrency(almanakPriceNewton)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">CSNapper Value: <strong className="text-purple-600">{formatCurrency(csnapperAllocationValueNewton)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span className="text-gray-800">Phase 1 Points Value: <strong className="text-indigo-600">{formatCurrency(phase1TotalValueNewton)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                  <span className="text-gray-800">Phase 2 Points Value: <strong className="text-indigo-600">{formatCurrency(phase2TotalValueNewton)}</strong></span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-800">Total Allocation Value: <strong className="text-blue-600">{formatCurrency(csnapperAllocationValueNewton + phase1TotalValueNewton + phase2TotalValueNewton)}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonCard;
