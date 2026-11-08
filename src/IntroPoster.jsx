import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './intro-poster.css';

const VIDEO_SOURCE = '/portfolio-intro.mp4';
let soundContext;
let robotSoundContext;

function playRobotSound() {
  const Engine = window.AudioContext || window.webkitAudioContext;
  if (!Engine) return;
  try {
    robotSoundContext?.close().catch(() => {});
    const context = new Engine();
    robotSoundContext = context;
    if (context.state === 'suspended') context.resume().catch(() => {});
    const tone = context.createOscillator();
    const volume = context.createGain();
    const start = context.currentTime;
    const choice = Math.floor(Math.random() * 3);
    tone.type = choice === 1 ? 'triangle' : 'sine';
    const notes = choice === 0 ? [580, 760, 940] : choice === 1 ? [440, 390, 510] : [530, 820, 680];
    const duration = choice === 0 ? .38 : choice === 1 ? .32 : .58;
    tone.frequency.setValueAtTime(notes[0], start);
    tone.frequency.exponentialRampToValueAtTime(notes[1], start + duration * .48);
    tone.frequency.exponentialRampToValueAtTime(notes[2], start + duration * .87);
    volume.gain.setValueAtTime(.0001, start);
    volume.gain.exponentialRampToValueAtTime(choice === 1 ? .009 : .014, start + .045);
    volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
    tone.connect(volume).connect(context.destination);
    tone.start(start);
    tone.stop(start + duration + .01);
    tone.onended = () => { if (robotSoundContext === context) robotSoundContext = null; context.close().catch(() => {}); };
  } catch { /* The invitation remains usable when sound is unavailable. */ }
}

function playPosterSound(closing = false) {
  const Engine = window.AudioContext || window.webkitAudioContext;
  if (!Engine) return;
  try {
    robotSoundContext?.close().catch(() => {});
    robotSoundContext = null;
    soundContext?.close().catch(() => {});
    const context = new Engine();
    soundContext = context;
    if (context.state === 'suspended') context.resume().catch(() => {});
    const tone = context.createOscillator();
    const volume = context.createGain();
    const start = context.currentTime;
    tone.type = 'sine';
    tone.frequency.setValueAtTime(closing ? 470 : 260, start);
    tone.frequency.exponentialRampToValueAtTime(closing ? 250 : 570, start + .4);
    volume.gain.setValueAtTime(.0001, start);
    volume.gain.exponentialRampToValueAtTime(.015, start + .08);
    volume.gain.exponentialRampToValueAtTime(.0001, start + .48);
    tone.connect(volume).connect(context.destination);
    tone.start(start);
    tone.stop(start + .5);
    tone.onended = () => { if (soundContext === context) soundContext = null; context.close().catch(() => {}); };
  } catch { /* The visual interaction works when audio is unavailable. */ }
}

function RobotFace() {
  return <span className="intro-robot" aria-hidden="true">
    <span className="intro-robot-body"><span className="intro-robot-core">▶</span></span>
    <span className="intro-robot-arm intro-robot-arm-left"><i /></span>
    <span className="intro-robot-arm intro-robot-arm-right"><i /></span>
    <span className="intro-robot-neck" />
    <span className="intro-robot-head"><span className="intro-robot-visor"><i /><i /></span></span>
  </span>;
}

export default function IntroPoster() {
  const posterRef = useRef(null);
  const anchorRef = useRef(null);
  const playerRef = useRef(null);
  const modalRef = useRef(null);
  const closingRef = useRef(false);
  const timerRef = useRef(null);
  const [overlay, setOverlay] = useState(null);
  const [bubble, setBubble] = useState('hi');
  const [reaction, setReaction] = useState('');
  const [peeking, setPeeking] = useState(false);
  const [idleAction, setIdleAction] = useState('');
  const [shy, setShy] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const anchor = anchorRef.current;
    const header = anchor?.closest('.site-header');
    const toggle = header?.querySelector('.header-switch-dock .bb8-toggle');
    if (!anchor || !header || !toggle) return undefined;
    const align = () => {
      const headerRect = header.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      anchor.style.left = `${toggleRect.left + toggleRect.width / 2 - headerRect.left - 22}px`;
    };
    align();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(align) : null;
    observer?.observe(header);
    observer?.observe(toggle);
    window.addEventListener('resize', align);
    return () => { observer?.disconnect(); window.removeEventListener('resize', align); };
  }, []);

  useEffect(() => {
    let stopTimer;
    const onScroll = () => {
      setScrolling(true);
      setIdleAction('');
      setShy(false);
      if (!bubble && !overlay) setPeeking(true);
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => setScrolling(false), 240);
    };
    const onVisibility = () => {
      setPageVisible(!document.hidden);
      if (document.hidden) setIdleAction('');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.clearTimeout(stopTimer); window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibility); };
  }, [bubble, overlay]);

  useEffect(() => {
    if (!peeking || shy || bubble || overlay || scrolling || !pageVisible || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const actions = ['blink', 'wave', 'nod', 'hide', 'explore'];
    if (!idleAction) {
      const timer = window.setTimeout(() => setIdleAction(actions[Math.floor(Math.random() * actions.length)]), 2800 + Math.random() * 3600);
      return () => window.clearTimeout(timer);
    }
    const duration = idleAction === 'hide' ? 4000 + Math.random() * 1000 : idleAction === 'explore' ? 2000 + Math.random() * 1000 : idleAction === 'blink' ? 650 : 1050;
    const timer = window.setTimeout(() => setIdleAction(''), duration);
    return () => window.clearTimeout(timer);
  }, [peeking, shy, bubble, overlay, scrolling, pageVisible, idleAction]);

  const noticeCursor = (event) => {
    if (event.pointerType !== 'mouse' || bubble || overlay || scrolling) return;
    const center = posterRef.current.getBoundingClientRect().left + 22;
    const side = event.clientX < center ? 1 : -1;
    anchorRef.current.style.setProperty('--shy-tilt', `${side * 7}deg`);
    anchorRef.current.style.setProperty('--shy-eye', `${side * 2}px`);
    setIdleAction('');
    setShy(true);
    setPeeking(true);
  };

  useEffect(() => {
    const greetingTimer = window.setTimeout(() => {
      setBubble((value) => value === 'hi' ? '' : value);
      setPeeking(true);
    }, 2700);
    return () => window.clearTimeout(greetingTimer);
  }, []);

  useEffect(() => {
    if (bubble !== 'ask') return undefined;
    const dismiss = (event) => {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !posterRef.current?.parentElement?.contains(event.target))) setBubble('');
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', dismiss);
    return () => {
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [bubble]);

  const finishClose = () => {
    if (!closingRef.current) return;
    window.clearTimeout(timerRef.current);
    closingRef.current = false;
    setOverlay(null);
    setPeeking(true);
    requestAnimationFrame(() => posterRef.current?.focus({ preventScroll: true }));
  };

  const open = () => {
    if (overlay || closingRef.current) return;
    const rect = posterRef.current?.querySelector('.intro-robot')?.getBoundingClientRect();
    if (!rect) return;
    const origin = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    setOverlay({ origin, phase: 'start' });
    playPosterSound();
    requestAnimationFrame(() => requestAnimationFrame(() => setOverlay((value) => value?.phase === 'start' ? { ...value, phase: 'open' } : value)));
  };

  const close = () => {
    if (!overlay || closingRef.current) return;
    closingRef.current = true;
    playerRef.current?.pause();
    const rect = posterRef.current?.querySelector('.intro-robot')?.getBoundingClientRect();
    const origin = rect ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height } : overlay.origin;
    setOverlay((value) => value && { ...value, origin, phase: 'closing' });
    playPosterSound(true);
    timerRef.current = window.setTimeout(finishClose, matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 850);
  };

  useEffect(() => {
    if (!overlay) return undefined;
    const root = document.documentElement;
    const priorBodyOverflow = document.body.style.overflow;
    const priorRootOverflow = root.style.overflow;
    const priorGutter = root.style.scrollbarGutter;
    const priorPadding = document.body.style.paddingRight;
    const scroll = { x: window.scrollX, y: window.scrollY };
    const gutter = Math.max(0, innerWidth - root.clientWidth);
    if (window.CSS?.supports?.('scrollbar-gutter: stable')) root.style.scrollbarGutter = 'stable';
    else if (gutter) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight || '0') + gutter}px`;
    document.body.style.overflow = 'hidden';
    root.style.overflow = 'hidden';
    requestAnimationFrame(() => modalRef.current?.focus({ preventScroll: true }));
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab' && !modalRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        modalRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = priorBodyOverflow;
      root.style.overflow = priorRootOverflow;
      root.style.scrollbarGutter = priorGutter;
      document.body.style.paddingRight = priorPadding;
      if (window.scrollX !== scroll.x || window.scrollY !== scroll.y) window.scrollTo({ left: scroll.x, top: scroll.y, behavior: 'instant' });
    };
  }, [Boolean(overlay)]);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return <>
    <span ref={anchorRef} className={`intro-robot-anchor ${peeking ? 'intro-robot-peeking' : ''} ${shy ? 'intro-robot-shy' : ''} ${bubble === 'ask' ? 'intro-robot-inviting' : ''} ${idleAction ? `intro-robot-idle-${idleAction}` : ''} ${reaction ? `intro-robot-${reaction}` : ''} ${overlay ? 'intro-robot-watching' : ''}`}>
      <button ref={posterRef} type="button" className="intro-poster" onPointerEnter={noticeCursor} onPointerMove={noticeCursor} onPointerLeave={() => setShy(false)} onClick={() => { if (!overlay) { playRobotSound(); setIdleAction(''); setShy(false); setPeeking(false); setBubble('ask'); } }} aria-label="Ask the robot to watch my introduction video" aria-haspopup="dialog" aria-expanded={bubble === 'ask'}>
        <span className="intro-robot-motion"><RobotFace /></span>
      </button>
      {bubble && !overlay && <span className={`intro-robot-bubble intro-robot-bubble-${bubble}`} role={bubble === 'ask' ? 'dialog' : 'status'} aria-label={bubble === 'ask' ? 'Watch my intro?' : undefined}>
        {bubble === 'hi' ? 'Hi!' : <><span>Watch my intro?</span><span className="intro-robot-choices">
          <button type="button" onClick={() => { setBubble(''); setReaction('happy'); open(); window.setTimeout(() => setReaction(''), 400); }}>Yes</button>
          <button type="button" onClick={() => { setBubble(''); setReaction('understands'); posterRef.current?.focus({ preventScroll: true }); window.setTimeout(() => { setReaction(''); setPeeking(true); }, 500); }}>No</button>
        </span></>}
      </span>}
    </span>
    {overlay && createPortal(<div className={`intro-video-overlay intro-video-${overlay.phase}`} onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div ref={modalRef} className="intro-video-panel" role="dialog" aria-modal="true" aria-label="Portfolio introduction video" tabIndex={-1}
        style={{ '--poster-x': `${overlay.origin.x}px`, '--poster-y': `${overlay.origin.y}px`, '--poster-width': `${overlay.origin.width}px`, '--poster-height': `${overlay.origin.height}px` }}
        onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === 'transform' && closingRef.current) finishClose(); }}>
        <div className="intro-video-poster-copy"><RobotFace /></div>
        <video ref={playerRef} src={VIDEO_SOURCE} controls playsInline preload="metadata" aria-label="Portfolio introduction video" />
      </div>
    </div>, document.body)}
  </>;
}
