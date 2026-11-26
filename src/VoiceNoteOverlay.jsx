import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './voice-note-overlay.css';

const VOICE_NOTE_SRC = '/voice-note.m4a';
const formatTime=value=>Number.isFinite(value)?`${String(Math.floor(value/60)).padStart(2,'0')}:${String(Math.floor(value%60)).padStart(2,'0')}`:'00:00';

export default function VoiceNoteOverlay({ origin, onClosed }) {
  const [closing, setClosing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const audioRef = useRef(null);
  const dialogRef = useRef(null);
  const closingRef = useRef(false);
  const closeTimer = useRef(null);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlaying(false);
    setClosing(true);
    closeTimer.current = window.setTimeout(onClosed, matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 520);
  }, [onClosed]);

  useEffect(() => {
    const root = document.getElementById('root');
    const priorInert = root?.inert;
    const priorOverflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      window.clearTimeout(closeTimer.current);
      if (root) root.inert = priorInert;
      document.body.style.overflow = priorOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...document.querySelectorAll('.voice-note-dialog button:not(:disabled), .voice-note-dialog input:not(:disabled)')];
      if (!controls.length) { event.preventDefault(); dialogRef.current?.focus(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !ready || closingRef.current) return;
    setError('');
    if (audio.paused) {
      try { await audio.play(); } catch { setPlaying(false); setError('Could not start playback. Tap play to try again.'); }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const seek = value => {
    const audio=audioRef.current;
    if(!audio||!ready||!Number.isFinite(audio.duration))return;
    const next=Math.max(0,Math.min(audio.duration,value));
    audio.currentTime=next;setCurrentTime(next);
  };

  return createPortal(
    <div className={`voice-note-overlay${closing ? ' is-closing' : ''}`} style={{ '--voice-origin-x': `${origin?.x ?? innerWidth / 2}px`, '--voice-origin-y': `${origin?.y ?? innerHeight / 2}px` }} onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} className="voice-note-dialog" role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby="voice-note-title" aria-describedby="voice-note-status">
        <div className="voice-note-player" data-playing={playing}>
          <button className="voice-vinyl-close" type="button" onClick={close} aria-label="Close voice note" data-sound="silent"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 7 6 6m0-6-6 6"/></svg></button>
          <div className="voice-vinyl-record" aria-hidden="true"><span className="voice-vinyl-label"/><span className="voice-vinyl-spindle"/></div>
          <h2 id="voice-note-title">Meet Basit</h2>
          <p id="voice-note-status" className="voice-vinyl-sr" role="status">{error || (!ready ? 'Loading recording' : playing ? 'Playing' : 'Paused')}</p>
          <div className="voice-note-track">
            <span>{formatTime(currentTime)}</span>
            <input type="range" aria-label="Seek voice note" aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`} min="0" max={duration || 1} step=".1" value={currentTime} disabled={!ready || closing || !duration} onChange={event=>seek(Number(event.target.value))} style={{'--progress':`${duration?currentTime/duration*100:0}%`}}/>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="voice-vinyl-controls">
            <button type="button" onClick={()=>seek(0)} disabled={!ready || closing} aria-label="Restart voice note" data-sound="silent"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12m12-12-9 6 9 6Z"/></svg></button>
            <button type="button" onClick={()=>seek((audioRef.current?.currentTime||0)-10)} disabled={!ready || closing} aria-label="Rewind 10 seconds" data-sound="silent"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v5h5M7 9a7 7 0 1 1-1 8"/></svg></button>
            <button className="voice-note-play" type="button" onClick={togglePlayback} disabled={!ready || closing} aria-label={playing ? 'Pause voice note' : 'Play voice note'} data-sound="silent"><svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M8 6h3v12H8zm5 0h3v12h-3z"/> : <path d="m8 5 11 7-11 7z"/>}</svg></button>
            <button type="button" onClick={()=>seek((audioRef.current?.currentTime||0)+10)} disabled={!ready || closing} aria-label="Forward 10 seconds" data-sound="silent"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 4v5h-5m5 0a7 7 0 1 0 1 8"/></svg></button>
            <button type="button" onClick={()=>setRepeat(value=>!value)} disabled={!ready || closing} aria-label="Repeat voice note" aria-pressed={repeat} data-sound="silent"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4"/></svg></button>
          </div>
        </div>
        <audio ref={audioRef} src={VOICE_NOTE_SRC} preload="metadata" loop={repeat} onLoadedMetadata={(event) => { event.currentTarget.volume=.8;setDuration(Number.isFinite(event.currentTarget.duration)?event.currentTarget.duration:0);setReady(true); }} onDurationChange={event=>setDuration(Number.isFinite(event.currentTarget.duration)?event.currentTarget.duration:0)} onTimeUpdate={event=>setCurrentTime(event.currentTarget.currentTime)} onPlay={event=>{if(closingRef.current)event.currentTarget.pause();else setPlaying(true);}} onPause={()=>setPlaying(false)} onEnded={close} onError={() => { setReady(false); setPlaying(false); setError('Recording unavailable. Please try again later.'); }} />
      </div>
    </div>,
    document.body,
  );
}
