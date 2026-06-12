// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Book an Appointment',
  description: 'Book your consultation appointment online — secure, easy, instant confirmation.',
  openGraph: {
    title: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Book an Appointment',
    description: 'Book your consultation appointment online.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
      </head>
      <body className="font-body bg-cream antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1b2a5c',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#E8A020', secondary: '#1b2a5c' } },
          }}
        />
      </body>
    </html>
  );
}
