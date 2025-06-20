import React from 'react';

interface ContactPageProps {
  onNavigateBack: () => void;
  onNavigateToSupport: () => void;
}

// Icons
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const SupportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 15l2.846-.813a4.5 4.5 0 003.09-3.09L9 7.25l.813 2.846a4.5 4.5 0 003.09 3.09L15 15l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 9l2.846-.813a4.5 4.5 0 00-3.09-3.09L15 1.25l-.813 2.846a4.5 4.5 0 00-3.09 3.09L7.25 9l2.846.813a4.5 4.5 0 003.09 3.09L15 15.75l.813-2.846a4.5 4.5 0 003.09 3.09L21.75 9z" /></svg>;


const ContactPage: React.FC<ContactPageProps> = ({ onNavigateBack, onNavigateToSupport }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 page-transition-enter overflow-y-auto custom-scrollbar">
      <header className="relative h-52 sm:h-72 group">
        <img
          src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
          alt="Contact us background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6 sm:pb-10">
          <button onClick={onNavigateBack} className="absolute top-4 sm:top-6 left-4 sm:left-6 lg:left-8 inline-flex items-center text-xs sm:text-sm text-white hover:text-blue-300 font-medium bg-black/20 hover:bg-black/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors backdrop-blur-sm button-interactive">
            <BackArrowIcon /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            Get In Touch
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <section className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up">
          <p className="text-md sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            We're always happy to hear from you! Whether you have a question, feedback, or just want to say hello, here's how you can reach us.
          </p>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="shrink-0 pt-0.5"><EmailIcon /></div>
              <div>
                <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-200">General Inquiries</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">For general questions, partnerships, or media inquiries, please email us at:</p>
                <a href="mailto:contact@wanderlustai.app" className="text-sm sm:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline break-all">
                  contact@wanderlustai.app
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="shrink-0 pt-0.5"><SupportIcon /></div>
              <div>
                <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-200">App Support & Feedback</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Need help with the app or want to share your feedback? Visit our Support Page:</p>
                <button onClick={onNavigateToSupport} className="text-sm sm:text-base text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium underline button-interactive">
                  Go to Support Page
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
};

export default ContactPage;