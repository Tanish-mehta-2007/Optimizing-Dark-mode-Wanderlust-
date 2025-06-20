
import React from 'react';

interface PrivacyPolicyPageProps {
  onNavigateBack: () => void;
  onNavigateToContactUs: () => void;
}

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateBack, onNavigateToContactUs }) => {
  const sections = [
    { title: "Introduction", content: "Welcome to Wanderlust AI's Privacy Policy. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us." },
    { title: "Information We Collect", content: "We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, when you participate in activities on the app, or otherwise when you contact us. The personal information we collect may include the following: names, email addresses, passwords, contact preferences, user-generated content such as trip plans and notes, and payment data (processed by third-party payment processors)." },
    { title: "How We Use Your Information", content: "We use personal information collected via our app for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. These purposes include: to facilitate account creation and logon process, to manage user accounts, to send administrative information to you, to Fulfill and manage your bookings, to deliver and facilitate delivery of services to the user, to respond to user inquiries/offer support to users, for other business purposes such as data analysis, identifying usage trends, and to improve our App and your experience." },
    { title: "Information Sharing and Disclosure", content: "We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, Legal Obligations. More specifically, we may need to process your data or share your personal information in the following situations: Business Transfers, Affiliates, Business Partners, with Service Providers for payment processing and AI model access." },
    { title: "Data Security", content: "We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure." },
    { title: "Your Rights", content: "In some regions (like the European Economic Area and United Kingdom), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information." },
    { title: "Changes to This Policy", content: "We may update this privacy notice from time to time. The updated version will be indicated by an updated “Revised” date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information." },
    { title: "Contact Us", content: "If you have questions or comments about this notice, you may contact us." },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen page-transition-enter">
      <header className="relative h-52 sm:h-72 group">
        <img
          src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80"
          alt="Abstract privacy or legal background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6 sm:pb-10">
          <button onClick={onNavigateBack} className="absolute top-4 sm:top-6 left-4 sm:left-6 lg:left-8 inline-flex items-center text-xs sm:text-sm text-white hover:text-blue-300 font-medium bg-black/20 hover:bg-black/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors backdrop-blur-sm">
            <BackArrowIcon /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            Privacy Policy
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {sections.map((section, index) => (
          <section key={section.title} className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4">{section.title}</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300">
              <p>{section.content}</p>
              {section.title === "Contact Us" && (
                <p className="mt-2">
                  Please <button onClick={onNavigateToContactUs} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline">Contact Us</button> for any inquiries.
                </p>
              )}
            </div>
          </section>
        ))}
         <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6 sm:mt-8">Last Updated: {new Date().toLocaleDateString()}</p>
      </main>
        <style>{`
            .prose p { margin-top: 0.5em; margin-bottom: 0.5em;}
            .prose-sm p { font-size: 0.875rem; line-height: 1.625; } /* text-sm */
            @media (min-width: 640px) {
                .sm\\:prose-base p { font-size: 1rem; line-height: 1.75; } /* text-base */
            }
        `}</style>
    </div>
  );
};

export default PrivacyPolicyPage;
