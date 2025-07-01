import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center p-8 bg-white/50 dark:bg-gray-800/40 backdrop-blur-md rounded-xl shadow-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-blue-DEFAULT dark:border-theme-blue-light"></div>
      <p className="mt-4 text-lg text-theme-green-dark dark:text-theme-green-light font-semibold">Analyzing data...</p>
    </div>
  );
};

export default LoadingSpinner;