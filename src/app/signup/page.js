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
  const [showPassword, setShowPassword] = useState(false);
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
          Instructor Sign Up
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength="6"
                  className="w-full border border-[#E8E6E1] rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-black outline-none bg-[#FAF9F6]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7A7571] hover:text-[#2C2A28]"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
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