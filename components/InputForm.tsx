import React, { useState, useEffect } from 'react';
import { ProductInputData, PricingScenario } from '../types';
import { PRICING_SCENARIOS } from '../constants';

interface InputFormProps {
  onSubmit: (data: ProductInputData) => void;
  isLoading: boolean;
}

const initialFormData: ProductInputData = {
  productName: '',
  currentPrice: '',
  cogs: '',
  desiredProfitMargin: '',
  competitorPrices: '',
  inventoryLevel: '',
  pricingScenario: PricingScenario.STANDARD,
};

const inputBaseClasses = "w-full p-3 border rounded-md shadow-sm bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-theme-green-DEFAULT/50 dark:border-theme-green-dark/50 focus:ring-2 focus:ring-theme-blue-DEFAULT focus:border-theme-blue-DEFAULT transition-all";
const labelBaseClasses = "block text-sm font-medium text-theme-green-darker dark:text-theme-green-light mb-1";

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProductInputData>(initialFormData);

   useEffect(() => {
    // Reset form when it becomes visible or on key changes if needed
    // For now, it resets on initial mount if that's desired behavior.
    // If it's part of a multi-step flow or shown/hidden, this might need adjustment.
    // setFormData(initialFormData); // This line currently has no effect as it's an empty dep array
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: (name === 'currentPrice' || name === 'cogs' || name === 'desiredProfitMargin' || name === 'inventoryLevel') 
               ? (value === '' ? '' : parseFloat(value)) 
               : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-theme-green-lighter/50 dark:bg-theme-green-dark/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl space-y-6 ring-1 ring-black/5 dark:ring-white/10">
      <div className="border-b border-theme-green-DEFAULT/30 dark:border-theme-green-dark/30 pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-theme-green-darker dark:text-theme-green-lighter flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-2 text-theme-green-dark dark:text-theme-green-DEFAULT">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Enter Product Details
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="productName" className={labelBaseClasses}>Product Name</label>
          <input type="text" name="productName" id="productName" value={formData.productName} onChange={handleChange} required className={inputBaseClasses} />
        </div>
        <div>
          <label htmlFor="pricingScenario" className={labelBaseClasses}>Pricing Scenario</label>
          <select name="pricingScenario" id="pricingScenario" value={formData.pricingScenario} onChange={handleChange} className={inputBaseClasses}>
            {PRICING_SCENARIOS.map(scenario => (
              <option key={scenario} value={scenario}>{scenario}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="currentPrice" className={labelBaseClasses}>Current Price ($)</label>
          <input type="number" name="currentPrice" id="currentPrice" value={formData.currentPrice} onChange={handleChange} required min="0" step="0.01" className={inputBaseClasses} />
        </div>
        <div>
          <label htmlFor="cogs" className={labelBaseClasses}>COGS ($)</label>
          <input type="number" name="cogs" id="cogs" value={formData.cogs} onChange={handleChange} required min="0" step="0.01" className={inputBaseClasses} />
        </div>
        <div>
          <label htmlFor="desiredProfitMargin" className={labelBaseClasses}>Desired Profit Margin (%)</label>
          <input type="number" name="desiredProfitMargin" id="desiredProfitMargin" value={formData.desiredProfitMargin} onChange={handleChange} required min="0" step="0.1" className={inputBaseClasses} />
        </div>
        <div>
          <label htmlFor="inventoryLevel" className={labelBaseClasses}>Inventory Level (Units)</label>
          <input type="number" name="inventoryLevel" id="inventoryLevel" value={formData.inventoryLevel} onChange={handleChange} required min="0" className={inputBaseClasses} />
        </div>
      </div>
      
      <div>
        <label htmlFor="competitorPrices" className={labelBaseClasses}>Competitor Prices (comma-separated)</label>
        <textarea name="competitorPrices" id="competitorPrices" placeholder="e.g., 29.99, 32.50 (Optional)" value={formData.competitorPrices} onChange={handleChange} rows={2} className={`${inputBaseClasses} min-h-[60px]`}></textarea>
      </div>

      <div>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full flex justify-center items-center bg-theme-blue-DEFAULT hover:bg-theme-blue-dark dark:bg-theme-blue-dark dark:hover:bg-theme-blue-darker text-black dark:text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-theme-blue-light focus:ring-opacity-75"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Optimizing...
            </>
          ) : (
            'Get Pricing Recommendation 🎯'
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;