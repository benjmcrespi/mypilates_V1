"use client";
import { useState, useRef, useEffect, useCallback } from 'react';

const CARDS = [
  {
    title: 'You became an Instruktor.',
    body: "Welcome. You're not just on a studio's schedule anymore. You have a professional home of your own.",
  },
  {
    title: 'One link. Every class.',
    body: 'Every class you teach, at every studio, lives in one place. Share a single link instead of multiple booking links.',
  },
  {
    title: 'Your brand. Your page.',
    body: 'instruktor.ca/yourhandle is yours. Your photo, your bio, your schedule, built around you and not the studio.',
  },
  {
    title: 'Your students follow you.',
    body: "Students can follow you and get notified the moment you add new classes. Your following travels with you, wherever you teach.",
  },
  {
    title: "We're just getting started.",
    body: 'Student reviews, audition analytics, and a verification badge are all on the way. Early members get them first.',
  },
  {
    title: "Let's build your profile.",
    body: 'Add your photo and bio, connect your studios, and publish your schedule. It only takes a few minutes.',
    cta: true,
  },
];

export default function OnboardingFlow({ onComplete }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const touchStartX = useRef(null);

  const total = CARDS.length;
  const isLast = index === total - 1;
  const card = CARDS[index];

  // Keep refs current so the once-bound keyboard listener and the completion
  // check always read live values instead of a stale render closure.
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Functional state updates keep these handlers stable (empty deps) and always
  // correct, so the single `index` state is the only source of truth.
  const goNext = useCallback(() => {
    if (indexRef.current >= CARDS.length - 1) {
      onCompleteRef.current?.();
      return;
    }
    setIndex((i) => Math.min(CARDS.length - 1, i + 1));
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Keyboard navigation: arrow keys / Enter. When a button is focused, let its
  // own click handler fire instead of double-advancing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Enter') {
        if (document.activeElement?.tagName === 'BUTTON') return;
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-espresso text-linen select-none">
      {/* Ambient clay glow, warmer on the final card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-3/5"
        style={{
          background: isLast
            ? 'radial-gradient(120% 75% at 50% 0%, rgba(184,90,53,0.30), transparent 62%)'
            : 'radial-gradient(120% 75% at 50% 0%, rgba(184,90,53,0.14), transparent 62%)',
          transition: 'background 500ms ease',
        }}
      />

      {/* Header: wordmark + step counter */}
      <header
        className="relative flex items-center justify-between px-6"
        style={{ paddingTop: 'max(2rem, calc(env(safe-area-inset-top) + 1rem))' }}
      >
        <span className="font-serif text-xl tracking-[0.18em] text-linen">Instruktor</span>
        <span className="font-mono text-xs tracking-[0.22em] text-smoke">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </header>

      {/* Segmented progress bar */}
      <div className="relative mt-6 px-6">
        <div className="mx-auto flex max-w-md gap-1.5">
          {CARDS.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-linen/15">
              <div
                className="h-full rounded-full bg-clay transition-[width] duration-500 ease-out"
                style={{ width: i <= index ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Card content (crossfades in on each step) */}
      <main
        className="relative flex flex-1 flex-col justify-center px-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={index} className="onboarding-card-in mx-auto w-full max-w-md">
          <h1 className="mb-5 font-serif text-[2.25rem] font-medium leading-[1.05] text-linen sm:text-5xl">
            {card.title}
          </h1>
          <p className="max-w-[38ch] text-base leading-relaxed text-smoke sm:text-lg">
            {card.body}
          </p>
        </div>
      </main>

      {/* Footer controls */}
      <footer
        className="relative px-6 pt-4"
        style={{ paddingBottom: 'max(2.5rem, calc(env(safe-area-inset-bottom) + 1.5rem))' }}
      >
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={goNext}
            className={`w-full rounded-xl py-4 font-semibold tracking-wide transition-transform duration-150 active:scale-[0.98] ${
              isLast
                ? 'bg-clay text-linen hover:bg-clay-dark shadow-[0_12px_34px_-10px_rgba(184,90,53,0.6)]'
                : 'bg-linen text-espresso hover:bg-white'
            }`}
          >
            {isLast ? 'Build my profile →' : 'Continue'}
          </button>
          <div className="mt-3 flex h-6 items-center justify-center">
            {index > 0 && (
              <button
                onClick={goPrev}
                className="font-mono text-xs uppercase tracking-[0.2em] text-smoke transition-colors hover:text-linen"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
