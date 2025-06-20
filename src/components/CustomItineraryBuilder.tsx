
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from './common/LoadingSpinner.tsx';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext'; 
import { AppView } from '../../types'; 
import { GEMINI_TEXT_MODEL, WANDERLUST_AI_SYSTEM_INSTRUCTION } from '../constants';


// These constants are declared to satisfy TypeScript errors that might occur if
// the linter/compiler misinterprets parts of the WANDERLUST_AI_SYSTEM_INSTRUCTION
// string literal (e.g., "destinationCity=Paris") as variable references.
// They are not used in the component's logic but prevent "Cannot find name" errors.
const originCity_unused = ""; // Renamed to avoid conflict if actual variable is introduced
const destinationCity_unused = "";
const departureDate_unused = "";
const datesRange_unused = "";
const pickupLocation_unused = "";
const ACTION_unused = ""; 
const NAVIGATE_STANDALONE_UNUSED = "";


interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isStreaming?: boolean;
  isActionable?: boolean;
  actionType?: 'navigate_standalone' | 'save_itinerary';
  actionParams?: Record<string, string>;
}

interface CustomItineraryBuilderProps {
  onSaveCustomItinerary: (summaryText: string) => void;
  onNavigateFromAIChatToStandaloneBooking: (
    type: 'flight' | 'hotel' | 'car' | 'bus' | 'cab',
    params: Record<string, string>
  ) => void;
  onSavePendingItineraryFromChat: () => void;
  onCloseChatbot: () => void; 
  isPageMode?: boolean;
}

// --- Icons ---
const BotAvatar = () => (
  <div className="w-8 h-8 sm:w-9 sm:w-9 rounded-full bg-emerald-100 dark:bg-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-xs ring-1 ring-emerald-300 dark:ring-emerald-600">
    AI
  </div>
);

const UserAvatarPlaceholder = () => (
    <div className="w-8 h-8 sm:w-9 sm:w-9 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300 ring-1 ring-slate-400 dark:ring-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
    </div>
);

const PaperclipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M209.66,122.34a8,8,0,0,1,0,11.32l-82.05,82a56,56,0,0,1-79.2-79.21L147.67,35.73a40,40,0,1,1,56.61,56.55L105,193A24,24,0,1,1,71,159L154.3,74.38A8,8,0,1,1,165.7,85.6L82.39,170.31a8,8,0,1,0,11.27,11.36L192.93,81A24,24,0,1,0,159,47L59.76,147.68a40,40,0,1,0,56.53,56.62l82.06-82A8,8,0,0,1,209.66,122.34Z"></path>
  </svg>
);

const MicrophoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path>
  </svg>
);

// For Popup mode header
const BotIconHeaderPopup = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400">
    <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM5.404 15.657a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 101.06 1.06l1.06-1.06zM16.717 10a.75.75 0 01-1.5 0h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 011.5 0zM4.283 10a.75.75 0 01-1.5 0H1.25a.75.75 0 010-1.5h1.533a.75.75 0 011.5 0zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM4.343 5.404a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.061 1.06z" />
  </svg>
);
const CloseIconPopupHeader = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

export const CustomItineraryBuilder: React.FC<CustomItineraryBuilderProps> = ({
  onSaveCustomItinerary,
  onNavigateFromAIChatToStandaloneBooking,
  onSavePendingItineraryFromChat,
  onCloseChatbot,
  isPageMode = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useContext<AuthContextType>(AuthContext); 

  useEffect(() => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("AI Chat features are unavailable: API Key is missing.");
      setIsApiKeyAvailable(false);
      return;
    }
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const chat = genAI.chats.create({
        model: GEMINI_TEXT_MODEL, // Use imported constant
        config: { systemInstruction: WANDERLUST_AI_SYSTEM_INSTRUCTION } // Use imported constant
      });
      setChatSession(chat);
      if (messages.length === 0) { 
        setMessages([{
            id: Date.now().toString(),
            sender: 'bot',
            text: "Hey there, globetrotter! Ready to cook up an epic trip or just need a quick booking? Spill the tea!",
        }]);
      }
    } catch (err) {
      setError("Failed to initialize AI Chat. Please check your API key or network connection.");
      setIsApiKeyAvailable(false);
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setInputValue(prev => prev + (prev.length > 0 && transcript.length > 0 ? " " : "") + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        setError(`Speech recognition error: ${event.error}. Please try typing.`);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        if (isListening) setIsListening(false);
      };
    }
    return () => recognitionRef.current?.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const scrollToBottom = () => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value);

  const processBotResponseForActions = (text: string): { text: string; actionType?: 'navigate_standalone' | 'save_itinerary'; actionParams?: Record<string, string> } => {
    const navigateActionMatch = text.match(/\[ACTION:NAVIGATE_STANDALONE_(FLIGHT|HOTEL|CAR|BUS|CAB)\(([^)]+)\)\]/i); // Added BUS and CAB
    if (navigateActionMatch) {
      const bookingType = navigateActionMatch[1].toLowerCase() as 'flight' | 'hotel' | 'car' | 'bus' | 'cab';
      const paramsString = navigateActionMatch[2];
      const params: Record<string, string> = {};
      paramsString.split(',').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) params[key.trim()] = value.trim();
      });
      const cleanedText = text.replace(navigateActionMatch[0], '').trim();
      return { text: cleanedText, actionType: 'navigate_standalone', actionParams: { type: bookingType, ...params } };
    }

    const saveItineraryActionMatch = text.match(/\[ACTION:SAVE_CHAT_ITINERARY\]/);
    if (saveItineraryActionMatch) {
      const cleanedText = text.replace(saveItineraryActionMatch[0], '').trim();
      return { text: cleanedText, actionType: 'save_itinerary' };
    }
    
    const savePendingItineraryActionMatch = text.match(/\[ACTION:SAVE_PENDING_ITINERARY\]/);
    if (savePendingItineraryActionMatch) {
        onSavePendingItineraryFromChat();
        const cleanedText = text.replace(savePendingItineraryActionMatch[0], '').trim();
        return { text: cleanedText }; 
    }
    return { text };
  };

  const handleSendMessage = async () => {
    const textToSend = inputValue.trim();
    if (!textToSend || isLoading || !chatSession) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: textToSend }]);
    setInputValue(''); setIsLoading(true); setError(null);

    let currentBotMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: currentBotMessageId, sender: 'bot', text: '', isStreaming: true }]);

    try {
      const stream = await chatSession.sendMessageStream({ message: textToSend });
      let accumulatedText = '';
      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        setMessages(prev => prev.map(msg => msg.id === currentBotMessageId ? { ...msg, text: accumulatedText, isStreaming: true } : msg));
      }
      
      const finalBotResponse = processBotResponseForActions(accumulatedText);
      setMessages(prev => prev.map(msg => msg.id === currentBotMessageId ? {
        ...msg,
        text: finalBotResponse.text,
        isStreaming: false,
        isActionable: !!finalBotResponse.actionType,
        actionType: finalBotResponse.actionType,
        actionParams: finalBotResponse.actionParams
      } : msg));

      if (finalBotResponse.actionType === 'navigate_standalone' && finalBotResponse.actionParams) {
        onNavigateFromAIChatToStandaloneBooking(
          finalBotResponse.actionParams.type as 'flight' | 'hotel' | 'car' | 'bus' | 'cab',
          finalBotResponse.actionParams
        );
      } else if (finalBotResponse.actionType === 'save_itinerary') {
        onSaveCustomItinerary(finalBotResponse.text);
      }

    } catch (err) {
      setMessages(prev => prev.filter(msg => msg.id !== currentBotMessageId));
      setError(`Wanderlust AI is a bit tired: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setIsLoading(false); }
  };
  
  const handleActionClick = (actionType?: 'navigate_standalone' | 'save_itinerary', actionParams?: Record<string, string>, text?: string) => {
    if (actionType === 'navigate_standalone' && actionParams) {
      onNavigateFromAIChatToStandaloneBooking(actionParams.type as 'flight'|'hotel'|'car'|'bus'|'cab', actionParams);
    } else if (actionType === 'save_itinerary' && text) {
      onSaveCustomItinerary(text);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError("Voice input is not supported by your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true); setError(null);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        if (err instanceof Error && err.name === 'InvalidStateError') {
          recognitionRef.current.abort();
          try { recognitionRef.current.start(); setIsListening(true); } 
          catch (retryErr) { setError("Could not start voice input. Please try again or type your message."); setIsListening(false); }
        } else { setError("Could not start voice input. Please ensure microphone access is allowed."); setIsListening(false); }
      }
    }
  };

  const rootContainerClasses = isPageMode
    ? "flex-1 flex flex-col bg-gray-50 dark:bg-slate-900" // Use flex-1 to grow within App.tsx's main flex container
    : "fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-2.5rem)] max-w-sm sm:max-w-md h-[75vh] max-h-[550px] sm:max-h-[600px] bg-white dark:bg-slate-850 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col animate-slide-in-up-chat";
  
  const chatAreaBg = isPageMode ? 'bg-transparent' : 'bg-white dark:bg-slate-800'; 
  const inputAreaBg = isPageMode ? 'bg-gray-100 dark:bg-slate-850' : 'bg-slate-50 dark:bg-slate-900 rounded-b-xl';
  const inputFieldBg = isPageMode ? 'bg-[#eaeef1] dark:bg-slate-750' : 'bg-white dark:bg-slate-700';

  return (
    <div className={rootContainerClasses}>
      {isPageMode ? (
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Trip Planner</h1>
        </div>
      ) : (
        <header className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-900 rounded-t-xl">
          <h2 className="text-md sm:text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
            <BotIconHeaderPopup />
            <span className="ml-2">Wanderlust AI</span>
          </h2>
          <button 
            onClick={onCloseChatbot} 
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors interactive-element button-interactive"
            aria-label="Close chat"
          >
            <CloseIconPopupHeader />
          </button>
        </header>
      )}
      
      {!isApiKeyAvailable && error && (
        <div className={`p-4 m-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-md ${!isPageMode ? 'mx-2 my-2 text-xs' : ''}`}>
          <p className="font-bold">Chat Unavailable</p>
          <p>{error}</p>
        </div>
      )}

      <div className={`flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar ${chatAreaBg}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end max-w-[85%] sm:max-w-[80%] gap-2 sm:gap-3 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
             <div className="shrink-0">
                {msg.sender === 'bot' ? <BotAvatar /> : (
                    currentUser?.profileImageUrl ? 
                    <img src={currentUser.profileImageUrl} alt="User" className="w-8 h-8 sm:w-9 sm:w-9 rounded-full object-cover" /> :
                    <UserAvatarPlaceholder />
                )}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs text-slate-500 dark:text-slate-400 mb-0.5 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'bot' ? 'AI Trip Planner' : (currentUser?.email?.split('@')[0] || 'You')}
              </span>
              <div className={`p-2.5 sm:p-3 shadow-md break-words text-sm ${ msg.sender === 'user' ? 'bg-blue-500 text-white rounded-xl rounded-br-none sm:rounded-br-none' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 rounded-xl rounded-bl-none sm:rounded-bl-none' }`}>
                <div className={`prose prose-sm max-w-none prose-p:my-0.5 ${msg.sender === 'user' ? 'prose-white' : 'dark:prose-invert'}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
                {msg.isStreaming && <span className="inline-block w-1 h-4 ml-1 bg-slate-400 dark:bg-slate-500 animate-pulse"></span>}
                {msg.isActionable && msg.actionType === 'save_itinerary' && (
                  <button
                    onClick={() => handleActionClick(msg.actionType, msg.actionParams, msg.text)}
                    className="mt-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-md transition-colors button-interactive"
                  >
                    Save This Itinerary
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatMessagesEndRef} />
      </div>

      {error && !error.includes("API Key is missing") && <p className={`p-2 text-red-600 dark:text-red-400 text-xs text-center border-t border-slate-200 dark:border-slate-700 ${inputAreaBg}`}>{error}</p>}

      <div className={`p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 shrink-0 ${inputAreaBg}`}>
        <div className={`flex items-center space-x-2 p-1 rounded-xl ${inputFieldBg}`}>
          <textarea 
            value={inputValue} 
            onChange={handleInputChange} 
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} 
            placeholder={!isApiKeyAvailable ? "AI Chat unavailable." : (chatSession === null ? "Initializing AI..." : "Ask me anything...")} 
            className="flex-grow p-2 sm:p-2.5 bg-transparent border-none rounded-lg focus:ring-0 resize-none text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
            rows={1} 
            disabled={isLoading || !isApiKeyAvailable || chatSession === null} 
            aria-label="Chat input"
          />
          <button 
            onClick={() => {/* Implement attachment functionality or leave as placeholder */}} 
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 interactive-element button-interactive"
            aria-label="Attach file"
            disabled={isLoading || !isApiKeyAvailable || chatSession === null}
          >
            <PaperclipIcon />
          </button>
          <button 
            onClick={toggleVoiceInput} 
            className={`p-2 transition-colors ${isListening ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'} disabled:opacity-50 interactive-element button-interactive`}
            aria-label="Voice input"
            disabled={isLoading || !isApiKeyAvailable || chatSession === null || !recognitionRef.current}
          >
            <MicrophoneIcon />
          </button>
        </div>
      </div>
      
      {!isPageMode && <style>{`
        @keyframes slideInUpChat { 
          from { opacity: 0; transform: translateY(30px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-slide-in-up-chat { animation: slideInUpChat 0.3s ease-out forwards; }
      `}</style>}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .prose-sm p, .prose-sm ul, .prose-sm ol {margin-top: 0.25em; margin-bottom: 0.25em;}
        .prose-white strong { color: white !important; }
        .prose-white a { color: #bfdbfe !important; } 
        .prose-white a:hover { color: #93c5fd !important; }
        .dark .prose-invert strong { color: #e2e8f0 !important; } 
        .dark .prose-invert a { color: #60a5fa !important; } 
        .dark .prose-invert a:hover { color: #38bdf8 !important; }
      `}</style>
    </div>
  );
};
