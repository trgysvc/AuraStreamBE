import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from '@/context/PlayerContext';
import { GlobalPlayer } from '@/components/feature/player/GlobalPlayer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "AuraStream",
  description: "AI-Powered Background Music Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <PlayerProvider>
          {children}
          <GlobalPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
