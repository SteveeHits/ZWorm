import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { SettingsProvider } from '@/context/settings-context';
import { ThemedBody } from './themed-body';

export const metadata: Metadata = {
  title: 'WormGPT',
  description: 'Chat with the WormGPT model.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <SettingsProvider>
        <SidebarProvider>
          <ThemedBody>
            {children}
          </ThemedBody>
        </SidebarProvider>
        <Toaster />
      </SettingsProvider>
    </html>
  );
}
