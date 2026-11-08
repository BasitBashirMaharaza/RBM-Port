import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { playEmailSound, stopEmailSound } from './emailContactSound.js';

export default function EmailContactOverlay({ triggerRef, onClosed }) {
  const [closing, setClosing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const sendingRef = useRef(false);
  const closeTimer = useRef(null);
  const closeRef = useRef(false);
  const abortRef = useRef(null);
  const timeoutRef = useRef(null);
  const openedAt = useRef(Date.now());

  const close = () => {
    if (closeRef.current) return;
    closeRef.current = true;
    abortRef.current?.abort();
    stopEmailSound();
    setClosing(true);
    closeTimer.current = window.setTimeout(onClosed, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 320);
  };

  useEffect(() => {
    const root = document.getElementById('root');
    const previousInert = root?.inert;
    const previousOverflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    firstFieldRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled])')].filter((element) => element.getClientRects().length);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(timeoutRef.current);
      abortRef.current?.abort();
      document.removeEventListener('keydown', onKeyDown);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    };
  }, []);

  useEffect(() => {
    if (status === 'sent') dialogRef.current?.querySelector('.email-contact-success button')?.focus({ preventScroll: true });
  }, [status]);

  const submit = async (event) => {
    event.preventDefault();
    if (sendingRef.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    sendingRef.current = true;
    setStatus('sending');
    setError('');
    abortRef.current = new AbortController();
    timeoutRef.current = window.setTimeout(() => abortRef.current?.abort(), 12000);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(fields.get('name') || '').trim(),
          email: String(fields.get('email') || '').trim(),
          subject: String(fields.get('subject') || '').trim(),
          message: String(fields.get('message') || '').trim(),
          website: String(fields.get('website') || ''),
          startedAt: openedAt.current,
        }),
        signal: abortRef.current.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Message could not be sent. Please try again.');
      setStatus('sent');
      playEmailSound('success');
      form.reset();
    } catch (cause) {
      if (!closeRef.current) {
        setError(cause.name === 'AbortError' ? 'The request timed out. Your message was not confirmed; please try again.' : cause.message === 'Failed to fetch' ? 'Connection unavailable. Please try again.' : cause.message);
        setStatus('error');
      }
    } finally {
      window.clearTimeout(timeoutRef.current);
      sendingRef.current = false;
    }
  };

  return createPortal(
    <div className={`email-contact-overlay${closing ? ' is-closing' : ''}`} onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="email-contact-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="email-contact-title" tabIndex={-1}>
        <div className="email-contact-titlebar"><span className="email-contact-mark" aria-hidden="true">✉</span><span>New message</span><button type="button" onClick={close} data-sound="silent" aria-label="Close email composer">×</button></div>
        <div className="email-contact-content">
          <p className="email-contact-kicker">Start a conversation</p>
          <h2 id="email-contact-title">Write to Basit<span>.</span></h2>
          {status === 'sent' ? (
            <div className="email-contact-success" role="status"><span aria-hidden="true">✓</span><strong>Message Sent Successfully</strong><p>Your message was accepted by the email service. Thank you for reaching out.</p><button type="button" onClick={close} data-sound="silent">Return to portfolio <span aria-hidden="true">↗</span></button></div>
          ) : (
            <form onSubmit={submit}>
              <div className="email-contact-row"><label>Name<input ref={firstFieldRef} name="name" autoComplete="name" maxLength={100} required placeholder="Your name" data-sound="silent" /></label><label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" data-sound="silent" /></label></div>
              <label>Subject<input name="subject" maxLength={160} required placeholder="What would you like to discuss?" data-sound="silent" /></label>
              <label>Message<textarea name="message" rows="5" minLength={10} maxLength={5000} required placeholder="Tell me a little about your idea..." data-sound="silent" /></label>
              <div className="email-contact-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" data-sound="silent" /></label></div>
              {error && <p className="email-contact-error" role="alert">{error}</p>}
              <div className="email-contact-actions"><span>Your email is used for replies.</span><button type="submit" disabled={status === 'sending'} data-sound="silent" aria-busy={status === 'sending'}>{status === 'sending' && <i className="email-send-spinner" aria-hidden="true" />}{status === 'sending' ? 'Sending…' : 'Send Message'} <span aria-hidden="true">↗</span></button></div>
              {status === 'sending' && <div className="email-contact-progress" role="status" aria-label="Sending message"><i /></div>}
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
