import Link from 'next/link';
import LandingNav from '@/components/LandingNav';
import LandingAnimations from '@/components/LandingAnimations';

export default function LandingPage() {
  return (
    <div className="bg-linen text-bark">
      <LandingAnimations />

      {/* 1. Nav */}
      <LandingNav />

      {/* 2. Hero */}
      <section className="bg-espresso text-linen px-6 py-[120px]">
        <div className="max-w-3xl mx-auto text-center">
          <span
            data-hero="0"
            className="inline-block text-xs font-bold tracking-[0.18em] uppercase text-clay border border-clay/40 rounded-full px-4 py-1.5 mb-8"
          >
            Beta · Vancouver, BC
          </span>
          <h1
            data-hero="1"
            className="font-serif text-5xl sm:text-6xl md:text-[72px] font-normal tracking-tight leading-[1.05] mb-6"
          >
            Become an Instruktor.
          </h1>
          <p
            data-hero="2"
            className="text-xl text-smoke leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Your classes. Every studio. One link. The professional home for fitness instructors who teach at more than one studio.
          </p>
          <div data-hero="3" className="flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="bg-clay text-linen font-bold py-4 px-10 rounded-xl hover:bg-clay-dark transition-all active:scale-[0.98] shadow-sm text-base"
            >
              Create your page →
            </Link>
            <span className="text-sm text-smoke">Free during beta.</span>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="bg-linen px-6 py-[120px]">
        <div className="max-w-5xl mx-auto">
          <span
            data-reveal=""
            className="block text-center text-sm font-bold tracking-[0.18em] uppercase text-stone mb-4"
          >
            How it works
          </span>
          <div className="grid sm:grid-cols-3 gap-8 mt-10">
            <div data-reveal="" data-delay="0" className="bg-white border border-sand rounded-xl p-8 text-center">
              <div className="text-clay text-sm font-bold tracking-[0.18em] uppercase mb-4">Step 1</div>
              <h3 className="text-xl font-bold mb-3">Add your studios</h3>
              <p className="text-stone leading-relaxed">
                Connect your studios&apos; calendars and booking links once.
              </p>
            </div>
            <div data-reveal="" data-delay="120" className="bg-white border border-sand rounded-xl p-8 text-center">
              <div className="text-clay text-sm font-bold tracking-[0.18em] uppercase mb-4">Step 2</div>
              <h3 className="text-xl font-bold mb-3">Pull your schedule</h3>
              <p className="text-stone leading-relaxed">
                One tap syncs all your classes from every studio.
              </p>
            </div>
            <div data-reveal="" data-delay="240" className="bg-white border border-sand rounded-xl p-8 text-center">
              <div className="text-clay text-sm font-bold tracking-[0.18em] uppercase mb-4">Step 3</div>
              <h3 className="text-xl font-bold mb-3">Share your link</h3>
              <p className="text-stone leading-relaxed">
                One URL for students to find every class you teach, wherever you teach it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The professional case */}
      <section
        data-parallax-sec=""
        className="relative bg-bark text-linen px-6 py-[120px] overflow-hidden"
      >
        <div
          data-parallax-bg=""
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{
            top: '-12%',
            bottom: '-12%',
            background: 'radial-gradient(60% 55% at 50% 38%, rgba(184,90,53,0.22), rgba(184,90,53,0) 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2
            data-reveal=""
            className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] mb-6"
          >
            Your career, professionally managed.
          </h2>
          <p
            data-reveal=""
            data-delay="120"
            className="text-lg text-smoke leading-relaxed"
          >
            Every photographer has a portfolio. Every professional has a LinkedIn. Instruktor is yours. A professional page, a following, and a track record that travels with you wherever you teach.
          </p>
        </div>
      </section>

      {/* 5. Coming soon */}
      <section className="bg-linen px-6 py-[120px]">
        <div className="max-w-5xl mx-auto">
          <span
            data-reveal=""
            className="block text-center text-2xl font-bold tracking-[0.18em] uppercase text-bark mb-4"
          >
            Coming Soon
          </span>
          <p data-reveal="" data-delay="90" className="text-center text-stone max-w-2xl mx-auto mb-10 leading-relaxed">
            Founding members get first access.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div data-reveal="" data-delay="0" className="bg-white border border-sand rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold mb-3">Student reviews</h3>
              <p className="text-stone leading-relaxed">Reviews tied to you, not the studio.</p>
            </div>
            <div data-reveal="" data-delay="120" className="bg-white border border-sand rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold mb-3">Audition analytics</h3>
              <p className="text-stone leading-relaxed">Performance data for studio auditions.</p>
            </div>
            <div data-reveal="" data-delay="240" className="bg-white border border-sand rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold mb-3">Verification badge</h3>
              <p className="text-stone leading-relaxed">A badge you earn, not buy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="bg-espresso text-linen px-6 py-[120px]">
        <div className="max-w-[672px] mx-auto text-center">
          <p data-reveal="" className="text-sm font-bold tracking-[0.18em] uppercase text-clay mb-4">
            Ready to build your practice?
          </p>
          <div className="overflow-hidden pb-2 mb-8">
            <h2
              data-clip=""
              className="font-serif text-5xl sm:text-6xl md:text-[72px] font-normal tracking-tight leading-[1.05]"
            >
              Become an Instruktor.
            </h2>
          </div>
          <Link
            data-reveal=""
            data-delay="160"
            href="/signup"
            className="inline-block bg-clay text-linen font-bold py-4 px-10 rounded-xl hover:bg-clay-dark transition-all active:scale-[0.98] shadow-sm"
          >
            Create your page →
          </Link>
          <p data-reveal="" data-delay="260" className="text-sm text-smoke mt-6">
            Currently in beta · Vancouver, BC
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-linen border-t border-sand px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
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
