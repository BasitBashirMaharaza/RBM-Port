import { useEffect, useRef } from 'react';
import { CinemaFilmReel } from './CinemaReels.jsx';
import './cinema-book.css';

const chapters=[
 {title:'Beyond the ordinary.',label:'DREAMS & DOUBLE LIVES',note:'Space, dreams and the choices that change everything.'},
 {title:'A new chapter.',label:'ADVENTURES & ALTER EGOS',note:'Pirates, history and the people behind the mask.'},
 {title:'Worlds worth entering.',label:'MYTHS, MAGIC & CONSEQUENCES',note:'Long journeys, hidden worlds and complicated heroes.'},
 {title:'Just one more episode.',label:'AFTER THE CREDITS',note:'Power, survival and mysteries that refuse to let go.'},
];
export default function CinemaPage({ item, spread, side, interactive=true, onMovieSelect }) {
 const root=useRef(null),leaf=spread*2+(side==='left'?0:1),chapter=chapters[leaf],start=leaf*4;
 useEffect(()=>{
  const node=root.current,motion=matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>node.toggleAttribute('data-running',interactive&&!document.hidden&&!motion.matches);
  sync();document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  return()=>{document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);};
 },[interactive]);
 return <div ref={root} className={'bcv-paper-page bcv-cinema-page cinema-leaf-'+leaf}>
  <span className="bcv-page-folio">{String(leaf+1).padStart(2,'0')}</span>
  <header className="bcv-cinema-heading"><span className="bcv-page-eyebrow">{chapter.label}</span><h3>{chapter.title}</h3><p>{chapter.note}</p></header>
  <div className="bcv-cinema-reel-grid" aria-label={'Films and series: '+chapter.title}>
   {item.entries.slice(start,start+4).map((entry,index)=><CinemaFilmReel key={entry.id} entry={entry} number={start+index} interactive={interactive} onSelect={onMovieSelect}/>)}
  </div>
  <footer className="bcv-cinema-footer"><span>THE PERSONAL PICTURE HOUSE</span><span>TAP A REEL ↗</span></footer>
 </div>;
}
