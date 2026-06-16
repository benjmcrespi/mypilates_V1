"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnfollowPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [state, setState] = useState('loading'); // loading | success | error
  const [instructorName, setInstructorName] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }

    fetch('/api/unfollow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.instructor_name) {
          setInstructorName(data.instructor_name);
          setState('success');
        } else {
          setState('error');
        }
      })
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-linen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-sand rounded-2xl shadow-sm p-10 text-center">
        <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-6">Instruktor</p>

        {state === 'loading' && (
          <p className="text-stone text-sm">Processing…</p>
        )}

        {state === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-bark mb-3">You've been unfollowed</h1>
            <p className="text-stone text-sm leading-relaxed mb-8">
              You've been unfollowed from <strong className="text-bark">{instructorName}</strong>. You won't receive any more emails about their schedule.
            </p>
            <Link
              href="/"
              className="inline-block bg-clay text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-clay-dark transition-colors"
            >
              Back to Instruktor
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-bark mb-3">Link not found</h1>
            <p className="text-stone text-sm leading-relaxed">
              This unsubscribe link is invalid or has already been used.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
