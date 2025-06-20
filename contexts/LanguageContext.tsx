import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { UserPreferences, SupportedLanguage } from '../types';
import { getUserPreferences, saveUserPreferences } from '../src/services/storageService'; // Corrected path
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../src/constants';

type Translations = Record<string, string>;

interface LanguageContextType {
  language: SupportedLanguage; // e.g., 'en', 'es'
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, substitutions?: Record<string, string>) => string;
  translations: Translations;
  currentCountryCode: string | null;
  currentCountryName: string | null;
  currentLanguageName: string; // e.g., "English (US)"
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const storedPrefs = getUserPreferences();
    return storedPrefs?.language || DEFAULT_LANGUAGE;
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true);

  const [currentCountryCode, setCurrentCountryCode] = useState<string | null>(null);
  const [currentCountryName, setCurrentCountryName] = useState<string | null>(null);
  const [currentLanguageName, setCurrentLanguageName] = useState<string>('');


  useEffect(() => {
    const selectedLangConfig = SUPPORTED_LANGUAGES.find(l => l.langCode === language) || SUPPORTED_LANGUAGES.find(l => l.langCode === DEFAULT_LANGUAGE);
    if (selectedLangConfig) {
      setCurrentCountryCode(selectedLangConfig.countryCode);
      setCurrentCountryName(selectedLangConfig.countryName);
      setCurrentLanguageName(selectedLangConfig.name);
    }

    const loadTranslations = async () => {
      setIsLoadingTranslations(true);
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          console.error(`Failed to load translations for ${language}: ${response.statusText}. Falling back to default.`);
          if (language !== DEFAULT_LANGUAGE) {
            setLanguageState(DEFAULT_LANGUAGE); // This will trigger another useEffect run
            return;
          }
          throw new Error(`Failed to load default translations (${DEFAULT_LANGUAGE}).`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Error loading translations:", error);
        setTranslations({}); // Set to empty or load fallback EN translations directly if robust error handling needed
      } finally {
        setIsLoadingTranslations(false);
      }
    };
    loadTranslations();
  }, [language]);

  const setLanguage = useCallback((newLanguageCode: SupportedLanguage) => {
    setLanguageState(newLanguageCode);
    const currentPrefs = getUserPreferences() || { theme: 'light' } as UserPreferences; // Ensure theme is preserved or has a default
    const updatedPrefs: UserPreferences = { ...currentPrefs, language: newLanguageCode };
    saveUserPreferences(updatedPrefs);
  }, []);

  const t = useCallback((key: string, substitutions?: Record<string, string>): string => {
    if (isLoadingTranslations) return key; // Or some loading indicator string

    let translation = translations[key] || key; // Fallback to key if not found
    if (substitutions) {
      Object.entries(substitutions).forEach(([subKey, subValue]) => {
        translation = translation.replace(new RegExp(`{{${subKey}}}`, 'g'), subValue);
      });
    }
    return translation;
  }, [translations, isLoadingTranslations]);

  return (
    <LanguageContext.Provider value={{ 
        language, 
        setLanguage, 
        t, 
        translations, 
        currentCountryCode, 
        currentCountryName,
        currentLanguageName
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};