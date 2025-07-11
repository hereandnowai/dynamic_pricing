import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div 
      className="bg-red-500/30 dark:bg-red-700/30 backdrop-blur-md border-l-4 border-red-600 dark:border-red-400 text-red-900 dark:text-red-100 p-4 rounded-lg shadow-lg" 
      role="alert"
    >
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="font-bold">Error</p>
      </div>
      <p className="mt-1 ml-8 text-sm">{message}</p>
    </div>
  );
};

export default ErrorDisplay;