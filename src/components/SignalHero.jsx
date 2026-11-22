import HeroCompanion from './HeroCompanion.jsx';
import { useEffect, useRef, useState } from 'react';
import useHeroReducedMotion from './useHeroReducedMotion.js';
import './signal-hero.css';
import './signal-portrait.css';
import './signal-polish.css';
import HeroTechTitle from './HeroTechTitle.jsx';
import SplitFlapText from './SplitFlapText.jsx';
import './hero-flap-labels.css';

function HeroFlapLabel({text,interval=7600}) {
 const root=useRef(null);const [active,setActive]=useState(false);
 useEffect(()=>{
  let visible=false;const sync=()=>setActive(visible&&!document.hidden);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(root.current);
  document.addEventListener('visibilitychange',sync);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);};
 },[]);
 return <div ref={root} className="hero-flap-label"><SplitFlapText text={text} tileStyle="minimal" textColor="var(--text)" fontSize="1em" gap=".04em" tileRadius={0} depth={.2} flipDuration={.12} stagger={.025} flipsPerChar={5} padTo={text.length} intro loop replayOnEnter active={active} replayInterval={interval}/></div>;
}

function HeroInkGradient({id,reduced}) {
 return <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6878ff"/><stop offset=".38" stopColor="#b4a9ff"/><stop offset=".7" stopColor="var(--accent)"/><stop offset="1" stopColor="#6878ff"/>{!reduced&&<animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="6s" repeatCount="indefinite"/>}</linearGradient></defs>;
}

export default function SignalHero() {
  const [titleFinished, setTitleFinished] = useState(false);
  const reducedMotion = useHeroReducedMotion();
  const revealName = reducedMotion || titleFinished;

  return (
    <section id="home" className="signal-hero signal-polished" aria-label="Portfolio introduction">
      <div className="editorial-kicker hero-greeting-kicker"><div className="hero-greeting-line"><HeroFlapLabel text="Hello, welcome." interval={12000}/></div></div>

      <div className="editorial-title-wrap">
        <HeroCompanion />
        <h1 className="editorial-title">
          <HeroTechTitle onAnimationComplete={() => setTitleFinished(true)} />
          <svg className="editorial-note-arrow" viewBox="0 0 240 120" fill="none" aria-hidden="true"><path d="M226 12C185 9 153 21 127 42C102 63 78 82 30 95M30 95l19-3M30 95l11-16" /></svg>
          <svg className="editorial-loop" viewBox="0 0 440 220" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <HeroInkGradient id="hero-portfolio-ink-gradient" reduced={reducedMotion}/><path style={{stroke:'url(#hero-portfolio-ink-gradient)'}} className="editorial-loop-line" d="M23 115C45 39 347 13 408 73C461 126 342 193 207 204C73 215 3 172 23 115Z" />
          <path className="editorial-spark" d="m426 99 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" />
          </svg>
        </h1>
        <div className="editorial-signature" aria-label="Basit Bashir"><span className={`editorial-signature-reveal${revealName ? ' is-ready' : ''}`} aria-hidden="true">Basit <span className="editorial-name-last">Bashir</span></span><svg className="editorial-name-sword" viewBox="0 0 300 30" fill="none" aria-hidden="true"><defs><linearGradient id="hero-sword-ink"><stop stopColor="var(--name-ink-one)"/><stop offset=".5" stopColor="var(--name-ink-two)"/><stop offset="1" stopColor="var(--name-ink-three)"/></linearGradient></defs><path pathLength="100" d="m47 12 238-3 12 6-12 6-238-3ZM47 15h239M39 4l3 22M35 15H10M35 11v8M9 11l-5 4 5 4Z"/></svg><span className="editorial-name-sprinkles" aria-hidden="true"><i/><i/><i/><i/><i/><i/></span></div>
      </div>

      <div className="editorial-caption">
        <span>Engineering intelligence for real-world healthcare</span>
      </div>

      <a className="editorial-scroll" href="#about" aria-label="Scroll to learn more">
        <span>scroll</span>
        <svg viewBox="0 0 28 70" fill="none" aria-hidden="true"><HeroInkGradient id="hero-scroll-ink-gradient" reduced={reducedMotion}/>
          <path style={{stroke:'url(#hero-scroll-ink-gradient)'}} d="M14 3c13 7-9 13 1 22 9 8-9 13 0 22 6 6 2 11 0 15" />
          <path style={{stroke:'url(#hero-scroll-ink-gradient)'}} d="m7 53 8 10 8-10" />
        </svg>
      </a>

      <div className="editorial-footer">
        <div className="editorial-footer-label"><HeroFlapLabel text="India — 2026" interval={9800}/></div>
        <div className="editorial-footer-label"><HeroFlapLabel text="AI · Data · Healthcare" interval={8600}/></div>
      </div>
    </section>
  );
}
