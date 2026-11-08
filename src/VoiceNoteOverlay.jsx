import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './voice-note-overlay.css';

const VOICE_NOTE_SRC = '/voice-note.m4a';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '--:--';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function VoiceNoteOverlay({ origin, onClosed }) {
  const [closing, setClosing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
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
    if (!audio || !ready) return;
    if (audio.paused) {
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return createPortal(
    <div className={`voice-note-overlay${closing ? ' is-closing' : ''}`} style={{ '--voice-origin-x': `${origin?.x ?? innerWidth / 2}px`, '--voice-origin-y': `${origin?.y ?? innerHeight / 2}px` }} onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} className="voice-note-dialog" role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby="voice-note-title" aria-describedby="voice-note-status">
        <h2 id="voice-note-title">Listen to Voice Note</h2>
        <div className="voice-note-player">
          <button className="voice-note-play" type="button" onClick={togglePlayback} disabled={!ready || closing} aria-label={playing ? 'Pause voice note' : 'Play voice note'}>{playing ? 'Ⅱ' : '▶'}</button>
          <div className="voice-note-track">
            <div className={`voice-note-wave${playing ? ' is-playing' : ''}`} aria-hidden="true">{[7, 13, 19, 10, 24, 15, 28, 12, 21, 31, 16, 26, 12, 22, 14, 29, 18, 11, 24, 16, 9, 19, 12, 7].map((height, index) => <i key={index} style={{ '--bar-height': `${height}px`, '--bar-index': index }} />)}</div>
            <input type="range" min="0" max={Number.isFinite(duration) ? duration : 1} step="0.1" value={currentTime} disabled={!ready || closing} onChange={(event) => { const next = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = next; setCurrentTime(next); }} aria-label="Seek voice note" style={{ '--progress': Number.isFinite(duration) && duration > 0 ? `${currentTime / duration * 100}%` : '0%' }} />
            <div className="voice-note-time"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
          </div>
        </div>
        <p id="voice-note-status" className="voice-note-status">{error ? 'Recording unavailable' : ready ? 'Voice note for you' : 'Loading voice note…'}</p>
        {VOICE_NOTE_SRC && <audio ref={audioRef} src={VOICE_NOTE_SRC} preload="metadata" onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); setReady(true); }} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={close} onError={() => { setReady(false); setError(true); }} />}
      </div>
    </div>,
    document.body,
  );
}
