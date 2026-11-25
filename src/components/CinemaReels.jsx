import { useEffect, useRef } from 'react';
import './cinema-reels.css';

export function ReelSpool({ className = '' }) {
  return <span className={'bcv-reel-spool ' + className} aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="22" r="10"/><circle cx="77" cy="41" r="10"/><circle cx="66" cy="73" r="10"/><circle cx="34" cy="73" r="10"/><circle cx="23" cy="41" r="10"/><circle cx="50" cy="50" r="5"/></svg></span>;
}

export function CinemaCover({ entries, live = true }) {
  const root = useRef(null);
  useEffect(() => {
    const node = root.current;
    if (!live) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)'); let visible = false;
    const sync = () => node.toggleAttribute('data-running', visible && !document.hidden && !motion.matches);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node); document.addEventListener('visibilitychange', sync); motion.addEventListener('change', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync); node.removeAttribute('data-running'); };
  }, [live]);
  return <div className="bcv-cinema-jacket" ref={root}>
    <div className="bcv-cinema-cover-reels" aria-hidden="true">
      <ReelSpool className="bcv-cover-spool-one"/><ReelSpool className="bcv-cover-spool-two"/>
      <div className="bcv-cover-film-collection">{[0,1,2,3].map(row => <div className="bcv-cover-film-strip" key={row}>
        {entries.slice(row*4,row*4+4).map(entry => <span key={entry.id}><img src={entry.cover} alt="" loading="lazy" decoding="async" draggable="false"/></span>)}
      </div>)}</div>
    </div>
    <p className="bcv-cinema-cover-quote">Worlds apart.<br/><em>Stories that stay.</em></p>
  </div>;
}

export function CinemaFilmReel({ entry, number, interactive, onSelect }) {
  return <button type="button" className="bcv-film-reel-button" data-sound="silent" disabled={!interactive} aria-haspopup="dialog" aria-label={'Details for ' + entry.title}
    onClick={event => { event.stopPropagation(); onSelect?.(entry, number, event.currentTarget); }}>
    <span className="bcv-film-reel-visual"><ReelSpool/><span className="bcv-film-reel-frame"><img src={entry.cover} alt="" decoding="async" draggable="false"/><i aria-hidden="true"/></span></span>
    <span className="bcv-film-reel-caption"><small>{String(number+1).padStart(2,'0')}</small><strong>{entry.title}</strong></span>
  </button>;
}
