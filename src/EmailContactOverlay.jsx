import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MorphOrb from './MorphOrb.jsx';
import { playEmailSound, stopEmailSound } from './emailContactSound.js';

const empty = { name: '', email: '', subject: '', message: '', website: '' };

export default function EmailContactOverlay({ triggerRef, onClosed }) {
  const [closing, setClosing] = useState(false);
  const [fields, setFields] = useState(empty);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [morphPhase, setMorphPhase] = useState('idle');
  const firstFieldRef = useRef(null);
  const abortRef = useRef(null);
  const closeRef = useRef(false);
  const startedAt = useRef(Date.now());

  const close = () => {
    if (closeRef.current) return;
    closeRef.current = true;
    abortRef.current?.abort(); stopEmailSound(); setClosing(true);
    window.setTimeout(onClosed, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 320);
  };
  useEffect(() => {
    const root = document.getElementById('root'); const wasInert = root?.inert; const overflow = document.body.style.overflow;
    if (root) root.inert = true; document.body.style.overflow = 'hidden';
    window.setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), 30);
    const onKey = (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); abortRef.current?.abort(); if (root) root.inert = wasInert; document.body.style.overflow = overflow; requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true })); };
  }, []);

  const update = (key) => (event) => setFields((current) => ({ ...current, [key]: event.target.value }));
  const validate = (message) => {
    if (!fields.name.trim() || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fields.email.trim()) || !fields.subject.trim() || message.trim().length < 10) {
      setError('Please complete your name, valid email, subject, and a message of at least 10 characters.'); return false;
    }
    setError(''); return true;
  };
  const deliver = async (message) => {
    setSending(true); setError(''); abortRef.current = new AbortController();
    const timer = window.setTimeout(() => abortRef.current?.abort(), 12000);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abortRef.current.signal, body: JSON.stringify({ ...fields, name: fields.name.trim(), email: fields.email.trim(), subject: fields.subject.trim(), message: message.trim(), startedAt: startedAt.current }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'Message could not be sent. Please try again.');
      playEmailSound('success'); return 'Message Sent Successfully';
    } finally { window.clearTimeout(timer); setSending(false); }
  };
  const failed = (cause) => setError(cause?.name === 'AbortError' ? 'The request timed out. Your message was not confirmed; please try again.' : cause?.message || 'Connection unavailable. Please try again.');

  const immersive = morphPhase !== 'idle';
  return createPortal(<div className={`email-contact-overlay email-contact-orb-overlay${closing ? ' is-closing' : ''}${immersive ? ' is-morphing' : ''}`} onPointerDown={(event) => { if (event.target === event.currentTarget && !sending) close(); }}>
    <div className="email-contact-dialog email-contact-orb-dialog" role="dialog" aria-modal="true" aria-labelledby="email-contact-title">
      <div className="email-contact-titlebar"><span className="email-contact-mark" aria-hidden="true">✦</span><span>Message</span><button className="email-contact-close" type="button" onClick={close} data-sound="silent" aria-label="Close message form"><span aria-hidden="true">×</span></button></div>
      <div className="email-contact-content">
        <h2 id="email-contact-title">Send Basit a message<span>.</span></h2>
        <div className="email-contact-fields" aria-hidden={sending}>
          <div className="email-contact-row"><label>Name<input ref={firstFieldRef} value={fields.name} onChange={update('name')} autoComplete="name" maxLength="100" placeholder="Your name" disabled={sending} /></label><label>Email address<input value={fields.email} onChange={update('email')} type="email" autoComplete="email" maxLength="254" placeholder="you@example.com" disabled={sending} /></label></div>
          <label>Subject<input value={fields.subject} onChange={update('subject')} maxLength="160" placeholder="What would you like to discuss?" disabled={sending} /></label>
        </div>
        <MorphOrb value={fields.message} onChange={(message) => setFields((current) => ({ ...current, message }))} onValidate={validate} onSubmit={deliver} onFailure={failed} onPhaseChange={setMorphPhase} onClose={close} disabled={sending} />
        {error && <p className="email-contact-error" role="alert">{error}</p>}
        <p className="email-contact-note">Your email lets Basit reply directly. Message delivery is handled securely through Discord.</p>
      </div>
    </div>
  </div>, document.body);
}
