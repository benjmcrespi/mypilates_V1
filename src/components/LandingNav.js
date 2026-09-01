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
    <header ref={navRef} className="bg-espresso text-linen sticky top-0 z-50 border-b border-linen/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-10 py-6">
        <Link href="/" className="font-wordmark font-semibold text-xl sm:text-2xl tracking-[0.14em]">
          Instruktor
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9">
          <Link href="/login" className="ik-nav-link text-[11px] font-medium tracking-[0.14em] uppercase text-smoke hover:text-linen">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-[11px] font-bold tracking-[0.14em] uppercase text-linen border border-linen/35 rounded-[2px] py-2.5 px-5 hover:border-linen hover:bg-linen/5 transition-colors duration-[450ms]"
          >
            Create Your Page
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
        <div className="px-4 sm:px-10 pb-6 flex flex-col items-end gap-4 text-right">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-[11px] font-medium tracking-[0.14em] uppercase text-linen"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="text-[11px] font-bold tracking-[0.14em] uppercase text-clay"
          >
            Create Your Page
          </Link>
        </div>
      </div>
    </header>
  );
}
