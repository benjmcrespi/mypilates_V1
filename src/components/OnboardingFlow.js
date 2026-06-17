"use client";
import { useState, useRef } from 'react';

const CARDS = [
  {
    title: 'You became an Instruktor.',
    body: "Welcome. You're not just on a studio's schedule anymore. You have a professional home of your own.",
  },
  {
    title: 'One link. Every class.',
    body: 'Every class you teach, at every studio, lives in one place. Share a single link instead of three different booking pages.',
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
  const touchStartX = useRef(null);

  const isLast = index === CARDS.length - 1;
  const card = CARDS[index];

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex(i => Math.min(i + 1, CARDS.length - 1));
    }
  };

  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

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
    <div className="fixed inset-0 z-[100] bg-espresso text-linen flex flex-col">
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 text-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-md mx-auto animate-in fade-in duration-500" key={index}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
            {card.title}
          </h1>
          <p className="text-smoke text-base sm:text-lg leading-relaxed">
            {card.body}
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 sm:pb-12">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {CARDS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-clay' : 'w-1.5 bg-smoke/30'
              }`}
            />
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <button
            onClick={goNext}
            className={`w-full font-bold py-4 rounded-xl transition-all active:scale-[0.98] ${
              card.cta
                ? 'bg-clay text-linen hover:bg-clay-dark'
                : 'bg-bark text-linen hover:bg-bark/70 border border-white/10'
            }`}
          >
            {card.cta ? "Let's go →" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
