import React from 'react';
import { TokenData } from '../types';
import { formatCurrency, formatNumber, formatPrice, formatPercentage } from '../utils/formatters';

interface TokenCardProps {
  token: TokenData;
  title: string;
  className?: string;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, title, className = '' }) => {
  const isPositive = token.price_change_percentage_24h >= 0;

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-green-200 ${className}`}>
      <div className="flex items-center mb-4">
        <img 
          src={token.image} 
          alt={token.name}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600">{token.name} ({token.symbol})</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Current Price:</span>
          <span className="font-semibold text-lg text-gray-900">{formatPrice(token.current_price)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Market Cap:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(token.market_cap)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">FDV:</span>
          <span className="font-semibold text-green-600">{formatCurrency(token.fully_diluted_valuation)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">24h Change:</span>
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatPercentage(token.price_change_percentage_24h)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Circulating Supply:</span>
          <span className="font-semibold text-gray-900">{formatNumber(token.circulating_supply)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Supply:</span>
          <span className="font-semibold text-gray-900">{formatNumber(token.total_supply)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Market Rank:</span>
          <span className="font-semibold text-gray-900">#{token.market_cap_rank}</span>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
