

import { GoogleGenAI, GenerateContentResponse, Content, Candidate as GenAICandidate } from "@google/genai";
import { ProductInputData, GeminiResponseData, Candidate, PricingScenario, ChatHistoryEntry, ChatMessage } from '../types';
import { COMPANY_NAME, GEMINI_MODEL_TEXT, AI_ASSISTANT_SYSTEM_INSTRUCTION, AI_ASSISTANT_INITIAL_MESSAGE } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please ensure the API_KEY environment variable is configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const buildPrompt = (data: ProductInputData): Content => {
  let promptText = `
You are an AI-powered Dynamic Pricing Optimization assistant for ${COMPANY_NAME}.
Your expertise includes real-time market analysis, competitor pricing monitoring, demand forecasting, and profit optimization.

Analyze the following product data to provide a dynamic pricing recommendation:

Product Information:
- Product Name: ${data.productName}
- Current Price: $${data.currentPrice}
- Cost of Goods Sold (COGS): $${data.cogs}
- Desired Profit Margin: ${data.desiredProfitMargin}%
- Current Inventory Level: ${data.inventoryLevel} units
- Competitor Prices: ${data.competitorPrices || 'Not specified'}
- Pricing Scenario: ${data.pricingScenario}

Based on this information, provide the following structured response. Be concise due to token limits.
1.  **Optimal Recommended Price:** (Specific price or narrow range. E.g., $XX.XX or $XX.XX - $YY.YY)
2.  **Detailed Reasoning:** (Key factors influencing the recommendation based on the provided data.)
3.  **Actionable Insights:** (Key takeaways from the analysis.)
4.  **Implementation Steps:** (Brief steps to implement the recommendation.)
5.  **Potential Impact:** (Brief estimate on sales, revenue, or profit margin.)

Consider profit margins, market positioning (if inferable from competitor prices), and customer willingness-to-pay.
Format your response clearly and concisely with numbered points.
If competitor prices are provided or the scenario is "New Launch", use Google Search to gather relevant, up-to-date market context or competitor information if it enhances the recommendation.
  `;
  return { role: "user", parts: [{ text: promptText }] };
};


export const generatePricingRecommendation = async (data: ProductInputData): Promise<GeminiResponseData> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured. Cannot contact AI service. Please ensure the API_KEY environment variable is set.");
  }

  const promptContent = buildPrompt(data);

  try {
    const useSearch = data.pricingScenario === PricingScenario.NEW_LAUNCH || 
                      (data.competitorPrices && data.competitorPrices.trim() !== '');

    let modelConfig: {
      tools?: { googleSearch: {} }[];
      maxOutputTokens?: number;
    } = {};

    if (useSearch) {
      modelConfig.tools = [{ googleSearch: {} }];
      console.log("Using Google Search for this query. Config will only include tools.");
    } else {
      modelConfig.maxOutputTokens = 512;
      console.log("Not using Google Search for this query. Config includes maxOutputTokens.");
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [promptContent],
      config: modelConfig 
    });

    const recommendationText = response.text || ''; 
    
    const responseCandidates: GenAICandidate[] | undefined = response.candidates;

    const appCandidates: Candidate[] | undefined = responseCandidates?.map(rc => ({
        groundingMetadata: rc.groundingMetadata ? {
            groundingChunks: rc.groundingMetadata.groundingChunks?.map(gc => ({
                web: gc.web ? {
                    uri: gc.web.uri,
                    title: gc.web.title,
                } : undefined,
            }))
        } : undefined,
    }));
    
    return { text: recommendationText, candidates: appCandidates };

  } catch (error) {
    console.error('Error calling Gemini API for pricing recommendation:', error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key not valid') || error.message.toLowerCase().includes('permission denied')) {
             throw new Error(`Failed to get pricing recommendation: API Key is invalid or missing permissions. Details: ${error.message}`);
        }
        throw new Error(`Failed to get pricing recommendation: ${error.message}`);
    }
    throw new Error('Failed to get pricing recommendation due to an unknown error.');
  }
};


export const getAIAssistantResponse = async (userQuery: string, history: ChatMessage[]): Promise<string> => {
  if (!API_KEY) {
    // This case should ideally be handled by disabling the assistant UI if API key is not present.
    // Returning a canned response or throwing an error.
    return "I'm currently unable to connect to my knowledge base. Please ensure the API key is configured.";
  }

  const formattedHistory: ChatHistoryEntry[] = history
    .filter(msg => msg.sender === 'user' || (msg.sender === 'ai' && !msg.isLoading && !msg.isError)) // Only include successfully sent/received messages
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [...formattedHistory, { role: 'user', parts: [{ text: userQuery }] }],
      config: {
        systemInstruction: AI_ASSISTANT_SYSTEM_INSTRUCTION,
        // Optional: Disable thinking for potentially faster, slightly less nuanced assistant responses.
        // thinkingConfig: { thinkingBudget: 0 }, 
        maxOutputTokens: 256, // Keep assistant responses concise
      },
    });
    
    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Error calling Gemini API for AI Assistant:', error);
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('api key not valid') || error.message.toLowerCase().includes('permission denied')) {
        return "There seems to be an issue with the API configuration. I cannot process your request.";
      }
      return `I encountered an error: ${error.message}. Please try again.`;
    }
    return 'An unexpected error occurred while trying to get a response.';
  }
};
