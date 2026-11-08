import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import './signal-hero.css';
import './signal-portrait.css';
import './signal-polish.css';
import { TextRoll } from './ui/text-roll.tsx';

export default function SignalHero() {
  const [titleFinished, setTitleFinished] = useState(false);
  const reducedMotion = useReducedMotion();
  const revealName = reducedMotion || titleFinished;

  return (
    <section id="home" className="signal-hero signal-polished" aria-label="Portfolio introduction">
      <p className="editorial-kicker">AI <span>·</span> Data <span>·</span> Healthcare</p>

      <div className="editorial-title-wrap">
        <h1 className="editorial-title">
          <TextRoll className="editorial-title-roll" duration={0.42} getEnterDelay={(index) => index * 0.035} getExitDelay={(index) => index * 0.035 + 0.18} onAnimationComplete={() => setTitleFinished(true)}>Portfolio</TextRoll>
          <svg className="editorial-note-arrow" viewBox="0 0 240 120" fill="none" aria-hidden="true"><path d="M226 12C185 9 153 21 127 42C102 63 78 82 30 95M30 95l19-3M30 95l11-16" /></svg>
          <svg className="editorial-loop" viewBox="0 0 440 220" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <path className="editorial-loop-line" d="M23 115C45 39 347 13 408 73C461 126 342 193 207 204C73 215 3 172 23 115Z" />
          <path className="editorial-spark" d="m426 99 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" />
          </svg>
        </h1>
        <div className="editorial-signature" aria-label="Basit Bashir"><span className={`editorial-signature-reveal${revealName ? ' is-ready' : ''}`} aria-hidden="true">Basit Bashir</span></div>
      </div>

      <div className="editorial-caption">
        <span>Engineering intelligence for real-world healthcare</span>
      </div>

      <a className="editorial-scroll" href="#about" aria-label="Scroll to learn more">
        <span>scroll</span>
        <svg viewBox="0 0 28 70" fill="none" aria-hidden="true">
          <path d="M14 3c13 7-9 13 1 22 9 8-9 13 0 22 6 6 2 11 0 15" />
          <path d="m7 53 8 10 8-10" />
        </svg>
      </a>

      <div className="editorial-footer">
        <span>India — 2026</span>
        <span>AI <i>·</i> Data <i>·</i> Healthcare</span>
      </div>
    </section>
  );
}
