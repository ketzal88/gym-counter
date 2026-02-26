'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/db';
import es from '@/locales/es';
import en from '@/locales/en';

export type Locale = 'es' | 'en';

export type TranslationDict = typeof es;

const dictionaries: Record<Locale, TranslationDict> = { es, en };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dict: TranslationDict;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'es',
  setLocale: () => {},
  t: (key: string) => key,
  dict: es,
});

export const useLanguage = () => useContext(LanguageContext);

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'es';
  const lang = navigator.language || '';
  return lang.startsWith('en') ? 'en' : 'es';
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [locale, setLocaleState] = useState<Locale>('es');
  const [initialized, setInitialized] = useState(false);

  // Initialize locale from localStorage or browser detection
  useEffect(() => {
    const stored = localStorage.getItem('gymcounter_locale') as Locale | null;
    if (stored && (stored === 'es' || stored === 'en')) {
      setLocaleState(stored);
    } else {
      setLocaleState(detectBrowserLocale());
    }
    setInitialized(true);
  }, []);

  // Update HTML lang attribute
  useEffect(() => {
    if (initialized) {
      document.documentElement.lang = locale;
    }
  }, [locale, initialized]);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('gymcounter_locale', newLocale);

    // Sync to Firestore if user is authenticated
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { locale: newLocale });
      } catch (error) {
        console.error('Error saving locale preference:', error);
      }
    }
  }, [user]);

  const t = useCallback((key: string): string => {
    const value = getNestedValue(dictionaries[locale] as unknown as Record<string, unknown>, key);
    if (typeof value === 'string') return value;
    // Fallback to Spanish, then to key itself
    if (locale !== 'es') {
      const fallback = getNestedValue(dictionaries.es as unknown as Record<string, unknown>, key);
      if (typeof fallback === 'string') return fallback;
    }
    return key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dict: dictionaries[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
};
