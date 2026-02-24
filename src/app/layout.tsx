import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import "./globals.css";
import { PlayerProvider } from '@/context/PlayerContext';
import { GlobalPlayer } from '@/components/feature/player/GlobalPlayer';
import { LocationProvider } from '@/context/LocationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: "SonarAura | Intelligent Music for Venues",
    template: "%s | SonarAura"
  },
  description: "The Sound of Light. Professional background music ecosystem for business, hotels, and content creators.",
  keywords: ["royalty free music", "business music", "commercial music license", "background music for hotels", "intelligent audio"],
  authors: [{ name: "Sonaraura Studio" }],
  creator: "Sonaraura Studio",
  publisher: "Sonaraura Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logos/icon.png',
    shortcut: '/logos/icon.png',
    apple: '/logos/icon.png',
  },
  openGraph: {
    title: "SonarAura | Intelligent Music for Venues",
    description: "The Sound of Light. Professional background music ecosystem for business.",
    url: 'https://sonaraura.com',
    siteName: 'SonarAura',
    images: [
      {
        url: 'https://sonaraura.com/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SonarAura - Intelligent Music',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SonarAura | Intelligent Music for Venues",
    description: "The Sound of Light. Professional background music ecosystem for business.",
    images: ['https://sonaraura.com/assets/og-image.png'],
    creator: '@sonaraura',
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-TDKDDM4X" />
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <LocationProvider>
          <PlayerProvider>
            {children}
            <GlobalPlayer />
          </PlayerProvider>
        </LocationProvider>
        <GoogleAnalytics gaId="G-VZNFSYLZ8Y" />
      </body>
    </html>
  );
}
