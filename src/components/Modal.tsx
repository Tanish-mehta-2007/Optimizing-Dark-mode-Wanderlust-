
import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footerActions?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; 
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footerActions, size = 'md' }) => {
  
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; 
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md', 
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl',
    xl: 'max-w-xl sm:max-w-2xl',
    '2xl': 'max-w-2xl sm:max-w-3xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-4 transition-opacity duration-300 ease-in-out animate-fadeIn"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-50 rounded-xl shadow-2xl w-full ${sizeClasses[size]} m-2 sm:m-4 transform transition-all duration-300 ease-out opacity-0 animate-fadeInScaleUp ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()} 
        style={{ animationFillMode: 'forwards' }} 
      >
        <div className="flex justify-between items-center p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 sm:p-1.5 rounded-full transition-colors duration-200 button-interactive"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-grow custom-scrollbar">
          <div className="text-slate-600 dark:text-slate-300 prose prose-xs sm:prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-slate-700 dark:prose-strong:text-slate-100 prose-headings:text-slate-700 dark:prose-headings:text-slate-100">
            {children}
          </div>
        </div>
        {footerActions && (
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
            {/* Ensure footer action buttons also get interactive styling if they are actual <button> elements */}
            {React.Children.map(footerActions, child => {
              if (React.isValidElement(child) && typeof child.type === 'string' && child.type === 'button') {
                const childProps = child.props as React.ButtonHTMLAttributes<HTMLButtonElement>;
                let existingClasses = childProps.className || '';
                if (!existingClasses.includes('button-interactive')) {
                    existingClasses += ' button-interactive';
                }
                return React.cloneElement(child as React.ReactElement<any>, {
                  className: existingClasses.trim()
                });
              }
              return child;
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes fadeInScaleUp { 0% { opacity: 0; transform: scale(0.97) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-fadeInScaleUp { animation: fadeInScaleUp 0.3s ease-out; }
        
        /* Tailwind Prose Overrides for Modal Content */
        .prose p, .prose ul, .prose ol, .prose blockquote { 
          @apply text-slate-600 dark:text-slate-300;
        }
        .prose strong {
          @apply text-slate-700 dark:text-slate-100;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          @apply text-slate-800 dark:text-slate-100;
        }
        .prose a {
          @apply text-brand dark:text-brand-light hover:underline;
        }
        .prose code {
          @apply text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 p-0.5 rounded-sm;
        }
        .prose pre {
          @apply bg-slate-100 dark:bg-slate-700 p-2 rounded-md overflow-x-auto;
        }
        .prose blockquote {
          @apply border-l-4 border-slate-300 dark:border-slate-600 pl-3 italic;
        }
        .prose-xs p, .prose-xs ul, .prose-xs ol, .prose-xs blockquote { font-size: 0.8rem; line-height: 1.5; margin-top: 0.6em; margin-bottom: 0.6em; }
        .sm\\:prose-sm p, .sm\\:prose-sm ul, .sm\\:prose-sm ol, .sm\\:prose-sm blockquote { font-size: 0.875rem; line-height: 1.625; margin-top: 0.75em; margin-bottom: 0.75em;}
      `}</style>
    </div>
  );
};

export default Modal;
