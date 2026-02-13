import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from '@/context/PlayerContext';
import { GlobalPlayer } from '@/components/feature/player/GlobalPlayer';
import { LocationProvider } from '@/context/LocationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "SonarAura | Intelligent Music for Venues",
  description: "The Sound of Light. Professional background music for business.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LocationProvider>
          <PlayerProvider>
            {children}
            <GlobalPlayer />
          </PlayerProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
