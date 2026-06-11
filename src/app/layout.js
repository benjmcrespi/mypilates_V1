import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });
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
    <html lang="en">
      <body className={`${inter.className} ${cormorant.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}