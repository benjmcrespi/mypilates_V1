import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

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
  description: 'Become an Instruktor — your classes, every studio, one link.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}