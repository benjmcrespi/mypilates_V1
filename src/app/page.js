import Link from 'next/link';
import LandingNav from '@/components/LandingNav';

export default function LandingPage() {
  return (
    <div className="bg-linen text-bark">

      {/* 1. Nav */}
      <LandingNav />

      {/* 2. Hero */}
      <section className="bg-espresso text-linen px-4 sm:px-10 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-3.5 mb-10">
            <span className="inline-block w-7 h-px bg-clay/50" />
            <span className="text-[10.5px] font-medium tracking-[0.22em] uppercase text-clay">
              Beta · Vancouver, BC
            </span>
            <span className="inline-block w-7 h-px bg-clay/50" />
          </div>
          <h1 className="font-serif font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.008em] leading-[1.05] mb-8">
            Become an Instruktor.
          </h1>
          <p className="text-base sm:text-lg text-smoke mb-11 leading-relaxed max-w-md mx-auto">
            Your classes. Every studio. One link. The professional home for fitness instructors who teach at more than one studio.
          </p>
          <div className="flex flex-col items-center gap-5">
            <Link
              href="/signup"
              className="ik-btn-primary inline-block bg-clay text-linen text-xs font-bold tracking-[0.16em] uppercase py-5 px-11 rounded-[2px]"
            >
              <span>Create Your Page →</span>
            </Link>
            <span className="font-mono text-[10.5px] tracking-[0.08em] text-smoke/80">Free during beta</span>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="bg-linen px-4 sm:px-10 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3.5 mb-4">
            <span className="inline-block w-7 h-px bg-clay-dark/50" />
            <span className="text-[10.5px] font-medium tracking-[0.22em] uppercase text-clay-dark">
              How It Works
            </span>
            <span className="inline-block w-7 h-px bg-clay-dark/50" />
          </div>
          <div className="grid sm:grid-cols-3 gap-10 sm:gap-0 mt-16 text-left">
            <div className="sm:pr-9">
              <div className="font-serif text-clay text-[34px] leading-none mb-5">I.</div>
              <h3 className="text-[17px] font-bold text-bark mb-3">Add your studios</h3>
              <p className="text-sm text-stone leading-relaxed">
                Connect your studios&apos; calendars and booking links once.
              </p>
            </div>
            <div className="sm:px-9 sm:border-l border-sand">
              <div className="font-serif text-clay text-[34px] leading-none mb-5">II.</div>
              <h3 className="text-[17px] font-bold text-bark mb-3">Pull your schedule</h3>
              <p className="text-sm text-stone leading-relaxed">
                One tap syncs all your classes from every studio.
              </p>
            </div>
            <div className="sm:pl-9 sm:border-l border-sand">
              <div className="font-serif text-clay text-[34px] leading-none mb-5">III.</div>
              <h3 className="text-[17px] font-bold text-bark mb-3">Share your link</h3>
              <p className="text-sm text-stone leading-relaxed">
                One URL for students to find every class you teach, wherever you teach it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The professional case */}
      <section className="bg-bark text-linen px-4 sm:px-10 py-28 sm:py-36">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif font-semibold text-4xl sm:text-5xl leading-[1.12] tracking-[0.008em] mb-7">
            Your career, professionally managed.
          </h2>
          <p className="text-base text-smoke leading-relaxed max-w-md mx-auto">
            Every photographer has a portfolio. Every professional has a LinkedIn. Instruktor is yours. A professional page, a following, and a track record that travels with you wherever you teach.
          </p>
        </div>
      </section>

      {/* 5. Coming soon */}
      <section className="bg-linen px-4 sm:px-10 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3.5 mb-4">
            <span className="inline-block w-7 h-px bg-clay-dark/50" />
            <span className="text-[10.5px] font-medium tracking-[0.22em] uppercase text-clay-dark">
              Coming Soon
            </span>
            <span className="inline-block w-7 h-px bg-clay-dark/50" />
          </div>
          <p className="text-center text-sm text-stone mt-4">
            Founding members get first access.
          </p>
          <div className="grid sm:grid-cols-3 gap-10 sm:gap-0 mt-16 text-left">
            <div className="sm:pr-9">
              <h3 className="text-[17px] font-bold text-bark mb-3">Student reviews</h3>
              <p className="text-sm text-stone leading-relaxed">
                Reviews tied to you, not the studio.
              </p>
            </div>
            <div className="sm:px-9 sm:border-l border-sand">
              <h3 className="text-[17px] font-bold text-bark mb-3">Audition analytics</h3>
              <p className="text-sm text-stone leading-relaxed">
                Performance data for studio auditions.
              </p>
            </div>
            <div className="sm:pl-9 sm:border-l border-sand">
              <h3 className="text-[17px] font-bold text-bark mb-3">Verification badge</h3>
              <p className="text-sm text-stone leading-relaxed">
                A badge you earn, not buy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="bg-espresso text-linen px-4 sm:px-10 py-28 sm:py-36">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-3.5 mb-10">
            <span className="inline-block w-7 h-px bg-clay/50" />
            <span className="text-[10.5px] font-medium tracking-[0.22em] uppercase text-clay">
              Ready to build your practice?
            </span>
            <span className="inline-block w-7 h-px bg-clay/50" />
          </div>
          <h2 className="font-serif font-semibold text-5xl sm:text-6xl md:text-7xl tracking-[0.008em] leading-[1.05] mb-10">
            Become an Instruktor.
          </h2>
          <Link
            href="/signup"
            className="ik-btn-primary inline-block bg-clay text-linen text-xs font-bold tracking-[0.16em] uppercase py-5 px-11 rounded-[2px] mb-6"
          >
            <span>Create Your Page →</span>
          </Link>
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-smoke/80">
            Currently in beta · Vancouver, BC
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-linen border-t border-sand px-4 sm:px-10 py-11">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5 text-center sm:text-left">
          <span className="font-wordmark text-lg tracking-[0.14em] text-bark">
            Instruktor
          </span>
          <div className="flex items-center gap-7 text-[10.5px] font-medium tracking-[0.12em] uppercase text-stone">
            <span>© 2025</span>
            <Link href="/privacy" className="hover:text-bark transition-colors duration-[400ms]">Privacy</Link>
            <span>instruktor.ca</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
