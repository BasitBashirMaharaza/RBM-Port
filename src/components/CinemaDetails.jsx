import { useEffect, useLayoutEffect, useRef } from 'react';
import './cinema-preview.css';
import { ReelSpool } from './CinemaReels.jsx';

export default function CinemaDetails({ entry, index, anchor, onSound, onClosed }) {
  const dialog=useRef(null),closing=useRef(false),timer=useRef(null);
  const close=()=>{
    if(closing.current)return;closing.current=true;onSound?.('projectorClose');dialog.current.classList.add('is-closing');
    timer.current=setTimeout(onClosed,matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);
  };
  useEffect(()=>{
    const node=dialog.current,motion=matchMedia('(prefers-reduced-motion: reduce)');
    const sync=()=>node.toggleAttribute('data-running',!document.hidden&&!motion.matches);
    sync();document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
    return()=>{document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);};
  },[]);
  useLayoutEffect(()=>{
    const node=dialog.current,previous=document.activeElement;node.showModal();
    const place=()=>{
      const rect=anchor?.isConnected?anchor.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};
      const viewport=window.visualViewport,w=viewport?.width||innerWidth,h=viewport?.height||innerHeight,x=viewport?.offsetLeft||0,y=viewport?.offsetTop||0;
      const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
      const left=Math.max(x+12,Math.min(x+w-node.offsetWidth-12,cx-node.offsetWidth/2));
      const top=Math.max(y+12,Math.min(y+h-node.offsetHeight-12,cy-node.offsetHeight/2));
      node.style.left=left+'px';node.style.top=top+'px';node.style.transformOrigin=(cx-left)+'px '+(cy-top)+'px';
    };
    place();window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);
    return()=>{clearTimeout(timer.current);window.removeEventListener('resize',place);window.visualViewport?.removeEventListener('resize',place);node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[anchor]);
  return <dialog ref={dialog} className="bcv-cinema-preview" aria-labelledby="bcv-cinema-preview-title" onCancel={event=>{event.preventDefault();event.stopPropagation();close();}} onKeyDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)close();}}>
    <article className="bcv-cinema-preview-card">
      <div className="bcv-cinema-pass-header"><span className="bcv-cinema-pass-projector" aria-hidden="true"><ReelSpool/><ReelSpool/><i/></span><span>THE PERSONAL<br/><b>PICTURE HOUSE</b></span></div>
      <button type="button" className="bcv-cinema-preview-close" aria-label="Close movie details" autoFocus onClick={close} data-sound="silent">×</button>
      <div className="bcv-cinema-pass-screen">
        <div className="bcv-cinema-preview-poster"><img src={entry.cover} alt={entry.artAlt} decoding="async"/><i aria-hidden="true"/></div>
        <div className="bcv-cinema-pass-title"><span className="bcv-cinema-preview-meta">{entry.year} <i/> {entry.kind}</span><h3 id="bcv-cinema-preview-title">{entry.title}</h3><p className="bcv-cinema-preview-genre">{entry.genre}</p></div>
      </div>
      <div className="bcv-cinema-pass-notes"><p className="bcv-cinema-preview-description">{entry.description}</p><p className="bcv-cinema-preview-credit"><span>THE PEOPLE BEHIND THE STORY</span>{entry.credit}</p></div>
      <div className="bcv-cinema-pass-stub"><div className="bcv-cinema-pass-number"><span>REEL</span><b>{String(index+1).padStart(2,'0')}</b></div><div className="bcv-cinema-preview-links"><a href={entry.url} target="_blank" rel="noopener noreferrer" data-sound="silent">Explore title <span>↗</span></a><a href={entry.artSource} target="_blank" rel="noopener noreferrer" data-sound="silent">Poster source <span>↗</span></a></div></div>
    </article>
  </dialog>;
}
