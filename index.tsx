import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Correct relative path

// The API key MUST be obtained exclusively from the environment variable process.env.API_KEY.
// This variable is assumed to be pre-configured in the execution environment.
// For local development, ensure API_KEY is available in process.env (e.g., via .env file or shell export).
if (!process.env.API_KEY) {
  // This message is for developers. The application will handle API key absence at the point of API call.
  console.warn(
    "API_KEY environment variable is not set. " +
    "The application will attempt to run, but Gemini API calls will fail. " +
    "Please ensure process.env.API_KEY is configured in your environment."
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);