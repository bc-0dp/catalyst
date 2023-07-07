import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';

import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Catalyst Store',
  description: 'Example store built with Catalyst',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className={`${inter.variable} font-sans`} lang="en">
      <body className="px-4 md:container md:mx-auto">
        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}