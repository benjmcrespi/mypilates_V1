"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-linen text-bark flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="absolute top-6 left-6">
        <Link href="/login" className="text-sm font-medium text-stone hover:text-bark transition-colors flex items-center space-x-1">
          <span>←</span> <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="sm:mx-auto w-full max-w-md text-center px-4">
        <h2 className="text-3xl font-bold tracking-tight text-bark">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-stone">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-sand rounded-xl sm:px-10">

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {submitted ? (
            <div className="p-3 bg-sage-light border border-sage text-bark text-sm rounded-lg font-medium text-center">
              Check your inbox — we've sent a password reset link to {email}.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-bark mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hannah@example.com"
                  className="w-full border border-sand rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-clay outline-none bg-linen/50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-clay text-white font-medium py-3 rounded-lg hover:bg-clay-dark transition-colors disabled:opacity-50 mt-2 shadow-sm"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-stone">
            Remembered your password?{' '}
            <Link href="/login" className="font-medium text-bark hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
