import { useEffect, useMemo, useRef, useState } from 'react';
import './morph-orb.css';

const TAU = Math.PI * 2;
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const spherePoints = Array.from({ length: 520 }, (_, index) => {
  const t = index / 519;
  const y = 1 - t * 2;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, id: index };
});

function DeliverySphere({ phase }) {
  const canvasRef = useRef(null);
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === 'idle') return undefined;
    const context = canvas.getContext('2d');
    const styles = getComputedStyle(document.documentElement);
    const colors = { base: styles.getPropertyValue('--text').trim(), accent: styles.getPropertyValue('--delivery-highlight').trim(), success: styles.getPropertyValue('--delivery-success').trim() };
    const size = Math.min(280, Math.max(214, Math.floor(innerWidth * .64)));
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    let frame = 0; const started = performance.now();
    const draw = (now) => {
      const elapsed = reduced ? 0 : (now - started) / 1000;
      const success = phase === 'success-transition' || phase === 'success';
      const contraction = phase === 'success-transition' ? Math.max(.035, 1 - Math.min(1, (now - started) / 640)) : phase === 'success' ? .035 : 1;
      const theta = elapsed * .48;
      const phi = .48 + Math.sin(elapsed * .22) * .1;
      const rendered = spherePoints.map((point) => {
        const x1 = point.x * Math.cos(theta) - point.z * Math.sin(theta);
        const z1 = point.x * Math.sin(theta) + point.z * Math.cos(theta);
        const y1 = point.y * Math.cos(phi) - z1 * Math.sin(phi);
        const z2 = point.y * Math.sin(phi) + z1 * Math.cos(phi);
        return { x: x1, y: y1, depth: (z2 + 1) / 2, wave: Math.sin(point.y * 10 + elapsed * 3.1 + point.id * .09) };
      }).sort((a, b) => a.depth - b.depth);
      context.clearRect(0, 0, size, size);
      rendered.forEach((point) => {
        const scale = (58 + point.depth * 33) * contraction;
        const waveActive = !success && point.wave > .72;
        context.globalAlpha = success ? .9 : .17 + point.depth * .62 + (waveActive ? .2 : 0);
        context.fillStyle = success ? colors.success : waveActive ? colors.accent : colors.base;
        context.beginPath();
        context.arc(size / 2 + point.x * scale, size / 2 - point.y * scale, (.48 + point.depth * 1.6) * Math.max(.35, contraction), 0, TAU);
        context.fill();
      });
      context.globalAlpha = 1;
      if (!reduced && phase !== 'success') frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [phase, reduced]);
  return <canvas className="delivery-sphere-canvas" ref={canvasRef} aria-hidden="true" />;
}

export default function MorphOrb({ value, onChange, onValidate, onSubmit, onFailure, onPhaseChange, onClose, disabled }) {
  const [phase, setPhase] = useState('idle');
  const [shake, setShake] = useState(false);
  const aborted = useRef(false);
  const busy = phase !== 'idle' && phase !== 'success';
  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);
  useEffect(() => () => { aborted.current = true; }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (disabled || busy || phase === 'success') return;
    const message = value.trim();
    if (!message || !onValidate?.(message)) { setShake(true); window.setTimeout(() => setShake(false), 180); return; }
    aborted.current = false;
    const request = onSubmit(message);
    setPhase('sending');
    try {
      // Keep the sphere legible long enough to read as a deliberate delivery state.
      await Promise.all([request, wait(2650)]);
      if (aborted.current) return;
      setPhase('success-transition');
      await wait(660);
      if (!aborted.current) setPhase('success');
    } catch (error) {
      if (!aborted.current) { setPhase('idle'); onFailure?.(error); }
    }
  };

  return <div className={`mo-root${shake ? ' is-shaking' : ''}`} data-phase={phase}>
    <form className="mo-input" onSubmit={submit} noValidate>
      <svg className="mo-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7L10 3.5z" /></svg>
      <textarea className="mo-field" value={value} onChange={(event) => onChange(event.target.value)} maxLength="5000" rows="2" placeholder="Write your message…" aria-label="Message" disabled={disabled || busy} />
      <button type="submit" className="mo-send" aria-label="Send message" title="Send message" disabled={disabled || busy}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 19V5"/><path d="M5.5 11.5L12 5l6.5 6.5"/></svg></button>
    </form>
    {phase !== 'idle' && <section className="delivery-stage" aria-live="polite">
      <DeliverySphere phase={phase} />
      {phase === 'sending' && <p className="delivery-status">Sending message<span aria-hidden="true">…</span></p>}
      {phase === 'success' && <article className="delivery-success-card">
        <span className="delivery-check" aria-hidden="true">✓</span><small>received</small><h3>Message sent</h3>
        <p>Your message has been delivered. Basit will reply using the email you provided.</p>
        <button type="button" onClick={() => setPhase('idle')}>Send another message</button>
        <button className="delivery-dismiss" type="button" onClick={onClose}>Back to portfolio <span aria-hidden="true">↗</span></button>
      </article>}
    </section>}
  </div>;
}
