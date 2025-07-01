import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import RecommendationDisplay from './components/RecommendationDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import HomePage from './components/HomePage';
import AIAssistantChat from './components/AIAssistantChat'; // Correct relative path
import { ProductInputData, GeminiResponseData } from './types';
import { generatePricingRecommendation } from './services/geminiService';
import { COMPANY_NAME } from './constants'; 
import { ThemeProvider } from './contexts/ThemeContext';

type PageView = 'home' | 'optimizer';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [recommendationData, setRecommendationData] = useState<GeminiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const handleFormSubmit = useCallback(async (data: ProductInputData) => {
    console.log("Form submitted. Setting isLoading to true. Data:", data);
    setIsLoading(true);
    setError(null);
    setRecommendationData(null);

    try {
      console.log("Calling generatePricingRecommendation...");
      const result = await generatePricingRecommendation(data);
      console.log("generatePricingRecommendation returned successfully:", result);
      setRecommendationData(result);
    } catch (err) {
      console.error("Error caught in handleFormSubmit:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during submission.');
      }
    } finally {
      console.log("Executing finally block in handleFormSubmit. Setting isLoading to false.");
      setIsLoading(false);
    }
  }, []);

  const navigateToOptimizer = () => {
    setCurrentPage('optimizer');
    setRecommendationData(null); 
    setError(null);
  };
  
  const navigateToHome = () => {
    setCurrentPage('home');
    setRecommendationData(null);
    setError(null);
  };

  const toggleAssistant = () => {
    setIsAssistantOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleAssistant={toggleAssistant} /> 
      {currentPage === 'optimizer' && (
        <div className="container mx-auto px-4 pt-4 text-left">
          <button 
            onClick={navigateToHome} 
            className="bg-theme-blue-DEFAULT/70 hover:bg-theme-blue-DEFAULT/90 dark:bg-theme-green-DEFAULT/70 dark:hover:bg-theme-green-DEFAULT/90 backdrop-blur-sm text-theme-blue-darker dark:text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
          >
            &larr; Back to Home
          </button>
        </div>
      )}
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col">
        {currentPage === 'home' ? (
          <HomePage onGetStarted={navigateToOptimizer} />
        ) : ( 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="lg:pr-4">
              <InputForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading} 
              />
            </div>
            <div className="lg:pl-4 mt-8 lg:mt-0">
              {isLoading && <LoadingSpinner />}
              {error && !isLoading && <ErrorDisplay message={error} />}
              {recommendationData && !isLoading && !error && (
                <RecommendationDisplay 
                  recommendationText={recommendationData.text} 
                  groundingChunks={recommendationData.candidates?.[0]?.groundingMetadata?.groundingChunks}
                />
              )}
              {!isLoading && !error && !recommendationData && (
                <div className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-md p-6 rounded-xl shadow-xl text-center text-gray-600 dark:text-gray-300 ring-1 ring-black/5 dark:ring-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-theme-blue-DEFAULT/70 dark:text-theme-blue-light/70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2 text-theme-blue-dark dark:text-theme-blue-lighter">Pricing Insights Await ✨</h3>
                  <p>Fill in the product and market details to get AI-powered pricing recommendations. 📊</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="bg-theme-green-DEFAULT/70 dark:bg-theme-green-dark/70 backdrop-blur-md text-black dark:text-theme-green-lighter text-center p-4 text-sm shadow-inner mt-auto">
        &copy; {new Date().getFullYear()} {COMPANY_NAME || "Dynamic Pricing Optimizer"}. RASHINI S [ AI PRODUCTS ENGINEER TEAM ]. All rights reserved. 
        Powered by AI 🧠.
      </footer>
      <AIAssistantChat isOpen={isAssistantOpen} onClose={toggleAssistant} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App;