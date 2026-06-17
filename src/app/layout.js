import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import AddToHomeScreen from '@/components/AddToHomeScreen';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cormorant',
});

export const metadata = {
  title: 'Instruktor',
  description: 'Become an Instruktor. Your classes, every studio, one link.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Instruktor',
  },
};

export const viewport = {
  themeColor: '#2C1810',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans">
        <Navbar />
        {children}
        <AddToHomeScreen />
      </body>
    </html>
  );
}