import { useLayoutEffect, useRef } from 'react';
import './hero-profile-transition.css';

const bands = [
  { word: 'discover', travel: 18, start: 1, end: 2 },
  { word: 'design', travel: 20, start: 2.5, end: 5 },
  { word: 'develop', travel: 22, start: 5, end: 7 },
];


const topics = {
 education: { words: ['formal learning', 'applied knowledge', 'academic foundations'], icons: ['book', 'study', 'cap'] },
 experience: { words: ['healthcare operations', 'data science', 'digital growth'], icons: ['care', 'chart', 'growth'] },
 work: { words: ['conversational AI', 'document intelligence', 'predictive systems'], icons: ['chat', 'document', 'network'] },
 toolkit: { words: ['Python & data', 'retrieval & AI', 'web & analytics'], icons: ['code', 'database', 'network'] },
 beyond: { words: ['trekking & camping', 'music & stories', 'beyond the CV'], icons: ['mountain', 'music', 'compass'] },
 contact: { words: ['let’s build together', 'ideas into impact', 'start a conversation'], icons: ['chat', 'network', 'mail'] },
};
const iconPaths = {
 mail:'M15 23h42v29H15V23Zm0 0 21 17 21-17M15 52l14-16m28 16L43 36',
 book:'M16 22c8-4 14-3 20 1 6-4 12-5 20-1v30c-8-4-14-3-20 1-6-4-12-5-20-1V22Zm20 1v30',
 study:'m22 48 5-14 21-17 7 8-23 18-10 5Zm5-14 5 9M20 56h34',
 cap:'m12 29 24-12 24 12-24 12-24-12Zm10 6v13c9 7 19 7 28 0V35M59 30v21',
 care:'M29 18h14v11h11v14H43v11H29V43H18V29h11V18Z',
 chart:'M18 17v37h38M25 44l10-13 9 6 11-18M49 19h6v7',
 growth:'M18 52h8V39h-8v13Zm14 0h8V30h-8v22Zm14 0h8V19h-8v33ZM19 30l16-10 8 2 11-10',
 chat:'M18 20h36v26H32L20 55v-9h-2V20Zm8 9h20M26 37h14',
 document:'M23 15h19l10 11v31H23V15Zm19 0v12h10M30 35h15M30 42h15M30 49h10',
 network:'M24 23l24 1M22 27l13 21M48 28 39 48M20 15a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM51 16a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM37 48a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z',
 code:'m25 23-12 13 12 13m22-26 12 13-12 13M41 19 31 53',
 database:'M18 23c0-10 36-10 36 0s-36 10-36 0Zm0 0v26c0 10 36 10 36 0V23M18 36c0 10 36 10 36 0',
 mountain:'m12 52 17-30 10 16 7-11 14 25H12Zm11-20 6 6 5-5M39 38l6 7 6-8',
 music:'M29 46V22l24-5v24M29 29l24-5M29 46c0 9-16 10-16 2s16-10 16-2Zm24-5c0 9-16 10-16 2s16-10 16-2Z',
 compass:'M36 13v5M36 54v5M13 36h5M54 36h5m-14-9-6 12-12 6 6-12 12-6ZM36 21a15 15 0 1 0 0 30 15 15 0 0 0 0-30Z',
};

// Webflow's easeInOut curve: only horizontal travel of the first two bands is eased.
function easeInOut(progress) {
  let lower = 0;
  let upper = 1;
  let t = progress;
  for (let i = 0; i < 12; i++) {
    const x = 3 * (1-t) * (1-t) * t * .42 + 3 * (1-t) * t * t * .58 + t*t*t;
    if (x < progress) lower = t; else upper = t;
    t = (lower + upper) / 2;
  }
  return 3 * (1-t) * t*t + t*t*t;
}

function BandIcon({ index, icon }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="32" />
      {icon ? <path d={iconPaths[icon]} /> : index === 0 ? <g>
        <ellipse cx="36" cy="36" rx="21" ry="8" />
        <ellipse cx="36" cy="36" rx="21" ry="8" transform="rotate(60 36 36)" />
        <ellipse cx="36" cy="36" rx="21" ry="8" transform="rotate(120 36 36)" />
        <circle cx="36" cy="36" r="2" fill="currentColor" stroke="none" />
      </g> : index === 1 ? <g>
        <path d="M28 43 49 18c3-3 5-2 3 2L36 48l-8-5Zm3-2 17-20M28 43c-11-1-5 14-15 13 9 6 20 1 23-8" />
      </g> : <g>
        <path d="m21 26-7 10 7 10m30-20 7 10-7 10M41 21 31 51M27 28h17M25 36h17M24 44h15" />
      </g>}
    </svg>
  );
}

export default function HeroProfileTransition({ compact = false, direction = 'forward', topic }) {
  const content = topics[topic];
  const root = useRef(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const rows = [...element.querySelectorAll('.hero-profile-band')];
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const transformAt = (value, index) => {
      const band = bands[index];
      const eased = index < 2 ? easeInOut(value) : value;
      const reverse=direction==='reverse';
      const travel=-band.travel*(reverse?eased:1-eased);
      const rotation=(band.start+(band.end-band.start)*value)*(compact?.28:1)*(reverse?-1:1);
      return `translate3d(${travel}em,0,0) rotate(${rotation}deg)`;
    };
    const paint = (value) => rows.forEach((row,index) => { row.style.transform = transformAt(value,index); });
    let stopMotion = () => {};

    const startFallback = () => {
      element.dataset.scrollEngine = 'fallback';
      let frame = 0;
      const read = () => {
        const rect=element.getBoundingClientRect();
        return Math.max(0,Math.min(1,(window.innerHeight-rect.top)/(window.innerHeight+rect.height)));
      };
      let lastProgress=read();
      const tick = () => {frame=0;if(!document.hidden){const value=read();if(value!==lastProgress){paint(value);lastProgress=value;}}};
      const schedule = () => {if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);};
      const resize = schedule;
      const visibility = () => {cancelAnimationFrame(frame);frame=0;if(!document.hidden)schedule();};
      paint(lastProgress);
      const observer=new ResizeObserver(resize);
      observer.observe(element);
      window.addEventListener('scroll',schedule,{passive:true});
      window.addEventListener('resize',resize,{passive:true});
      document.addEventListener('visibilitychange',visibility);
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('scroll',schedule);
        window.removeEventListener('resize',resize);
        document.removeEventListener('visibilitychange',visibility);
      };
    };
    const configure = () => {
      stopMotion();
      if (motionPreference.matches) {
        element.dataset.scrollEngine='reduced';
        paint(.5);
        stopMotion=()=>{};
        return;
      }
      if ('ViewTimeline' in window) {
        const animations=[];
        try {
          const timeline=new window.ViewTimeline({subject:element,axis:'block'});
          rows.forEach((row,index) => {
            // Precompute the reference curve once; the browser composites the scroll frames.
            const keyframes=Array.from({length:61},(_,step)=>({offset:step/60,transform:transformAt(step/60,index)}));
            animations.push(row.animate(keyframes,{timeline,fill:'both'}));
          });
          element.dataset.scrollEngine='native';
          stopMotion=()=>animations.forEach(animation=>animation.cancel());
          return;
        } catch {
          animations.forEach(animation=>animation.cancel());
        }
      }
      stopMotion=startFallback();
    };
    const inView=new IntersectionObserver(([entry])=>{
      element.classList.toggle('is-active',entry.isIntersecting&&!motionPreference.matches);
    },{rootMargin:'100px'});
    inView.observe(element);
    let prepared = false;
    const prepare = () => { if (!prepared) { prepared = true; configure(); } };
    const preparation = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { prepare(); preparation.disconnect(); }
    }, { rootMargin: '100%' });
    preparation.observe(element);
    const preferenceChanged = () => { if (prepared) configure(); };
    motionPreference.addEventListener('change',preferenceChanged);
    return () => {
      stopMotion();
      inView.disconnect();
      preparation.disconnect();
      motionPreference.removeEventListener('change',preferenceChanged);
    };
  }, [compact, direction]);

  return (
    <div ref={root} className={`hero-profile-transition${compact ? " is-compact" : ""}${direction === "reverse" ? " is-reverse" : ""}`} data-direction={direction} data-topic={topic || "profile"} aria-hidden="true">
      {bands.map((band,index) => (
        <div className={`hero-profile-band hero-profile-band-${index}`} key={band.word}>
          {Array.from({ length: 12 }, (_, repeat) => (
            <span className="hero-profile-band-unit" key={repeat}>
              <span>{content?.words[index] || band.word}</span><BandIcon index={index} icon={content?.icons[index]} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
