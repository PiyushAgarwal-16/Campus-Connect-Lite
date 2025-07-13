import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { EventProvider } from '@/contexts/EventContext';
import { RegistrationProvider } from '@/contexts/RegistrationContext';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'CampusConnect Lite',
  description: 'Your one-stop platform for campus events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background">
        <AuthProvider>
          <EventProvider>
            <RegistrationProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                  {children}
                </main>
              </div>
              <Toaster />
            </RegistrationProvider>
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
