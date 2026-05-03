import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: 'ShopNow - Online Store',
  description: 'Your one-stop shop for everything you need.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
