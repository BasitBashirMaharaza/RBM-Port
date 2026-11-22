import { useEffect, useRef } from 'react';
import './music-mosaic-cover.css';

// The jacket reuses the same artwork as the song-detail dialogs.
export default function MusicMosaicCover({ entries, live = true }) {
  const root = useRef(null);
  useEffect(() => {
    const node = root.current;
    if (!node || !live) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => node.toggleAttribute('data-playing', visible && !document.hidden && !motion.matches);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    return () => {
      observer.disconnect(); document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync); node.removeAttribute('data-playing');
    };
  }, [live]);
  const rows = [entries.slice(0, 3), entries.slice(3, 5), entries.slice(5, 8), entries.slice(8, 10)];
  const angles = [-8, 4, -3, 5, -5, 3, 8, -4, 5, -6];
  let index = 0;
  return <div className="bcv-music-mosaic" ref={root} aria-hidden="true">
    <div className="bcv-mosaic-bed" />
    <p className="bcv-music-cover-quote">A little space.<br />A little soul.<br /><em>Always on repeat.</em></p>
    <div className="bcv-album-collection">
      {rows.map((row, rowIndex) => <div className="bcv-album-row" key={rowIndex}>
        {row.map(song => {
          const number = index++;
          return <div className="bcv-album-glass" key={song.url} style={{ '--album-angle': angles[number] + 'deg' }}>
            <span className="bcv-album-fallback"></span>
            <img src={song.cover} alt="" title={song.title + ' · ' + song.artist} loading="eager" decoding="async" draggable="false" onError={event => { event.currentTarget.hidden = true; }} />
            <span className="bcv-album-reflection" />
          </div>;
        })}
      </div>)}
    </div>
  </div>;
}
