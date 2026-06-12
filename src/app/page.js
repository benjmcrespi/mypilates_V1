import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-linen text-bark">

      {/* 1. Nav */}
      <header className="bg-espresso text-linen sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-4 sm:px-6 py-5">
          <Link href="/" className="font-wordmark text-2xl tracking-[4px]">
            Instruktor
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium text-smoke hover:text-linen transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-clay text-linen text-sm font-bold py-2.5 px-5 rounded-xl hover:bg-clay-dark transition-colors"
            >
              Create your page
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. Hero */}
      <section className="bg-espresso text-linen px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-clay border border-clay/40 rounded-full px-4 py-1.5 mb-8">
            Beta · Vancouver, BC
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight mb-6 leading-tight">
            Become an Instruktor.
          </h1>
          <p className="text-lg sm:text-xl text-smoke mb-10 leading-relaxed max-w-2xl mx-auto">
            Your classes. Every studio. One link. The professional home for fitness instructors who teach at more than one studio.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-clay text-linen font-bold py-4 px-10 rounded-xl hover:bg-clay-dark transition-all active:scale-[0.98] shadow-sm"
            >
              Create your page →
            </Link>
            <span className="text-sm text-smoke">Free during beta.</span>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="bg-linen px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <span className="block text-center text-xs font-bold tracking-widest uppercase text-stone mb-4">
            How it works
          </span>
          <div className="grid sm:grid-cols-3 gap-8 mt-10">
            <div className="bg-white border border-sand rounded-xl p-8 text-center">
              <div className="text-clay text-sm font-bold tracking-widest uppercase mb-4">Step 1</div>
              <h3 className="text-xl font-bold mb-3">Add your studios</h3>
              <p className="text-stone leading-relaxed">
                Connect each studio&apos;s calendar and booking link once.
              </p>
            </div>
            <div className="bg-white border border-sand rounded-xl p-8 text-center">
              <div className="text-clay text-sm font-bold tracking-widest uppercase mb-4">Step 2</div>
              <h3 className="text-xl font-bold mb-3">Pull your schedule</h3>
              <p className="text-stone leading-relaxed">
                All classes from all studios populate in one tap.
              </p>
            </div>
            <div className="bg-white border border-sand rounded-xl p-8 text-center">
              <div className="text-clay text-sm font-bold tracking-widest uppercase mb-4">Step 3</div>
              <h3 className="text-xl font-bold mb-3">Share your link</h3>
              <p className="text-stone leading-relaxed">
                One URL for students to find every class you teach, wherever you teach it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The professional case */}
      <section className="bg-bark text-linen px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Your career, professionally managed.
          </h2>
          <p className="text-lg text-smoke leading-relaxed">
            Every photographer has a portfolio. Every professional has a LinkedIn. Instruktor is the professional home fitness instructors have always needed — a profile, a following, and a track record that travels with you.
          </p>
        </div>
      </section>

      {/* 5. Coming soon */}
      <section className="bg-linen px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <span className="block text-center text-xs font-bold tracking-widest uppercase text-stone mb-4">
            Coming soon
          </span>
          <p className="text-center text-stone mb-10 max-w-2xl mx-auto">
            Early members get these first.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white border border-sand rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold mb-3">Student reviews</h3>
              <p className="text-stone leading-relaxed">
                Reviews tied to you, not the studio.
              </p>
            </div>
            <div className="bg-white border border-sand rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold mb-3">Audition analytics</h3>
              <p className="text-stone leading-relaxed">
                Performance data for studio auditions.
              </p>
            </div>
            <div className="bg-white border border-sand rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold mb-3">Verification badge</h3>
              <p className="text-stone leading-relaxed">
                A badge you earn, not buy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="bg-espresso text-linen px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-bold tracking-widest uppercase text-clay mb-4">
            Ready to build your practice?
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">
            Become an Instruktor.
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-clay text-linen font-bold py-4 px-10 rounded-xl hover:bg-clay-dark transition-all active:scale-[0.98] shadow-sm mb-6"
          >
            Create your page →
          </Link>
          <p className="text-sm text-smoke">
            Currently in beta · Vancouver, BC
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-linen border-t border-sand px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <span className="font-wordmark text-xl tracking-[4px] text-bark">
            Instruktor
          </span>
          <div className="flex items-center gap-4 text-sm text-stone">
            <span>© 2025</span>
            <Link href="/privacy" className="hover:text-bark transition-colors">Privacy</Link>
            <span>instruktor.ca</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
