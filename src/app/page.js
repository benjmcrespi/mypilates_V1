import Link from 'next/link';
export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-[#E8E6E1]">
      {/* Main Background: Custom Cream */}
      
      {/* NAVIGATION BAR */}
      <nav className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto">
        <div className="text-xl font-extrabold tracking-tighter text-[#2C2A28]">
          MyPilates
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-[#7A7571]">
          <span className="hover:text-[#2C2A28] cursor-pointer transition-colors">Classes</span>
          <span className="hover:text-[#2C2A28] cursor-pointer transition-colors">Instructors</span>
          <span className="hover:text-[#2C2A28] cursor-pointer transition-colors">About</span>
        </div>
        <div className="flex space-x-4">
          <button className="text-sm font-medium text-[#7A7571] hover:text-[#2C2A28] transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-32 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#2C2A28] mb-6 max-w-4xl">
          The new standard for independent Pilates.
        </h1>
        <p className="text-lg md:text-xl text-[#7A7571] mb-10 max-w-2xl">
          Discover premium Reformer and Mat classes hosted by top independent instructors. Book directly. Move beautifully.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
          {/* Primary CTA */}
          <Link href="/classes" className="bg-[#2C2A28] text-[#FAF9F6] px-8 py-4 rounded-lg text-sm font-medium hover:bg-black transition-colors w-full sm:w-auto flex items-center justify-center">
            Find a Class
          </Link>
          {/* Secondary CTA */}
          <button className="bg-[#F3F0EA] text-[#2C2A28] border border-[#E8E6E1] px-8 py-4 rounded-lg text-sm font-medium hover:bg-[#E8E6E1] transition-colors w-full sm:w-auto">
            For Instructors
          </button>
        </div>
      </section>

      {/* WHY MYPILATES SECTION */}
      <section className="bg-[#F3F0EA] py-24 px-8 border-y border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2C2A28]">Why MyPilates?</h2>
            <p className="text-[#7A7571] mt-2">Built for the modern movement community.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-[#2C2A28] text-[#FAF9F6] rounded-full flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-[#2C2A28] mb-2">Curated Instructors</h3>
              <p className="text-[#7A7571] text-sm leading-relaxed">
                We only feature highly certified, independent professionals so you guarantee a premium experience every session.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-[#2C2A28] text-[#FAF9F6] rounded-full flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-[#2C2A28] mb-2">Seamless Booking</h3>
              <p className="text-[#7A7571] text-sm leading-relaxed">
                Filter by class type, find the schedule that fits your life, and book directly with the instructor in seconds.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-[#2C2A28] text-[#FAF9F6] rounded-full flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-[#2C2A28] mb-2">Empowering Creators</h3>
              <p className="text-[#7A7571] text-sm leading-relaxed">
                By bypassing the mega-studios, your booking directly supports the independent instructors leading your class.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-24 px-8 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Image Placeholder: Darker warm tone */}
        <div className="w-full md:w-1/2 bg-[#E8E6E1] aspect-square rounded-2xl flex items-center justify-center border border-[#DCD9D3]">
          <span className="text-[#96908B] font-medium">[ Studio Image Placeholder ]</span>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold text-[#2C2A28] mb-6">The Vision</h2>
          <p className="text-[#7A7571] mb-4 leading-relaxed text-sm">
            Born on the West Side, MyPilates was built to solve a simple problem: it was too hard for incredible independent instructors to manage their own schedules, and too hard for students to discover them outside of massive corporate studios.
          </p>
          <p className="text-[#7A7571] leading-relaxed text-sm">
            We are creating a centralized hub where the community can thrive on its own terms. Whether you are looking for an intense Reformer Elevate session or a restorative Mat Sculpt, everything you need is right here.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E8E6E1] py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-[#96908B]">
          <p>© 2026 MyPilates. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-[#2C2A28] cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-[#2C2A28] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#2C2A28] cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>

    </div>
  );
}