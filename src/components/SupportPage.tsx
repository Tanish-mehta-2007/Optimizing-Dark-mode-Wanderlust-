
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from './common/LoadingSpinner';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext'; 
import { MOCK_SUPPORT_FAQS, GEMINI_TEXT_MODEL, WANDERBOT_SUPPORT_SYSTEM_INSTRUCTION } from '../constants';
import { FAQItem, AppView } from '../../types';
import Modal from './common/Modal';

// --- Icons ---
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>;
const SupportBotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.5 5.5 0 00-5.5 5.5A.75.75 0 005.25 18h9.5a.75.75 0 00.75-.75A5.5 5.5 0 0010 12z" clipRule="evenodd" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z"></path></svg>;

interface Message { id: string; sender: 'user' | 'bot'; text: string; isStreaming?: boolean; }
interface SupportPageProps { onNavigateBack: () => void; }

const SupportPage: React.FC<SupportPageProps> = ({ onNavigateBack }) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInputValue, setChatInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [supportChatSession, setSupportChatSession] = useState<Chat | null>(null);
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const { currentUser } = useContext<AuthContextType>(AuthContext);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = process.env.API_KEY;
    setIsApiKeyAvailable(!!key);
    if (key) {
      try {
        const genAIInstance = new GoogleGenAI({ apiKey: key });
        const chat = genAIInstance.chats.create({ model: GEMINI_TEXT_MODEL, config: { systemInstruction: WANDERBOT_SUPPORT_SYSTEM_INSTRUCTION }});
        setSupportChatSession(chat);
      } catch (err) { 
        setChatError("Failed to initialize support chat. Ensure API key is valid or check network."); 
        setIsApiKeyAvailable(false); 
      }
    } else { 
      setChatError("Support chat is unavailable: API Key is missing."); 
    }
  }, []);

  const handleOpenChatModal = () => {
    setChatMessages([{ id: Date.now().toString(), sender: 'bot', text: "Hi there! I'm Wanderbot. How can I help you with the Wanderlust AI app today?" }]);
    setIsChatModalOpen(true);
  };

  const handleSendChatMessage = async () => {
    const textToSend = chatInputValue.trim();
    if (!textToSend || isChatLoading || !supportChatSession) return;

    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: textToSend }]);
    setChatInputValue(''); setIsChatLoading(true); setChatError(null);

    let currentBotMessageId = (Date.now() + 1).toString();
    setChatMessages(prev => [...prev, { id: currentBotMessageId, sender: 'bot', text: '', isStreaming: true }]);

    try {
      const stream = await supportChatSession.sendMessageStream({ message: textToSend });
      let accumulatedText = '';
      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        setChatMessages(prev => prev.map(msg => msg.id === currentBotMessageId ? { ...msg, text: accumulatedText, isStreaming: true } : msg));
      }
      setChatMessages(prev => prev.map(msg => msg.id === currentBotMessageId ? { ...msg, text: accumulatedText, isStreaming: false } : msg));
    } catch (err) {
      setChatMessages(prev => prev.filter(msg => msg.id !== currentBotMessageId));
      setChatError(`Failed to get response: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setIsChatLoading(false); }
  };

  useEffect(() => { chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-wrap justify-between items-center gap-3 p-2 sm:p-4 mb-4 sm:mb-6">
          <div className="flex min-w-72 flex-col gap-2 sm:gap-3">
            <h1 className="text-slate-800 dark:text-slate-100 tracking-tight text-2xl sm:text-3xl font-bold leading-tight">Help Center</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-normal leading-normal">Find answers to common questions or contact our support team for assistance.</p>
          </div>
        </div>
        <h2 className="text-slate-800 dark:text-slate-100 text-xl sm:text-2xl font-bold leading-tight tracking-tight px-2 sm:px-4 pb-2 sm:pb-3 pt-4 sm:pt-5">Frequently Asked Questions</h2>
        <div className="flex flex-col p-2 sm:p-4 gap-2 sm:gap-3">
          {MOCK_SUPPORT_FAQS.map((faq: FAQItem) => (
            <details key={faq.id} className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 group transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus:outline-none">
              <summary className="flex cursor-pointer items-center justify-between gap-4 sm:gap-6 py-1.5 sm:py-2 list-none interactive-element" role="button" tabIndex={0}>
                <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base font-medium leading-normal">{faq.question}</p>
                <div className="text-slate-500 dark:text-slate-400 group-open:rotate-180 transition-transform duration-200">
                  <ChevronDownIcon />
                </div>
              </summary>
              <div className="pb-1.5 sm:pb-2 pt-1 sm:pt-1.5 border-t border-slate-200 dark:border-slate-700 prose prose-xs sm:prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{faq.answer}</ReactMarkdown>
              </div>
            </details>
          ))}
        </div>
        <div className="flex justify-end overflow-hidden px-3 sm:px-5 pb-3 sm:pb-5 mt-3 sm:mt-4">
          <button
            onClick={handleOpenChatModal}
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 sm:h-12 px-4 sm:px-5 bg-blue-600 hover:bg-blue-700 text-slate-50 text-sm sm:text-base font-semibold leading-normal tracking-[0.015em] min-w-0 gap-2 sm:gap-2.5 pl-3 sm:pl-4 pr-4 sm:pr-5 shadow-md transition-transform hover:scale-105 focus:outline-none button-interactive"
            aria-label="Open support chat"
          >
            <div className="text-slate-50" data-icon="ChatCircleDots" data-size="24px" data-weight="regular">
              <ChatIcon />
            </div>
            <span className="truncate">Chat with Support</span>
          </button>
        </div>

        {isChatModalOpen && (
          <Modal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            title="Chat with Wanderbot Support"
            size="md"
          >
            <div className="flex flex-col h-[65vh] min-h-[350px]">
              {!isApiKeyAvailable && chatError && (
                  <div className="p-2.5 m-2 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-600 dark:text-red-300 rounded-md text-xs sm:text-sm">
                      <p className="font-bold">Chat Unavailable</p>
                      <p>{chatError}</p>
                  </div>
              )}
              <div className="flex-grow overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex items-end max-w-[85%] gap-2 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    {msg.sender === 'bot' && (<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center mr-1.5 sm:mr-2 self-start shrink-0 p-1 text-blue-600 dark:text-blue-300"><SupportBotIcon /></div>)}
                    <div className={`p-2 sm:p-2.5 shadow-md break-words text-xs sm:text-sm ${ msg.sender === 'user' ? 'bg-blue-600 text-white rounded-xl rounded-br-lg' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 rounded-xl rounded-bl-lg' }`}>
                      <div className={`prose prose-xs sm:prose-sm max-w-none prose-p:my-0.5 ${msg.sender === 'user' ? 'prose-white' : 'dark:prose-invert'}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
                      {msg.isStreaming && <span className="inline-block w-0.5 h-3 ml-1 bg-slate-400 dark:bg-slate-500 animate-pulse"></span>}
                    </div>
                    {msg.sender === 'user' && (<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden ml-1.5 sm:ml-2 self-start shrink-0 bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300">{currentUser?.profileImageUrl ? <img src={currentUser.profileImageUrl} alt="User" className="w-full h-full object-cover" /> : <UserIcon />}</div>)}
                  </div>
                ))}
                <div ref={chatMessagesEndRef} />
              </div>
              {chatError && !chatError.includes("API Key is missing") && <p className="p-1.5 text-red-600 dark:text-red-400 text-xs text-center border-t border-slate-200 dark:border-slate-700">{chatError}</p>}
              <div className="p-2.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <textarea value={chatInputValue} onChange={(e) => setChatInputValue(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChatMessage(); }}} placeholder={!isApiKeyAvailable ? "Support chat unavailable." : (supportChatSession === null ? "Initializing chat..." : "Type your question...")} className="flex-grow p-2 sm:p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm" rows={1} disabled={isChatLoading || !isApiKeyAvailable || supportChatSession === null} aria-label="Support chat input"/>
                  <button onClick={handleSendChatMessage} disabled={isChatLoading || !chatInputValue.trim() || !isApiKeyAvailable || supportChatSession === null} className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 button-interactive" aria-label="Send chat message">{isChatLoading ? <LoadingSpinner size="small" message='' /> : <SendIcon />}</button>
                </div>
              </div>
            </div>
          </Modal>
        )}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-300 dark:bg-slate-600; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { @apply bg-slate-400 dark:bg-slate-500; }
          .prose-xs p, .prose-xs ul, .prose-xs ol {margin-top: 0.25em; margin-bottom: 0.25em;}
          .prose-white strong { color: white !important; }
          .prose-white a { color: #bfdbfe !important; } 
          .prose-white a:hover { color: #93c5fd !important; }
          .dark .prose-invert strong { color: #e2e8f0 !important; } 
          .dark .prose-invert a { color: #60a5fa !important; } 
          .dark .prose-invert a:hover { color: #38bdf8 !important; }
          details summary::-webkit-details-marker { display:none; }
        `}</style>
      </div>
    </div>
  );
};
export default SupportPage;