import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAIAssistantResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { AI_ASSISTANT_TITLE, AI_ASSISTANT_INITIAL_MESSAGE } from '../constants';

// Minimal type definitions for SpeechRecognition API
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  readonly emma?: Document | null;
  readonly interpretation?: any;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  
  onaudiostart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
  prototype: ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const QUICK_QUESTIONS = [
  "What is this app for?",
  "Explain 'COGS'.",
  "What are 'Pricing Scenarios'?",
  "How do I use 'Desired Profit Margin'?",
];

interface AIAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const inputContentOnListenStartRef = useRef<string>('');


  const apiKeyExists = !!process.env.API_KEY;
  const micSupported = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (isOpen) {
      setMessages([
        { 
          id: uuidv4(), 
          sender: 'ai', 
          text: apiKeyExists ? AI_ASSISTANT_INITIAL_MESSAGE : "AI Assistant is unavailable as the API key is not configured. Please contact support.",
          isError: !apiKeyExists
        }
      ]);
      setUserInput('');
      setMicError(null);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsListening(false); 
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsListening(false); 
    }
  }, [isOpen, apiKeyExists]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null; 
      }
    };
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !apiKeyExists) return;

    const userMessage: ChatMessage = { id: uuidv4(), sender: 'user', text: messageText.trim() };
    setMessages(prev => [...prev, userMessage]);
    // setUserInput(''); // Clear input only if the message came from the input field directly
    setIsLoading(true);

    const aiPlaceholderMessageId = uuidv4();
    const aiPlaceholderMessage: ChatMessage = { 
        id: aiPlaceholderMessageId, 
        sender: 'ai', 
        text: 'Thinking...', 
        isLoading: true 
    };
    setMessages(prev => [...prev, aiPlaceholderMessage]);
    
    const historyForAPI = messages.filter(msg => !msg.isLoading && !msg.isError); 

    try {
      const aiResponseText = await getAIAssistantResponse(messageText.trim(), historyForAPI);
      setMessages(prev => prev.map(msg => 
        msg.id === aiPlaceholderMessageId 
        ? { ...msg, text: aiResponseText, isLoading: false, isError: false } 
        : msg
      ));
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMessageText = error instanceof Error ? error.message : "An unexpected error occurred.";
      setMessages(prev => prev.map(msg => 
        msg.id === aiPlaceholderMessageId 
        ? { ...msg, text: `Error: ${errorMessageText}`, isLoading: false, isError: true } 
        : msg
      ));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(userInput.trim()){
      handleSendMessage(userInput);
      setUserInput(''); // Clear input after sending
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    handleSendMessage(question);
  };


  const toggleListening = useCallback(() => {
    if (!micSupported || !SpeechRecognitionAPI) {
      setMicError("Speech recognition is not supported by your browser.");
      return;
    }
    if (isLoading) return;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // onend will set isListening to false
    } else {
      setMicError(null);
      if (recognitionRef.current) { // Ensure any old instance is stopped
        recognitionRef.current.stop();
      }
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;
      
      inputContentOnListenStartRef.current = inputRef.current?.value || '';

      recognition.continuous = false; 
      recognition.interimResults = true; 
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentFinalTranscript = ""; 
        let currentInterimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinalTranscript += transcriptPart + ' ';
          } else {
            currentInterimTranscript += transcriptPart;
          }
        }
        
        currentFinalTranscript = currentFinalTranscript.trim();
        currentInterimTranscript = currentInterimTranscript.trim();

        let newText = inputContentOnListenStartRef.current.trim();

        if (currentFinalTranscript) {
          if (newText) {
            newText += ' ' + currentFinalTranscript;
          } else {
            newText = currentFinalTranscript;
          }
        }

        if (currentInterimTranscript) {
          if (newText) {
            newText += ' ' + currentInterimTranscript;
          } else {
            newText = currentInterimTranscript;
          }
        }
        
        setUserInput(newText.trim());
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          setMicError('No speech detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          setMicError('Microphone problem. Please ensure it is connected and enabled.');
        } else if (event.error === 'not-allowed' || event.error === 'security') {
          setMicError('Microphone access denied. Please allow microphone permission in your browser settings.');
        } else {
          setMicError(`Error: ${event.error || 'Unknown speech error'}`);
        }
        setIsListening(false); 
      };

      recognition.onend = () => {
        setIsListening(false);
        setUserInput(prev => prev.trim()); 
        inputRef.current?.focus();
      };
      
      try {
        recognition.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setMicError("Could not start voice input. Check microphone permissions and browser support.");
        setIsListening(false);
      }
    }
  }, [isListening, micSupported, isLoading, SpeechRecognitionAPI]);

  if (!isOpen) return null;

  const showQuickQuestions = apiKeyExists && !isLoading && !isListening && userInput.trim() === '';

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
    >
      <div className="bg-theme-blue-lighter/80 dark:bg-theme-blue-darker/80 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] ring-1 ring-black/10 dark:ring-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-blue-DEFAULT/30 dark:border-theme-blue-dark/30">
          <h2 id="ai-assistant-title" className="text-xl font-semibold text-theme-blue-darker dark:text-theme-blue-lighter">
            {AI_ASSISTANT_TITLE}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-500/20 transition-colors"
            aria-label="Close AI Assistant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-4 space-y-3 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl shadow whitespace-pre-wrap text-sm
                  ${msg.sender === 'user' 
                    ? 'bg-theme-green-light/80 dark:bg-theme-green-dark/70 text-theme-green-chat-text-light dark:text-theme-green-chat-text-dark rounded-br-none' 
                    : msg.isError 
                      ? 'bg-red-200 dark:bg-red-800/70 text-red-700 dark:text-red-200 rounded-bl-none'
                      : msg.isLoading
                        ? 'bg-gray-200 dark:bg-gray-700/70 text-gray-500 dark:text-gray-400 italic rounded-bl-none animate-pulse'
                        : 'bg-theme-blue-light/80 dark:bg-theme-blue-dark/70 text-theme-blue-chat-text-light dark:text-theme-blue-chat-text-dark rounded-bl-none'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Mic Error Display */}
        {micError && (
          <div className="p-2 px-4 text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50">
            {micError}
          </div>
        )}

        {/* Quick Questions Area */}
        {showQuickQuestions && (
          <div className="px-4 pt-2 pb-1 border-t border-theme-blue-DEFAULT/20 dark:border-theme-blue-dark/20">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">Suggested Questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestionClick(q)}
                  className="px-3 py-1.5 text-xs bg-theme-green-peach-light/70 hover:bg-theme-green-peach-light dark:bg-theme-green-peach-dark/70 dark:hover:bg-theme-green-peach-dark text-black dark:text-white rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-theme-green-peach-DEFAULT/50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}


        {/* Input Area */}
        {apiKeyExists && (
          <div className={`p-4 border-t border-theme-blue-DEFAULT/30 dark:border-theme-blue-dark/30 ${showQuickQuestions ? 'pt-3' : 'pt-4'}`}>
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask about the app..."}
                disabled={isLoading || isListening} 
                className="flex-grow p-3 border rounded-lg shadow-sm bg-white/70 dark:bg-gray-700/60 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-theme-green-DEFAULT/50 dark:border-theme-green-dark/50 focus:ring-2 focus:ring-theme-blue-DEFAULT focus:border-theme-blue-DEFAULT transition-all"
                aria-label="Your question for the AI Assistant"
              />
              {micSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`p-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    ${isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-theme-green-DEFAULT hover:bg-theme-green-dark dark:bg-theme-green-dark dark:hover:bg-theme-green-darker text-white'
                    }`}
                  aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5h0v-6A6 6 0 0 1 18 12v-1.5m-6 7.5V12m6-6H6m6 0a6 6 0 0 0-6 6v1.5m6-7.5H6" />
                    </svg>
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !userInput.trim() || isListening}
                className="p-3 bg-theme-blue-DEFAULT hover:bg-theme-blue-dark dark:bg-theme-blue-dark dark:hover:bg-theme-blue-darker text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </form>
             {!micSupported && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Voice input is not supported by your browser.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantChat;