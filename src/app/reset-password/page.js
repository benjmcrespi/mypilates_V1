"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // The reset link signs the user into a temporary recovery session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setIsReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-linen text-bark flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto w-full max-w-md text-center px-4">
        <h2 className="text-3xl font-bold tracking-tight text-bark">
          Set a New Password
        </h2>
        <p className="mt-2 text-sm text-stone">
          Choose a new password for your Instruktor account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-sand rounded-xl sm:px-10">

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {success ? (
            <div className="p-3 bg-sage-light border border-sage text-bark text-sm rounded-lg font-medium text-center">
              Your password has been updated. Redirecting to your dashboard...
            </div>
          ) : !isReady ? (
            <div className="p-3 bg-clay-light border border-sand text-bark text-sm rounded-lg font-medium text-center">
              Verifying your reset link...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-bark mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-sand rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-clay outline-none bg-linen/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone hover:text-bark"
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

              <div>
                <label className="block text-sm font-medium text-bark mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-sand rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-clay outline-none bg-linen/50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-clay text-white font-medium py-3 rounded-lg hover:bg-clay-dark transition-colors disabled:opacity-50 mt-2 shadow-sm"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-stone">
            <Link href="/login" className="font-medium text-bark hover:underline">
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
