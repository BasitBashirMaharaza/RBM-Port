import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MorphOrb from './MorphOrb.jsx';
import { playEmailSound, stopEmailSound } from './emailContactSound.js';
import './email-contact-redesign.css';

const empty = { name: '', email: '', subject: '', message: '', website: '' };

export default function EmailContactOverlay({ triggerRef, onClosed }) {
  const [closing, setClosing] = useState(false);
  const [fields, setFields] = useState(empty);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [morphPhase, setMorphPhase] = useState('idle');
  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);
  const closeTimer = useRef(null);
  const abortRef = useRef(null);
  const closeRef = useRef(false);
  const startedAt = useRef(Date.now());

  const close = () => {
    if (closeRef.current) return;
    closeRef.current = true;
    abortRef.current?.abort(); stopEmailSound(); setClosing(true);
    closeTimer.current = window.setTimeout(onClosed, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 320);
  };
  useEffect(() => {
    const root = document.getElementById('root'); const wasInert = root?.inert; const bodyOverflow = document.body.style.overflow; const documentOverflow = document.documentElement.style.overflow;
    if (root) root.inert = true; document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), 30);
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...(dialogRef.current?.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled)') || [])].filter(node=>node.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if(!first){event.preventDefault();dialogRef.current?.focus();return;}
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialogRef.current)){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(focusTimer);window.clearTimeout(closeTimer.current);document.removeEventListener('keydown', onKey); abortRef.current?.abort(); if (root) root.inert = wasInert; document.body.style.overflow = bodyOverflow; document.documentElement.style.overflow = documentOverflow; requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true })); };
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
  return createPortal(<div className={`email-contact-overlay email-contact-orb-overlay email-contact-redesigned${closing ? ' is-closing' : ''}${immersive ? ' is-morphing' : ''}`} onPointerDown={(event) => { if (event.target === event.currentTarget && !sending) close(); }}>
    <div ref={dialogRef} tabIndex={-1} className="email-contact-dialog email-contact-orb-dialog" role="dialog" aria-modal="true" aria-labelledby="email-contact-title">
      <div className="email-contact-titlebar"><span className="contact-compose-wordmark" aria-hidden="true">bb.</span><span>A personal connection</span><button className="email-contact-close" type="button" onClick={close} data-sound="silent" aria-label="Close message form"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 6 8 8m0-8-8 8"/></svg></button></div>
      {!immersive&&<aside className="contact-compose-intro" aria-label="A note to Basit">
        <div className="contact-compose-identity"><img src="/portfolio_photo.webp" alt=""/><span>Basit Bashir<small>A direct line to me</small></span></div>
        <div className="contact-compose-invitation"><span>OPEN TO A GOOD CONVERSATION</span><h3>It starts<br/>with <em>hello.</em></h3><p>A project, a question,<br/>or something worth sharing.</p></div>
        <svg className="contact-compose-signal" viewBox="0 0 210 140" fill="none" aria-hidden="true"><defs><linearGradient id="compose-signal-ink"><stop stopColor="#a99ce5"/><stop offset="1" stopColor="#9fbcb0"/></linearGradient></defs><path className="compose-signal-track" d="M8 112h52q18 0 18-18V53q0-19 19-19h105M8 127h65q18 0 18-18V68q0-19 19-19h92"/><path className="compose-signal-light" d="M8 112h52q18 0 18-18V53q0-19 19-19h105"/><g transform="translate(119 61)"><rect width="60" height="44" rx="11"/><path d="m9 12 21 16 21-16"/></g><circle cx="8" cy="112" r="3"/><circle cx="202" cy="34" r="3"/></svg>
        <span className="contact-compose-signoff">Thoughtfully written.<br/>Personally received.</span>
      </aside>}
      <div className="email-contact-content">
        {!immersive&&<span className="contact-compose-eyebrow">LEAVE A NOTE</span>}
        <h2 id="email-contact-title">What’s on your mind<span>?</span></h2>
        {!immersive&&<p className="contact-compose-subtitle">I’d love to hear a little about it.</p>}
        <div className="email-contact-fields" aria-hidden={sending}>
          <div className="email-contact-row"><label>Name<input ref={firstFieldRef} value={fields.name} onChange={update('name')} autoComplete="name" maxLength="100" placeholder="Your name" aria-required="true" disabled={sending} /></label><label>Email address<input value={fields.email} onChange={update('email')} type="email" autoComplete="email" maxLength="254" placeholder="you@example.com" aria-required="true" disabled={sending} /></label></div>
          <label>Subject<input value={fields.subject} onChange={update('subject')} maxLength="160" placeholder="What would you like to discuss?" aria-required="true" disabled={sending} /></label>
        </div>
        {!immersive&&<div className="contact-compose-message-heading"><label htmlFor="contact-compose-message">Your message</label><span aria-hidden="true">{fields.message.length.toLocaleString()} / 5,000</span></div>}
        <MorphOrb value={fields.message} onChange={(message) => setFields((current) => ({ ...current, message }))} onValidate={validate} onSubmit={deliver} onFailure={failed} onPhaseChange={setMorphPhase} onClose={close} disabled={sending} />
        {error && <p className="email-contact-error" role="alert">{error}</p>}
        <p className="email-contact-note">Your email is only used to reply to your message.</p>
      </div>
    </div>
  </div>, document.body);
}
