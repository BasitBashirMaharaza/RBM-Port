import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './intro-poster.css';

const VIDEO_SOURCE = '/portfolio-intro.mp4';
let soundContext;

function playPosterSound(closing = false) {
  const Engine = window.AudioContext || window.webkitAudioContext;
  if (!Engine) return;
  try {
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
  const playerRef = useRef(null);
  const modalRef = useRef(null);
  const closingRef = useRef(false);
  const timerRef = useRef(null);
  const [overlay, setOverlay] = useState(null);
  const [bubble, setBubble] = useState('hi');
  const [reaction, setReaction] = useState('');

  useEffect(() => {
    const greetingTimer = window.setTimeout(() => setBubble((value) => value === 'hi' ? '' : value), 2700);
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
    <span className={`intro-robot-anchor ${reaction ? `intro-robot-${reaction}` : ''} ${overlay ? 'intro-robot-watching' : ''}`}>
      <button ref={posterRef} type="button" className="intro-poster" onClick={() => { if (!overlay) setBubble('ask'); }} aria-label="Ask the robot to watch my introduction video" aria-haspopup="dialog" aria-expanded={bubble === 'ask'}>
        <RobotFace />
      </button>
      {bubble && !overlay && <span className={`intro-robot-bubble intro-robot-bubble-${bubble}`} role={bubble === 'ask' ? 'dialog' : 'status'} aria-label={bubble === 'ask' ? 'Watch my intro?' : undefined}>
        {bubble === 'hi' ? 'Hi!' : <><span>Watch my intro?</span><span className="intro-robot-choices">
          <button type="button" onClick={() => { setBubble(''); setReaction('happy'); open(); window.setTimeout(() => setReaction(''), 400); }}>Yes</button>
          <button type="button" onClick={() => { setBubble(''); setReaction('understands'); posterRef.current?.focus({ preventScroll: true }); window.setTimeout(() => setReaction(''), 500); }}>No</button>
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
