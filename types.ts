

export enum PricingScenario {
  STANDARD = "Standard",
  PROMOTION = "Promotion",
  CLEARANCE = "Clearance",
  NEW_LAUNCH = "New Launch",
}

export enum AlertSensitivity {
  NOT_SPECIFIED = "Not Specified",
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export interface ProductInputData {
  productName: string;
  currentPrice: number | '';
  cogs: number | '';
  desiredProfitMargin: number | '';
  competitorPrices: string; // Comma-separated
  inventoryLevel: number | '';
  pricingScenario: PricingScenario;
}

export interface GroundingChunkWeb {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
}

export interface GeminiResponseData {
  text: string;
  candidates?: Candidate[];
}

// For AI Assistant
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'systemInfo';
  text: string;
  isLoading?: boolean; // Used for AI messages that are being fetched
  isError?: boolean; // Used to indicate an error message
}

export interface MessagePart {
  text: string;
}

export interface ChatHistoryEntry {
  role: 'user' | 'model'; // Gemini API uses 'user' and 'model'
  parts: MessagePart[];
}