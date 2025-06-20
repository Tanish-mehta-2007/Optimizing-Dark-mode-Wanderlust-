import React, { useState, useEffect } from 'react';

export const ImagePlaceholder: React.FC<{className?: string}> = ({ className = "w-full h-40 sm:h-48 bg-slate-200 dark:bg-slate-700 rounded-t-lg flex items-center justify-center" }) => (
  <div className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400 dark:text-slate-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  </div>
);

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className = "w-full h-auto object-cover", 
  placeholderClassName 
}) => {
  const [hasError, setHasError] = useState(!src); // Initialize error state based on src presence

  useEffect(() => {
    setHasError(!src); // Reset error state if src changes
  }, [src]);

  if (hasError || !src) {
    return <ImagePlaceholder className={placeholderClassName || className} />;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)} 
      loading="lazy" 
    />
  );
};
