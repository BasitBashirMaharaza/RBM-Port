import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import contributions from './journal-contributions.json';

export default function JournalContributionOverlay({ trigger, onClosed }) {
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef(null);
  const closingRef = useRef(false);
  const timerRef = useRef(null);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    timerRef.current = window.setTimeout(onClosed,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 340);
  };

  useEffect(() => {
    const root = document.getElementById('root');
    const previousInert = root?.inert;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    if (scrollbar > 0) {
      document.body.style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar) + 'px';
    }
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
      if (event.key === 'Tab') {
        const targets = [...dialogRef.current.querySelectorAll('button, a[href], [tabindex="0"]')];
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.clearTimeout(timerRef.current);
      document.removeEventListener('keydown', onKey, true);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div className={'journal-contribution-overlay' + (closing ? ' is-closing' : '')}
      onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section onKeyDown={(event) => event.stopPropagation()} ref={dialogRef} className="journal-contribution-window" role="dialog"
        aria-modal="true" aria-labelledby="journal-contribution-title" tabIndex={-1}>
        <div className="journal-contribution-window-top">
          <span>GITHUB · BASIT BASHIR</span>
          <button type="button" className="journal-contribution-close" aria-label="Close contributions" onClick={close}>×</button>
        </div>
        <div className="journal-contribution-intro">
          <h2 id="journal-contribution-title">Building in public<span>.</span></h2>
          <p><strong>{contributions.total}</strong> public contributions</p>
        </div>
        <div className="journal-contribution-calendar-scroll" tabIndex={0}
          role="region" aria-label="Contribution calendar. Scroll horizontally on small screens.">
          <div className="journal-contribution-calendar"
            role="img" aria-label={contributions.total + ' public contributions from ' + contributions.days[0].date + ' through ' + contributions.updated}>
            <div className="journal-contribution-months" aria-hidden="true">
              {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((month, index) => <span key={index}>{month}</span>)}
            </div>
            <div className="journal-contribution-grid journal-contribution-grid-large" aria-hidden="true">
              {contributions.days.map((day) => <i key={day.date} data-level={day.level}
                title={day.date + ' · ' + day.count + (day.count === 1 ? ' contribution' : ' contributions')} />)}
            </div>
          </div>
        </div>
        <div className="journal-contribution-window-bottom">
          <p>Public activity snapshot · Updated {contributions.updated}</p>
          <div className="journal-contribution-key" aria-label="Contribution intensity from less to more">
            <span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} />)}<span>More</span>
          </div>
        </div>
        <a className="journal-contribution-profile" href={contributions.source} target="_blank" rel="noreferrer">
          View GitHub profile <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>,
    document.body,
  );
}
