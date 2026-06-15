"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconMenu2, IconX } from '@tabler/icons-react';

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <header ref={navRef} className="bg-espresso text-linen sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-4 sm:px-6 py-5">
        <Link href="/" className="font-wordmark text-2xl tracking-[4px]">
          Instruktor
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium text-smoke hover:text-linen transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-clay text-linen text-sm font-bold py-2.5 px-5 rounded-xl hover:bg-clay-dark transition-colors"
          >
            Create your page
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 text-linen"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-espresso ${
          open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 sm:px-6 pb-5 flex flex-col gap-3">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-linen"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-clay"
          >
            Create your page
          </Link>
        </div>
      </div>
    </header>
  );
}
