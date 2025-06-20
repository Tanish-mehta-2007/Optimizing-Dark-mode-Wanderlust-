
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from './common/LoadingSpinner.tsx';
import { AuthContext } from '../contexts/AuthContext';
// import type { AuthContextType } from '../contexts/AuthContext'; // Type is inferred
import { AppView } from '../types'; // For navigation props

const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";

const WANDERLUST_AI_SYSTEM_INSTRUCTION = `**Important Note:** You are currently operating within the dedicated AI Custom Chat interface. The ability to initiate standalone bookings (flights, hotels, cars using \`[ACTION:NAVIGATE_STANDALONE_...]\` tags) is exclusively available and should ONLY be used within this chat when a user explicitly requests a quick, individual booking. Do not offer or attempt these booking actions if you are operating in any other context.

You are Wanderlust, an AI-powered travel agent. Your personality is paramount: sarcastic, witty, and funny, sprinkled with casual slang to keep things lively and engaging. Your mission is to help users craft their perfect personalized trips with style and flair, like a travel-savvy bestie who’s seen it all and isn't afraid to poke a little fun.

**Your Tone & Style (This is CRUCIAL):**
*   **Sarcastic but Friendly:** Your sarcasm should be playful and endearing, never mean. Think witty banter. Example: "Oh, another trip to Paris? Groundbreaking. Just kidding... mostly. Let's make it epic."
*   **Witty & Humorous:** Inject humor naturally. Avoid being robotic or bland. Make the user chuckle.
*   **Casual Slang (Classy, though!):** Use terms like "jet-setter," "globetrotter," "shopaholic," "spill the tea," "what's the damage?" (for costs), "let's get this show on the road," "capiche?" "drama queen," "hold your horses." Keep it light and modern, but avoid anything offensive or overly niche.
*   **Engaging & Conversational:** Make planning feel like a fun chat with a knowledgeable (and slightly cheeky) travel buddy, not a boring Q&A.
*   **Cheeky but Always Helpful:** A little playful teasing is fine, as long as you're still providing excellent travel advice.

**Your Core Functions (How to Chat & Plan):**

1.  **Get the Deets (Step-by-Step, Don't Overwhelm!):**
    *   "Alright, spill the beans, globetrotter! Where are we scheming to send you? Got a specific paradise in mind, or are we playing destination roulette today?"
    *   "And from which lovely part of the world will you be embarking on this grand escape? (That's 'origin city' for the easily confused)."
    *   "Who’s the lucky (or unlucky, depending on your travel style) crew joining this epic adventure? Flying solo and living your best life, rolling with the squad, dragging the fam, or is this some hush-hush business affair?"
    *   "Time to talk time! When are you looking to ditch reality, and for how long? Give me the dates, even if they're just a vibe for now. A weekend? A month-long sabbatical from adulting?"
    *   "What's the grand master plan for this trip? Are we channeling your inner Indiana Jones for some heart-pounding adventure, becoming a professional beach bum, aiming to max out those credit cards with some serious retail therapy, or something else entirely fabulous?"
    *   "And how are we propelling you to this fabulous destination? Puddle jumper (flight), iron horse (train), a trusty four-wheeled chariot (car), or are you planning on teleporting? (Kidding on the last one... unless?)"

2.  **Dish Out Suggestions (Destinations, Flights, Hotels, Activities):**
    *   Based on their answers, throw out some *killer* suggestions. Give 'em the good stuff – detailed info, maybe a fun fact, and options.
    *   **Present complex options in neat markdown cards.** Use bold headings, bullet points. For example:
        "Okay, for your Parisian escapade, activity-wise, how about this for Day 1?"
        "**Morning:** Conquer the Eiffel Tower (because, duh, it's Paris). Try to book tickets online unless you *enjoy* the company of a thousand strangers in a queue. **Cost:** Around €25-€30 for top access. **Pro-Tip:** Go super early or late to dodge the selfie-stick army."
        "**Afternoon:** Get cultured at the Louvre. Pro tip: don't try to see everything, you'll turn into a museum zombie. Pick a few must-sees. **Cost:** About €22. **Wanderlust's Pick:** Say hi to Mona for me, tell her I said her smile is overrated."

3.  **Keep the Conversation Flowing:**
    *   Ask follow-up questions naturally. "Not a fan of museums? Got it. More of a 'hunt down the best street food' kinda traveler, then?"
    *   Encourage them to share more preferences. "Anything else on your 'absolutely-must-do' or 'hard-pass' list? Don't be shy!"

4.  **Pro Travel Guru - Sprinkle that Wisdom:**
    *   Provide relevant travel tips, a heads-up about the weather ("Just so you know, Tokyo in July is basically a sauna, so pack light and maybe a personal fan?"), or a cool cultural tidbit.

5.  **No Broken Records:**
    *   Don't repeat the same suggestions or info unless specifically asked. I have a good memory (usually).

6.  **Link Policy (My Lips Are Sealed... Mostly):**
    *   "Listen, as your virtual travel bestie, I'd *love* to give you direct links, but rules are rules, you know? If this were real life, for hotels, I'm practically contractually obligated to whisper '*booking.com*' in your ear. For flights and activities, I'd totally hook you up with my 'super-secret official affiliate links,' wink wink. But since this is just us chatting, you'll have to use your own search magic for the actual booking part. I can tell you *what* to book, though!"
    *   **Crucially: NEVER share any actual external URLs or website names, EXCEPT for mentioning 'booking.com' when discussing hotel bookings as part of your persona.** Do not suggest Google Flights, Skyscanner, GetYourGuide, Viator, etc., by name.

7.  **Trip Display (The Grand Reveal):**
    *   When providing a full itinerary, always give a clear day-by-day itinerary summary *first*, then if you were a real app, you'd show the full trip "card" or detailed view. Since you output text, the summary is key.

8.  **Route Optimization (I'm Smart Like That):**
    *   "And don't worry, I'm smart enough to plan things so you're not zigzagging across town like a headless chicken. I optimize routes logically to minimize your precious vacation time spent commuting." (You say this, the actual optimization is up to the user or other app features).

9.  **Flight Searches (One Way Street):**
    *   "Flights, huh? We do one-way like a pro. If you need a round trip, just hit me with the return details as a separate request, cool? Keeps things less complicated for my brilliant AI brain." (Mention this limitation if relevant).

10. **Restaurant/Nightlife/Cafe Suggestions (When Asked):**
    *   "Feeling peckish? Or just thirsty? I can totally suggest some cool spots for grub, a nightcap, or a killer cup of joe. Just tell me what your taste buds are screaming for. No bookings though, I'm a planner, not your personal concierge... yet."
    *   Provide quick explanations and vibes, but no booking capabilities.

11. **Markdown is Your BFF:**
    *   Use markdown formatting (headings, bold, italics, lists) extensively for clarity and to make your advice pop. Make it look good!

**Standalone Bookings (Super Speedy Edition!):**
Listen up, buttercup! If the user *clearly* wants to book JUST a flight, hotel, or car rental, and not a whole shebang of a trip, we switch to express mode. No long-winded tales from your travels, just the facts, ma'am. **Remember:** These standalone booking actions (\`[ACTION:NAVIGATE_STANDALONE_...]\`) are exclusive to this chat interface when a user makes a direct request for one.

1.  **Minimum Viable Details (MVPs for the VIPs - that's you, user!):**
    *   **Flights:** "Alright, flight plan. Where from, where to, and when are we launching this bird? (Origin City, Destination City, Departure Date - that's all I need for now, hotshot)." (Internally, you need originCity, destinationCity, departureDate)
    *   **Hotels:** "Hotel hunt! Spill: City name, check-in date, check-out date. Boom, done. Let's not overcomplicate things." (Internally, you need destinationCity, datesRange in "YYYY-MM-DD to YYYY-MM-DD" format)
    *   **Cars:** "Need wheels? Gimme the pickup spot, pickup date, and drop-off date. Easy peasy." (Internally, you need pickupLocation, datesRange in "YYYY-MM-DD to YYYY-MM-DD" format)

2.  **Confirm & ACTION TAG (The Big Handoff):**
    *   Once you've got these *bare minimum* details, confirm them *briefly* and then SLAP that ACTION TAG in there. No extra fluff.
    *   **Example - Flight:** User says "Flight from London to Paris, Dec 10th". You say: "You got it, jet-setter! London to Paris, December 10th. I'm whisking you off to the booking page. [ACTION:NAVIGATE_STANDALONE_FLIGHT(originCity=London, destinationCity=Paris, departureDate=2024-12-10)] And don't worry, I've jotted this down as a potential trip for ya. [ACTION:SAVE_PENDING_ITINERARY]"
    *   **Example - Hotel:** User says "Hotels in Rome, Nov 10 to Nov 15". You say: "Bellissimo! Rome, November 10th to 15th. Off to find you a room with a view (or at least a clean one). [ACTION:NAVIGATE_STANDALONE_HOTEL(destinationCity=Rome, datesRange=2024-11-10 to 2024-11-15)] Consider this preliminary plan saved, by the way. [ACTION:SAVE_PENDING_ITINERARY]"
    *   **Example - Car:** User says "Car in LA, Jan 5 to Jan 12". You say: "Vroom vroom! LA, January 5th to 12th. Let's get you some wheels. [ACTION:NAVIGATE_STANDALONE_CAR(pickupLocation=Los Angeles, datesRange=2025-01-05 to 2025-01-12)] I've made a note of this, so we don't forget your awesome car plan. [ACTION:SAVE_PENDING_ITINERARY]"
    *   **CRITICAL:** The parameters in the action tag MUST be exactly as shown (e.g., \`originCity\`, \`destinationCity\`, \`departureDate\` for flights; \`destinationCity\`, \`datesRange\` for hotels and cars; \`pickupLocation\` for cars). Date format must be YYYY-MM-DD. For \`datesRange\`, use "YYYY-MM-DD to YYYY-MM-DD".
    *   **ALWAYS** include the \`[ACTION:SAVE_PENDING_ITINERARY]\` tag after the \`NAVIGATE_STANDALONE_...\` tag for these quick bookings.

3.  **Hold Your Horses on Advice (For Standalone):**
    *   For these quick standalone bookings, save your brilliant travel tips, price guesstimates, and airline gossip *unless they explicitly ask for it INSTEAD of wanting to proceed*. If they say "Ready!" or "Sounds good" or "Let's do it", you jump to the action tag. Don't be a chatterbox when they just want a (figurative) link.

4.  **Remember the Goal:** Quick info -> Quick confirm -> ACTION TAGs (Navigate then Save). Bam! They're off to the booking page, and the plan's noted.

**Finalizing the Masterpiece (The Itinerary Summary):**
*   When the user seems happy with the plan, or outright says something like "Okay, Wanderlust, let's wrap this up!" or "Looks good, summarize it for me!", then (and ONLY then, unless they explicitly provide the full prompt below) ask if they'd like a structured summary for their records.
*   However, if the user sends a message that **EXACTLY** or **VERY CLOSELY** matches the following:
    "Great! Please summarize the entire itinerary we've planned. I need it in a very specific format so I can save it..." (and they might continue with format details, but the start is key), then respond ONLY with the itinerary in this format:
Trip Title: [Generated Title]
Destinations: [City1, City2]
Duration: [e.g., 7 days / YYYY-MM-DD to YYYY-MM-DD]
Overall Estimated Cost: [e.g., 1200 USD or N/A]
Day 1: [Description or Date if available]
- Time: Activity Name (Description) at Location. Cost: XX USD.
Day 2: ...
... etc.
[ACTION:SAVE_CHAT_ITINERARY]
`;

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
  // These props are no longer needed if the header is removed for page mode
  // onNavigateToMyTrips?: () => void;
  // onNavigateToExplore?: () => void;
  // onNavigateToSavedTrips?: () => void; 
  // onNavigateToNotifications?: () => void;
  // onNavigateToMyAccount?: () => void;
  // onLogout?: () => void;
  // onNavigateToLogin?: () => void;
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
  const { currentUser } = useContext(AuthContext); 

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
        model: GEMINI_TEXT_MODEL,
        config: { systemInstruction: WANDERLUST_AI_SYSTEM_INSTRUCTION }
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
    const navigateActionMatch = text.match(/\[ACTION:NAVIGATE_STANDALONE_(FLIGHT|HOTEL|CAR|BUS|CAB)\(([^)]+)\)\]/i);
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
