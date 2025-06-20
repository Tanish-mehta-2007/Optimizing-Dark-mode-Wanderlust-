
import React from 'react';

interface AboutUsPageProps {
  onNavigateBack: () => void;
  onNavigateToContactUs: () => void; 
}

// Placeholder Icons (replace with actual SVGs or a library)
const MissionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" /></svg>;
const TeamIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m8.206 0A6.251 6.251 0 0012 14.25a6.251 6.251 0 00-4.942 1.25M12 12.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const ValuesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 dark:text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const BackArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;

const AboutUsPage: React.FC<AboutUsPageProps> = ({ onNavigateBack, onNavigateToContactUs }) => {
  const teamMembers = [
    { name: "Alex Wanderer", role: "Founder & CEO", imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60" },
    { name: "Binary Bard", role: "Lead AI Engineer", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60" },
    { name: "Journey Jess", role: "Head of User Experience", imageUrl: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=100&q=60" },
  ];

  const values = [
    { name: "Innovation", description: "Constantly exploring new AI capabilities to enhance travel planning." },
    { name: "User-Centricity", description: "Designing intuitive and delightful experiences for every traveler." },
    { name: "Adventure", description: "Inspiring and enabling memorable journeys around the globe." },
    { name: "Reliability", description: "Providing trustworthy information and dependable planning tools." },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 page-transition-enter overflow-y-auto custom-scrollbar">
      <header className="relative h-52 sm:h-72 group">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
          alt="Inspiring travel background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6 sm:pb-10">
          <button onClick={onNavigateBack} className="absolute top-4 sm:top-6 left-4 sm:left-6 lg:left-8 inline-flex items-center text-xs sm:text-sm text-white hover:text-blue-300 font-medium bg-black/20 hover:bg-black/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors backdrop-blur-sm button-interactive">
            <BackArrowIcon /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            About Wanderlust AI
          </h1>
          <p className="mt-2 sm:mt-3 text-md sm:text-lg text-slate-100 drop-shadow-md max-w-2xl">
            Revolutionizing how you discover, plan, and experience travel.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
        <section className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="shrink-0"><MissionIcon /></div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">Our Mission</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                At Wanderlust AI, our mission is to empower travelers with intelligent, personalized, and seamless planning tools. We leverage cutting-edge artificial intelligence to transform travel ideas into unforgettable experiences, making exploration easier, more intuitive, and more exciting for everyone.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="shrink-0"><TeamIcon /></div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Meet Our Team (Placeholder)</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                We're a passionate group of travelers, technologists, and dreamers dedicated to building the future of travel planning.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {teamMembers.map((member) => (
                  <div key={member.name} className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <img src={member.imageUrl} alt={member.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-2 sm:mb-3 object-cover shadow-md" />
                    <h4 className="font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200">{member.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="shrink-0"><ValuesIcon /></div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Our Values</h2>
              <ul className="space-y-3 sm:space-y-4">
                {values.map((value) => (
                  <li key={value.name} className="pl-3 sm:pl-4 border-l-4 border-blue-500 dark:border-blue-400">
                    <h4 className="font-semibold text-md sm:text-lg text-slate-700 dark:text-slate-200">{value.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{value.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center py-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 sm:mb-3">Get in Touch</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <p className="mt-2">
             <button onClick={onNavigateToContactUs} className="text-sm sm:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline button-interactive">
              Contact Us
            </button>
          </p>
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

export default AboutUsPage;
