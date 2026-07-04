'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { LanguageProvider } from '@/context/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Registrar el service worker (habilita las notificaciones de fin de descanso → Pixel Watch).
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* SW opcional — ignorar */ });
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
