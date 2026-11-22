import { useEffect, useRef, useState } from 'react';

// One audio element serves every preview and both printed player pages.
export default function useMusicPreviewPlayer(bookId) {
  const audio = useRef(null), track = useRef(null), pending = useRef(null), ticket = useRef(0), volumeRef = useRef(.55);
  const [song, setSong] = useState(null), [stylusOn, setStylusOn] = useState(false), [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0), [duration, setDuration] = useState(0), [volume, setVolumeState] = useState(.55);
  const [error, setError] = useState(''), [loading, setLoading] = useState(false);
  const pause = () => {
    ticket.current++; pending.current = null; audio.current?.pause();
    if (audio.current) { audio.current.volume = volumeRef.current; audio.current.muted = false; }
    setLoading(false); setStylusOn(false); setPlaying(false);
  };
  const reset = () => {
    pause(); if (audio.current) audio.current.currentTime = 0;
    setPosition(0);
  };
  const fail = token => {
    if (token !== ticket.current) return;
    pause(); setError('This preview could not play. Tap the stylus to retry.');
  };
  const settle = token => {
    const job = pending.current;
    if (!job || job.token !== token || token !== ticket.current || !job.arrived || !job.ready) return;
    pending.current = null;
    if (audio.current) { audio.current.currentTime = 0; audio.current.volume = volumeRef.current; audio.current.muted = false; }
    setPosition(0); setLoading(false); setStylusOn(true); setPlaying(!audio.current?.paused);
  };
  const selectPreview = next => {
    const node = audio.current;
    if (!node || !next.preview) return null;
    pause(); const token = ++ticket.current;
    track.current = next; setSong(next); setError(''); setPosition(0); setDuration(0); setLoading(true);
    pending.current = { token, ready: false, arrived: false };
    node.src = next.preview; node.muted = true; node.volume = volumeRef.current; node.load();
    // Start silently in the user's click handler so iOS retains playback permission.
    try {
      Promise.resolve(node.play()).then(() => {
        if (ticket.current !== token || !pending.current) return;
        pending.current.ready = true; settle(token);
      }).catch(() => fail(token));
    } catch { fail(token); }
    return token;
  };
  const finishPreview = token => {
    if (pending.current?.token !== token) return;
    pending.current.arrived = true; settle(token);
  };
  const setStylus = engaged => {
    if (!engaged) { pause(); return; }
    const node = audio.current;
    if (!track.current || !node || pending.current) return;
    const token = ++ticket.current; setError(''); setStylusOn(true); node.volume = volumeRef.current;
    if (node.ended) node.currentTime = 0;
    if (node.error) node.load();
    try { Promise.resolve(node.play()).catch(() => fail(token)); } catch { fail(token); }
  };
  useEffect(() => {
    const node = audio.current;
    reset(); track.current = null; setSong(null); setDuration(0); setError('');
    return () => { ticket.current++; pending.current = null; node?.pause(); };
  }, [bookId]);
  useEffect(() => {
    const hide = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);
  const events = {
    onLoadedMetadata: event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0),
    onTimeUpdate: event => { if (!pending.current) setPosition(event.currentTarget.currentTime); },
    onPlay: () => setPlaying(true), onPause: () => setPlaying(false),
    onEnded: () => { setStylusOn(false); setPlaying(false); },
    onError: () => { if (track.current) fail(ticket.current); },
  };
  const player = {
    song, loading, stylusOn, playing: playing && !loading, position, duration, volume, error, setStylus,
    seek: value => { if (audio.current && !pending.current) { audio.current.currentTime = value; setPosition(value); } },
    setVolume: value => { volumeRef.current = value; setVolumeState(value); if (audio.current && !pending.current) audio.current.volume = value; },
  };
  return { audio, player, events, selectPreview, finishPreview, reset };
}

