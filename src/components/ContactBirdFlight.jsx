import ContactBirdMark from './ContactBirdMark.jsx';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './contact-bird-flight.css';
import { createContactBirdSound } from './contactBirdSound.js';

// Replay on genuine Hero re-entry; the real Contact button stays interactive.
export default function ContactBirdFlight({ navigation }) {
  const flight = useRef(null);
  useEffect(() => {
    const nav = navigation.current;
    const header = nav?.closest('.site-header');
    const destination = nav?.querySelector('[data-contact-flight-target] > svg');
    const source = header?.querySelector('.bb8-toggle');
    const bird = flight.current;
    if (!header || !destination || !source || !bird) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, timer = 0, started = false, finished = false;
    let away = header.dataset.heroAway === 'true', hasLeftHero = away;
    const sound = createContactBirdSound();
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    const finish = () => {
      finished = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      sound.stop();
      destination.classList.remove('contact-mail-in-flight');
      bird.hidden = true;
    };
    const start = () => {
      if (!hasLeftHero || finished || started || document.hidden || document.body.classList.contains('welcome-open')) return;
      if (away || document.documentElement.dataset.contactJourney==='running' || reduced.matches || header.dataset.navState === 'collapsed') { finish(); return; }
      started = true;
      sound.play();
      const origin = source.getBoundingClientRect();
      const x0 = origin.left + origin.width / 2, y0 = origin.top + origin.height / 2;
      bird.style.color = getComputedStyle(destination).color;
      bird.hidden = false;
      destination.classList.add('contact-mail-in-flight');
      let began;
      const tick = now => {
        if (began === undefined) began = now;
        const progress = Math.min((now - began) / 2250, 1);
        // Smooth departure and landing, with a shallow arcing flight above the controls.
        const t = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
        const target = destination.getBoundingClientRect();
        const x1 = target.left + target.width / 2, y1 = target.top + target.height / 2;
        const arc = Math.min(30, Math.max(12, y0 - 13));
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * arc;
        const turn = Math.sin(Math.PI * t * 2) * 10;
        const landingScale = target.width / 24;
        const fold = Math.max(0, Math.min(1, (progress - .74) / .26));
        const morph = fold * fold * (3 - 2 * fold);
        bird.style.transform = `translate3d(${x - 12}px,${y - 12}px,0) rotate(${turn}deg) scale(${(.8 + .2 * Math.min(progress * 6, 1)) * (1 + (landingScale - 1) * morph)})`;
        bird.style.opacity = String(Math.min(progress * 12, 1));
        bird.style.setProperty('--bird-direction', x1 < x0 ? '-1' : '1');
        bird.style.setProperty('--bird-fold', String(1 - morph));
        bird.style.setProperty('--bird-mail', String(morph));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else finish();
      };
      frame = requestAnimationFrame(tick);
    };
    const queue = (delay = 450) => {
      if (!hasLeftHero || away || started || finished || document.body.classList.contains('welcome-open')) return;
      clearTimeout(timer);
      timer = window.setTimeout(start, delay);
    };
    const observer = new MutationObserver(() => {
      const nextAway = header.dataset.heroAway === 'true';
      if (nextAway !== away) {
        away = nextAway;
        if (away) hasLeftHero = true;
        finish();
        if (!away) { started = false; finished = false; queue(900); }
        return;
      }
      if (started && header.dataset.navState === 'collapsed') finish();
      else queue();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(header, { attributes: true, attributeFilter: ['data-nav-state', 'data-hero-away'] });
    const onVisibility = () => { if (document.hidden && started) finish(); else if (!document.hidden) queue(); };
    window.addEventListener('resize', finish);
    reduced.addEventListener('change', finish);
    document.addEventListener('visibilitychange', onVisibility);
    const mute = new MutationObserver(() => { if (document.documentElement.dataset.sound === 'off') sound.stop(); });
    mute.observe(document.documentElement, { attributes: true, attributeFilter: ['data-sound'] });
    window.addEventListener('portfolio:contact-flight',finish);
    queue();
    return () => {
      window.removeEventListener('portfolio:contact-flight',finish);
      finish(); observer.disconnect(); mute.disconnect(); sound.dispose();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('resize', finish);
      reduced.removeEventListener('change', finish);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [navigation]);
  return createPortal(
    <span ref={flight} className="contact-bird-flight" hidden aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <ContactBirdMark bodyClass="contact-flight-bird" wingClass="contact-flight-wing" eyeClass="contact-flight-eye"/>
        <g className="contact-flight-envelope" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" />
        </g>
      </svg>
    </span>, document.body,
  );
}

