"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2A28] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* BACK TO HOME BUTTON */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-sm font-medium text-[#7A7571] hover:text-[#2C2A28] transition-colors flex items-center space-x-1">
          <span>←</span> <span>Back to Live Schedule</span>
        </Link>
      </div>

      <div className="sm:mx-auto w-full max-w-md text-center px-4">
        <h2 className="text-3xl font-bold tracking-tight text-[#2C2A28]">
          Instructor Workspace
        </h2>
        <p className="mt-2 text-sm text-[#7A7571]">
          Sign in to manage your public schedules and links.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E6E1] rounded-xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2A28] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hannah@example.com"
                className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none bg-[#FAF9F6]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2A28] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none bg-[#FAF9F6]/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2C2A28] text-white font-medium py-3 rounded-lg hover:bg-[#4A4744] transition-colors disabled:bg-[#A39E99] mt-2 shadow-sm"
            >
              {isLoading ? "Verifying..." : "Sign In"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}