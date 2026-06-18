"use client";
import { useEffect } from 'react';

export default function LandingAnimations() {
  useEffect(() => {
    const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rise = (el, opts = {}) => {
      el.animate(
        [
          { opacity: 0, transform: `translateY(${opts.dist ?? 18}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: opts.duration ?? 720, delay: opts.delay ?? 0, easing: EASE, fill: 'both' }
      );
    };

    const show = (el) => {
      el.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 1, transform: 'none' }],
        { duration: 1, fill: 'both' }
      );
    };

    // Hero — staggered load: badge → h1 → subtitle → CTA
    const step = 170;
    const hero = [...document.querySelectorAll('[data-hero]')]
      .sort((a, b) => +a.dataset.hero - +b.dataset.hero);
    hero.forEach((el, i) => {
      if (reduced) { show(el); return; }
      rise(el, { delay: 160 + i * step, dist: i === 1 ? 16 : 18, duration: 900 + i * 30 });
    });

    // Scroll-triggered reveals
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const d = +(e.target.dataset.delay ?? 0);
        rise(e.target, { delay: d, dist: 24, duration: 960 });
        io.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (reduced) { show(el); } else { io.observe(el); }
    });

    // Final CTA headline — clip wipe from below
    const clip = document.querySelector('[data-clip]');
    if (clip) {
      const fire = () =>
        clip.animate(
          [
            { opacity: 0, transform: 'translateY(110%)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 1100, easing: EASE, fill: 'both' }
        );
      if (reduced) { show(clip); }
      else {
        const cio = new IntersectionObserver((entries) => {
          entries.forEach((e) => { if (e.isIntersecting) { fire(); cio.unobserve(clip); } });
        }, { threshold: 0.3 });
        cio.observe(clip);
      }
    }

    // Parallax — radial glow behind the professional-case section
    const psec = document.querySelector('[data-parallax-sec]');
    const pbg = psec?.querySelector('[data-parallax-bg]');
    if (pbg && !reduced) {
      const pa = pbg.animate(
        [
          { transform: 'translateY(-30px) scale(1.12)' },
          { transform: 'translateY(30px) scale(1.12)' },
        ],
        { duration: 1000, fill: 'both', easing: 'linear' }
      );
      pa.pause();
      let ticking = false;
      const update = () => {
        const r = psec.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const prog = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
        pa.currentTime = prog * 1000;
        ticking = false;
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    }
  }, []);

  return null;
}
