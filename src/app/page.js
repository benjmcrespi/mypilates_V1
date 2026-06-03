"use client"
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-[90vh] bg-linen text-bark flex flex-col justify-center items-center px-4 sm:px-6 text-center">
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Eyebrow Text */}
        <span className="text-sm font-bold tracking-widest uppercase text-stone mb-6 block">
          Instruktor
        </span>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Your schedule,<br />beautifully simplified.
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-stone mb-10 leading-relaxed max-w-2xl mx-auto">
          The all-in-one link-in-bio platform for independent boutique fitness instructors. Consolidate your studio schedules into one seamless booking experience for your students.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-clay text-white font-bold py-4 px-10 rounded-xl hover:bg-clay-dark transition-all active:scale-[0.98] shadow-sm"
          >
            Instructor Login
          </Link>
          <button
            className="w-full sm:w-auto bg-linen border border-sand text-bark font-bold py-4 px-10 rounded-xl hover:bg-clay-light transition-all active:scale-[0.98] shadow-sm"
            onClick={() => alert("Beta applications opening soon!")}
          >
            Apply for Beta
          </button>
        </div>

      </div>
    </div>
  );
}
