import { useEffect, useRef, useState } from 'react';
import './morph-orb.css';

// Adapted directly from the supplied MorphOrb reference: the same launch →
// assemble → thinking → resolve → condense → completion sequence and easing.
const labels = ['Thinking', 'Searching', 'Analyzing', 'Composing'];
const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const TAU = Math.PI * 2;
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const referenceDots = (() => {
  const dots = [];
  for (let ring = 0; ring < 16; ring += 1) {
    const y = 1 - ((ring + .5) / 16) * 2;
    const radius = Math.sqrt(1 - y * y);
    const count = Math.max(4, Math.round(30 * radius));
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * TAU + ring * .35;
      dots.push({ x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, u: (1 - y) / 2 });
    }
  }
  return dots;
})();

export default function MorphOrb({ value, onChange, onValidate, onSubmit, onFailure, onPhaseChange, onClose, disabled }) {
  const [phase, setPhase] = useState('idle');
  const [label, setLabel] = useState(labels[0]);
  const [answer, setAnswer] = useState('');
  const [shake, setShake] = useState(false);
  const canvasRef = useRef(null);
  const rootRef = useRef(null);
  const abortRef = useRef(false);
  const phaseRef = useRef('idle');
  const busy = phase !== 'idle' && phase !== 'answered';

  useEffect(() => { phaseRef.current = phase; onPhaseChange?.(phase); }, [phase, onPhaseChange]);
  useEffect(() => () => { abortRef.current = true; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !['assemble', 'think', 'resolve', 'condense'].includes(phase)) return undefined;
    const ctx = canvas.getContext('2d');
    const size = 286, dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let frame = 0; let started = performance.now(); let previous = started;
    const draw = (now) => {
      const elapsed = (now - started) / 1000; previous = now;
      const collapsing = phaseRef.current === 'condense';
      const resolving = phaseRef.current === 'resolve';
      ctx.clearRect(0, 0, size, size);
      const assembly = ease(Math.min(1, elapsed / .8));
      referenceDots.forEach((p, i) => {
        const spin = elapsed * (collapsing ? 2.45 : .9) + (collapsing ? (1 - assembly) * 2.4 : 0);
        const x = p.x * Math.cos(spin) - p.z * Math.sin(spin);
        const z = p.x * Math.sin(spin) + p.z * Math.cos(spin);
        const depth = (z + 1) / 2;
        const illumination = Math.max(0, Math.sin(elapsed * 2.6 + i * .17)) ** 2;
        const reveal = clamp01(assembly * 1.6 - p.u * .6);
        const vortex = collapsing ? 1 - (elapsed % .8) / .8 : 0;
        const radius = (78 + depth * 22) * reveal * (collapsing ? Math.max(.08, vortex) : 1);
        const alpha = reveal * (resolving ? .75 : .24 + depth * .43 + illumination * .22);
        const green = clamp01((resolving ? 1 : 0) * 1.1 - p.u * .82);
        ctx.fillStyle = `rgba(${Math.round(235 - green * 183)},${Math.round(235 - green * 24)},${Math.round(235 - green * 82)},${alpha})`;
        ctx.beginPath(); ctx.arc(size / 2 + x * radius, size / 2 - p.y * radius, (.85 + depth * 1.8 + illumination) * reveal, 0, TAU); ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const submit = async (event) => {
    event.preventDefault();
    if (disabled || busy || phase === 'answered') return;
    const text = value.trim();
    if (!text || !onValidate?.(text)) {
      setShake(true); window.setTimeout(() => setShake(false), 260); return;
    }
    abortRef.current = false;
    const rootBounds = rootRef.current?.getBoundingClientRect();
    const sendBounds = event.currentTarget.querySelector('.mo-send')?.getBoundingClientRect();
    if (rootBounds && sendBounds) rootRef.current.style.setProperty('--mo-origin-x', `${sendBounds.left + sendBounds.width / 2 - (rootBounds.left + rootBounds.width / 2)}px`);
    setPhase('launch');
    await wait(360);
    if (abortRef.current) return;
    setPhase('assemble');
    await wait(1000);
    if (abortRef.current) return;
    setPhase('think');
    let labelIndex = 0;
    const labelTimer = window.setInterval(() => { labelIndex = (labelIndex + 1) % labels.length; setLabel(labels[labelIndex]); }, 1150);
    try {
      const [result] = await Promise.all([onSubmit(text), wait(3450)]);
      window.clearInterval(labelTimer);
      if (abortRef.current) return;
      setLabel('Done'); setPhase('resolve'); await wait(900);
      setPhase('condense'); await wait(800);
      setAnswer(result || 'Message Sent Successfully'); setPhase('unfold'); await wait(850);
      setPhase('answered');
    } catch (error) {
      window.clearInterval(labelTimer);
      if (!abortRef.current) { setPhase('idle'); onFailure?.(error); }
    }
  };

  const reset = () => { setAnswer(''); setLabel(labels[0]); setPhase('idle'); };
  return <div className="mo-root" data-phase={phase} ref={rootRef}>
    <div className="mo-halo" aria-hidden="true" />
    <div className={`mo-mover ${shake ? 'is-shaking' : ''}`}>
      <div className="mo-actor">
        <div className="mo-surface" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="mo-ball" aria-hidden="true" />
        <div className="mo-green" aria-hidden="true" />
        <form className="mo-input" onSubmit={submit} noValidate>
          <svg className="mo-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7L10 3.5z" /></svg>
          <textarea className="mo-field" value={value} onChange={(e) => onChange(e.target.value)} maxLength="5000" rows="2" placeholder="Write your message…" aria-label="Message" disabled={disabled || busy} />
          <button type="submit" className="mo-send" aria-label="Send message" disabled={disabled || busy}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 19V5"/><path d="M5.5 11.5L12 5l6.5 6.5"/></svg></button>
        </form>
        <canvas className="mo-orb" ref={canvasRef} aria-hidden="true" />
        <div className="mo-answer" role="status" aria-live="polite"><span className="mo-answer-dot" /><strong>Message Sent Successfully</strong><p>Your message has been delivered.</p></div>
      </div>
    </div>
    <div className="mo-status" aria-live="polite">{['think', 'resolve'].includes(phase) && <><span>{label}</span>{label !== 'Done' && <i className="mo-dots">•••</i>}</>}</div>
    {phase === 'answered' && <div className="mo-completion-actions"><button className="mo-back" type="button" onClick={onClose}>Back to Portfolio</button><button className="mo-reset" type="button" onClick={reset}>New message</button></div>}
  </div>;
}
