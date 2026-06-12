"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [handle, setHandle] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check initial status on load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('handle')
          .eq('id', session.user.id)
          .single();
        setHandle(data?.handle || null);
      }
    };
    checkUser();

    // Listen silently in the background for logins/logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) setHandle(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Keep the auth pages completely blank to maintain focus
  if (pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password') return null;

  // Landing page has its own custom nav
  if (pathname === '/') return null;

  return (
    <header className="py-5 px-4 sm:px-6 border-b border-sand bg-white sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-4xl mx-auto flex justify-between items-center">

        {/* THE BRAND: Always takes you home */}
        <Link href="/" className="font-wordmark text-2xl tracking-[4px] text-espresso hover:opacity-70 transition-opacity">
          Instruktor
        </Link>

        {/* DYNAMIC LINKS: Changes based on who is looking */}
        <nav className="flex items-center space-x-6">
          {user ? (
            <>
              {pathname !== '/dashboard' && (
                <Link href="/dashboard" className="text-sm font-bold text-bark hover:text-stone transition-colors">
                  <span className="sm:hidden">Dashboard</span>
                  <span className="hidden sm:inline">Instructor Dashboard</span>
                </Link>
              )}
              {pathname === '/dashboard' && (
                <Link href={handle ? `/${handle}` : '/'} data-tour="view-live-site" className="text-sm font-semibold text-stone hover:text-bark transition-colors">
                  View Live Site
                </Link>
              )}
              <span className="text-sand">|</span>
              <button onClick={handleSignOut} className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-stone hover:text-bark transition-colors">
              Instructor Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
