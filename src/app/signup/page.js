"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Account created! You can now log in to your workspace.");
      // Optional: Auto-redirect to login after a few seconds
      setTimeout(() => router.push('/login'), 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2A28] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-sm font-medium text-[#7A7571] hover:text-[#2C2A28] transition-colors flex items-center space-x-1">
          <span>←</span> <span>Back to Live Schedule</span>
        </Link>
      </div>

      <div className="sm:mx-auto w-full max-w-md text-center px-4">
        <h2 className="text-3xl font-bold tracking-tight text-[#2C2A28]">
          Apply as an Instructor
        </h2>
        <p className="mt-2 text-sm text-[#7A7571]">
          Join the premier hub for independent Pilates instructors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E6E1] rounded-xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2A28] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Hannah Jane"
                className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none bg-[#FAF9F6]/50"
              />
            </div>

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
                minLength="6"
                className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none bg-[#FAF9F6]/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2C2A28] text-white font-medium py-3 rounded-lg hover:bg-[#4A4744] transition-colors disabled:bg-[#A39E99] mt-2 shadow-sm"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#7A7571]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#2C2A28] hover:underline">
              Sign in here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}