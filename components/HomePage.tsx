import React from 'react';
import { COMPANY_IMAGE_URL, COMPANY_NAME, APP_TITLE } from '../constants';

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-4 md:p-8 relative z-10"> {/* Added justify-center for vertical centering */}
      <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl ring-1 ring-black/5 dark:ring-white/10">
        <img 
          src={COMPANY_IMAGE_URL} 
          alt={`${COMPANY_NAME} illustrative banner`} 
          className="max-w-xs md:max-w-sm lg:max-w-md mx-auto mb-6 md:mb-8 rounded-lg shadow-xl"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-blue-dark dark:text-theme-blue-lighter mb-4">
          Welcome to the {APP_TITLE}
        </h1>
        <p className="text-md md:text-lg text-gray-700 dark:text-gray-200 max-w-xl mx-auto mb-8">
          Unlock optimal pricing strategies! 🛍️ Analyze market trends, monitor competitors, and forecast demand to maximize your profits with our comprehensive suite of tools.
        </p>

        <button
          onClick={onGetStarted}
          className="bg-theme-green-peach-DEFAULT hover:bg-theme-green-peach-dark dark:bg-theme-green-peach-DEFAULT dark:hover:bg-theme-green-peach-dark text-black dark:text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl text-lg md:text-xl transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-theme-green-peach-light/50 dark:focus:ring-theme-green-peach-light/50"
          aria-label="Get started with pricing optimization"
        >
          Get Started & Optimize 🚀
        </button>
      </div>

      <p className="mt-12 text-sm text-gray-600 dark:text-gray-400">
        Powered by <span className="font-semibold text-theme-blue-dark dark:text-theme-blue-lighter">{COMPANY_NAME}</span>
      </p>
    </div>
  );
};

export default HomePage;