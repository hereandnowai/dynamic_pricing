import React from 'react';
import { COMPANY_LOGO_URL, COMPANY_NAME, APP_TITLE } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

interface HeaderProps {
  onToggleAssistant: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleAssistant }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-theme-blue-DEFAULT/70 dark:bg-theme-blue-dark/70 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <img src={COMPANY_LOGO_URL} alt="Company Logo" className="h-10 w-10 mr-3 rounded-sm" />
          <div>
            <h1 className="text-xl font-bold text-theme-blue-darker dark:text-theme-blue-light">{APP_TITLE}</h1>
            <p className="text-xs text-theme-blue-darker dark:text-theme-green-light">{COMPANY_NAME}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-sm hidden md:block text-theme-blue-darker dark:text-theme-blue-lighter">
            AI-Powered Pricing Insights 💡
          </div>
          <button
            onClick={onToggleAssistant}
            className="p-2 rounded-full hover:bg-theme-blue-dark/50 dark:hover:bg-theme-blue-light/20 focus:outline-none focus:ring-2 focus:ring-theme-green-light dark:focus:ring-theme-green-DEFAULT transition-colors text-theme-blue-darker dark:text-white"
            aria-label="Open AI Assistant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-theme-blue-dark/50 dark:hover:bg-theme-blue-light/20 focus:outline-none focus:ring-2 focus:ring-theme-green-light dark:focus:ring-theme-green-DEFAULT transition-colors text-theme-blue-darker dark:text-white"
            aria-label={theme === Theme.LIGHT ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === Theme.LIGHT ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 6.75A5.25 5.25 0 0 0 6.75 12a5.25 5.25 0 0 0 5.25 5.25a5.25 5.25 0 0 0 5.25-5.25a5.25 5.25 0 0 0-5.25-5.25Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;