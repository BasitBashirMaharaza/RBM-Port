import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './michigan-certificate.css';

export default function MichiganCertificateOverlay({ onClosed, triggerRef, imageSrc = '/certificates/michigan-applied-ml.png', certificateLabel = 'Applied Machine Learning in Python certificate', imageAlt = 'University of Michigan Applied Machine Learning in Python certificate awarded to Basit Bashir Maharaza' }) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const timerRef = useRef(null);
  const dialogRef = useRef(null);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    timerRef.current = window.setTimeout(onClosed, matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 360);
  };

  useEffect(() => {
    const root = document.getElementById('root');
    const previousInert = root?.inert;
    const previousOverflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        event.preventDefault();
        dialogRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timerRef.current);
      document.removeEventListener('keydown', onKeyDown);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    };
  }, []);

  return createPortal(
    <div className={`michigan-certificate-overlay${closing ? ' is-closing' : ''}`} onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="michigan-certificate-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-label={certificateLabel} tabIndex={-1}>
        <img src={imageSrc} alt={imageAlt} />
      </div>
    </div>,
    document.body,
  );
}
