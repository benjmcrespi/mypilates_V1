"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    // Check initial status on load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    // Listen silently in the background for logins/logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Keep the login page completely blank to maintain focus
  if (pathname === '/login') return null;

  return (
    <header className="py-5 px-4 sm:px-6 border-b border-[#E8E6E1] bg-white sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        
        {/* THE BRAND: Always takes you home */}
        <Link href="/" className="text-xl font-bold tracking-tight text-[#2C2A28] hover:opacity-70 transition-opacity">
          MyPilates.ca
        </Link>

        {/* DYNAMIC LINKS: Changes based on who is looking */}
        <nav className="flex items-center space-x-6">
          {user ? (
            <>
              {pathname !== '/dashboard' && (
                <Link href="/dashboard" className="text-sm font-bold text-[#2C2A28] hover:text-[#7A7571] transition-colors">
                  Instructor Dashboard
                </Link>
              )}
              {pathname === '/dashboard' && (
                <Link href="/" className="text-sm font-semibold text-[#7A7571] hover:text-[#2C2A28] transition-colors">
                  View Live Site
                </Link>
              )}
              <span className="text-[#E8E6E1]">|</span>
              <button onClick={handleSignOut} className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-[#7A7571] hover:text-[#2C2A28] transition-colors">
              Instructor Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}