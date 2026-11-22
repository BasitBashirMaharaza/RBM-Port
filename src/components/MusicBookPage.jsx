import { useEffect, useRef } from 'react';
import { MusicTurntable } from './MusicInteractions.jsx';
import './music-book-pages.css';

function SongTiles({ entries, offset, interactive, onSongSelect }) {
  const root = useRef(null);
  useEffect(() => {
    const node = root.current, motion = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => node.toggleAttribute('data-floating', interactive && !document.hidden && !motion.matches);
    sync(); document.addEventListener('visibilitychange', sync); motion.addEventListener('change', sync);
    return () => { document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync); };
  }, [interactive]);
  return <ol ref={root} className="bcv-song-tiles" start={offset + 1} aria-label={'Favourite songs, side ' + (offset ? 'B' : 'A')}>
    {entries.map((song, index) => <li key={song.url} style={{ '--tile-delay': `${-index * 1.1}s`, '--tile-angle': `${[-4, 3, 2, -3, 3][index]}deg` }}>
      <button type="button" className="bcv-song-tile" data-sound="silent" disabled={!interactive} aria-haspopup="dialog" aria-label={'Details for ' + song.title + ' by ' + song.artist}
        onClick={event => { event.stopPropagation(); onSongSelect?.(song, offset + index, event.currentTarget); }}>
        <span className="bcv-song-tile-glass"><img src={song.cover} alt="" decoding="async" draggable="false" /><i aria-hidden="true" /></span>
        <span className="bcv-song-tile-caption"><small>{String(offset + index + 1).padStart(2, '0')}</small><strong>{song.title}</strong></span>
      </button>
    </li>)}
  </ol>;
}

export default function MusicBookPage({ item, spread, side, onSongSelect, player, interactive }) {
  const trackPage = (spread === 0 && side === 'right') || (spread === 1 && side === 'left');
  const offset = spread === 0 ? 0 : 5;
  return <div className={'bcv-paper-page bcv-music-page bcv-music-redesign ' + (trackPage ? 'is-track-page' : 'is-music-art-page is-turntable-page')} style={{ '--jacket': item.color, '--jacket-ink': item.ink }}>
    <span className="bcv-page-folio">{String(spread * 2 + (side === 'left' ? 1 : 2)).padStart(2, '0')}</span>
    <span className="bcv-page-eyebrow">{trackPage ? `SIDE ${spread === 0 ? 'A' : 'B'} / ${offset + 1}—${offset + 5}` : 'THE PERSONAL SOUNDTRACK'}</span>
    <h3>{trackPage ? (spread === 0 ? 'On repeat.' : 'Keep it playing.') : (spread === 0 ? 'A little louder.' : 'One more listen.')}</h3>
    {trackPage ? <>
      <p className="bcv-music-list-note">A small collection. Tap to explore ↗</p>
      <SongTiles entries={item.entries.slice(offset, offset + 5)} offset={offset} interactive={interactive} onSongSelect={onSongSelect} />
      <span className="bcv-music-page-footer">BASIT'S PERSONAL SOUNDTRACK · {offset ? '06—10' : '01—05'}</span>
    </> : <>
      <MusicTurntable player={player} interactive={interactive} />
      <p className="bcv-music-inscription">{spread === 0 ? item.caption : item.note}</p>
      <span className="bcv-music-page-footer">10 PREVIEWS / TWO SIDES / YOUR SELECTION</span>
    </>}
  </div>;
}

