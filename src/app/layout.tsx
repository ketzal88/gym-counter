import type { Metadata, Viewport } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: 'GymCounter - Protocolos de entrenamiento de 180 días',
    template: '%s | GymCounter',
  },
  description: 'Protocolos de 180 días con progresión automática. 7 programas especializados que se adaptan a tu objetivo, nivel y disponibilidad. Tracking completo. Funciona offline.',
  keywords: [
    'gym tracker', 'workout tracker', 'entrenamiento', 'rutina gym',
    'progresión automática', 'plan de entrenamiento', 'fitness app',
    'gym counter', 'workout log', 'exercise tracker',
    'hypertrophy', 'strength training', 'periodización',
  ],
  authors: [{ name: 'GymCounter' }],
  creator: 'GymCounter',
  publisher: 'GymCounter',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GymCounter',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    alternateLocale: 'en_US',
    siteName: 'GymCounter',
    title: 'GymCounter - Protocolos de entrenamiento de 180 días',
    description: 'Protocolos de 180 días con progresión automática. 7 programas especializados. Tracking completo. Funciona offline. Comenzá gratis.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'GymCounter - Tu protocolo de entrenamiento',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'GymCounter - Protocolos de entrenamiento de 180 días',
    description: 'Protocolos de 180 días con progresión automática. 7 programas. Tracking completo. Funciona offline.',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${lexend.variable} font-sans antialiased bg-slate-50 text-slate-900`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
