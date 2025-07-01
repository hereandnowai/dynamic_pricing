import React from 'react';
import { GroundingChunk } from '../types';

interface RecommendationDisplayProps {
  recommendationText: string;
  groundingChunks?: GroundingChunk[];
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendationText, groundingChunks }) => {
  if (!recommendationText && (!groundingChunks || groundingChunks.length === 0)) {
    return null; // Don't render if there's nothing to display
  }
  
  const rawSections = recommendationText.split(/\n\s*\d+\.\s+/);
  const title = rawSections[0]?.replace(/^#+\s*/, '').trim() || "AI Pricing Recommendation";

  const contentSections = rawSections
    .slice(1) 
    .map(currentSectionString => {
      const trimmedSectionString = currentSectionString.trim();
      let sectionHeading = ''; 
      let sectionBody = trimmedSectionString;

      const firstColonIndex = trimmedSectionString.indexOf(':');
      const firstBoldEndIndex = trimmedSectionString.indexOf('**:', 0); // Handles **Heading:**
      
      let splitIndex = -1;

      if (firstBoldEndIndex !== -1 && (firstColonIndex === -1 || firstBoldEndIndex < firstColonIndex)) {
        // Found "**Heading:**"
        sectionHeading = trimmedSectionString.substring(trimmedSectionString.indexOf('**') + 2, firstBoldEndIndex).trim();
        splitIndex = firstBoldEndIndex + 3; // Length of '**:'
      } else if (firstColonIndex !== -1) {
         // Found "Heading:"
        sectionHeading = trimmedSectionString.substring(0, firstColonIndex).replace(/\*+/g, '').trim(); // Remove any stray asterisks
        splitIndex = firstColonIndex + 1;
      }


      if (splitIndex !== -1) {
        sectionBody = trimmedSectionString.substring(splitIndex).trim();
      } else {
        // No clear heading, use the whole string as body, or decide if it should be a heading
        // For now, let's assume it's part of the body if no colon or markdown heading found
         sectionHeading = ''; // Or some default if the first part is always a heading
         sectionBody = trimmedSectionString;
      }
      
      const paragraphs = sectionBody
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      return {
        heading: sectionHeading,
        content: paragraphs
      };
    })
    .filter(s => s.heading.length > 0 || s.content.length > 0); 

  return (
    <div className="bg-theme-blue-lighter/50 dark:bg-theme-blue-dark/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-center mb-5 border-b border-theme-blue-DEFAULT/30 dark:border-theme-blue-dark/30 pb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-theme-green-DEFAULT dark:text-theme-green-light mr-3 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 0-11.25m0 11.25a6.01 6.01 0 0 1 0-11.25m0 11.25v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
        <h2 className="text-2xl font-semibold text-theme-blue-darker dark:text-theme-blue-lighter">{title}</h2>
      </div>
      
      {contentSections.length > 0 ? (
        contentSections.map((section, index) => (
          <div key={index} className="mb-4 p-4 bg-theme-blue-DEFAULT/20 dark:bg-theme-blue-dark/20 backdrop-blur-sm rounded-lg shadow">
            {section.heading && (
              <h3 className="text-lg font-semibold text-theme-green-dark dark:text-theme-green-DEFAULT mb-2">{section.heading}</h3>
            )}
            {section.content.map((paragraph, pIndex) => (
               <p key={pIndex} className="text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed text-sm">{paragraph}</p>
            ))}
          </div>
        ))
      ) : recommendationText ? (
        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed p-4 bg-theme-blue-DEFAULT/20 dark:bg-theme-blue-dark/20 backdrop-blur-sm rounded-lg shadow">{recommendationText}</div>
      ) : null}

      {groundingChunks && groundingChunks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-theme-blue-DEFAULT/30 dark:border-gray-700/50">
          <h3 className="text-md font-semibold text-theme-blue-dark dark:text-theme-blue-light mb-2">Sources & Further Reading:</h3>
          <ul className="list-disc list-inside space-y-1">
            {groundingChunks.filter(chunk => chunk.web && chunk.web.uri).map((chunk, index) => (
              <li key={index} className="text-sm">
                <a 
                  href={chunk.web!.uri!} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-theme-green-dark hover:text-theme-green-darker dark:text-theme-green-light dark:hover:text-theme-green-DEFAULT hover:underline"
                >
                  {chunk.web!.title || chunk.web!.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecommendationDisplay;