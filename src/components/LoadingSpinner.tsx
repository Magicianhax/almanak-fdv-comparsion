import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      <span className="ml-3 text-gray-800 text-lg font-semibold">Loading token data...</span>
    </div>
  );
};

export default LoadingSpinner;
