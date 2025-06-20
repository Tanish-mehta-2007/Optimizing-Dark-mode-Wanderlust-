
import React from 'react';

interface TermsOfServicePageProps {
  onNavigateBack: () => void;
}

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigateBack }) => {
  const sections = [
    { title: "1. Acceptance of Terms", content: "By accessing or using the Wanderlust AI application ('App'), you agree to be bound by these Terms of Service ('Terms'). If you disagree with any part of the terms, then you may not access the App. This App is offered and available to users who are 13 years of age or older." },
    { title: "2. Changes to Terms", content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion." },
    { title: "3. Use of the App", content: "You agree to use the App only for lawful purposes and in accordance with these Terms. You agree not to use the App in any way that violates any applicable federal, state, local, or international law or regulation." },
    { title: "4. Intellectual Property", content: "The App and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Wanderlust AI and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Wanderlust AI." },
    { title: "5. User Content", content: "You are responsible for any content you provide, including its legality, reliability, and appropriateness. By providing content to the App, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the App." },
    { title: "6. Termination", content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms." },
    { title: "7. Disclaimer", content: "Your use of the App is at your sole risk. The App is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. The App is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance." },
    { title: "8. Governing Law", content: "These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Wanderlust AI is established, without regard to its conflict of law provisions." },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 page-transition-enter overflow-y-auto custom-scrollbar">
      <header className="relative h-52 sm:h-72 group">
        <img
          src="https://images.unsplash.com/photo-1555099962-4199c345e541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
          alt="Abstract legal or document background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6 sm:pb-10">
          <button onClick={onNavigateBack} className="absolute top-4 sm:top-6 left-4 sm:left-6 lg:left-8 inline-flex items-center text-xs sm:text-sm text-white hover:text-blue-300 font-medium bg-black/20 hover:bg-black/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors backdrop-blur-sm button-interactive">
            <BackArrowIcon /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            Terms of Service
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {sections.map((section, index) => (
          <section key={section.title} className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4">{section.title}</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300">
              <p>{section.content}</p>
            </div>
          </section>
        ))}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6 sm:mt-8">Last Updated: {new Date().toLocaleDateString()}</p>
      </main>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            .prose p { margin-top: 0.5em; margin-bottom: 0.5em;}
            .prose-sm p { font-size: 0.875rem; line-height: 1.625; } /* text-sm */
            @media (min-width: 640px) {
                .sm\\:prose-base p { font-size: 1rem; line-height: 1.75; } /* text-base */
            }
        `}</style>
    </div>
  );
};

export default TermsOfServicePage;
