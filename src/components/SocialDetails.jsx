import { useEffect, useLayoutEffect, useRef } from 'react';
import './social-book.css';
import {SocialMark} from './SocialBook.jsx';

export default function SocialDetails({ entry, index, anchor, onSound, onClosed }) {
  const dialog=useRef(null),closing=useRef(false),timer=useRef(null);
  const close=()=>{
    if(closing.current)return;closing.current=true;onSound?.('socialClose');dialog.current.classList.add('is-closing');
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
  return <dialog ref={dialog} className="bcv-social-preview" aria-labelledby="bcv-social-preview-title" onCancel={event=>{event.preventDefault();event.stopPropagation();close();}} onKeyDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)close();}}>
    <article className="bcv-social-preview-card" style={{'--social-accent':entry.accent}}>
      <div className="bcv-social-preview-banner"><SocialMark id={entry.id}/><span>BEYOND THE FEED</span></div>
      <button type="button" className="bcv-social-preview-close" aria-label="Close social profile" autoFocus onClick={close} data-sound="silent">×</button>
      <div className="bcv-social-preview-identity"><SocialMark id={entry.id}/><span aria-hidden="true">↗</span></div>
      <div className="bcv-social-preview-copy"><span className="bcv-social-preview-platform">{entry.title}</span><h3 id="bcv-social-preview-title">{entry.handle}</h3><p>{entry.description}</p></div>
      <a className="bcv-social-visit" href={entry.url} target="_blank" rel="noopener noreferrer" data-sound="silent">Open {entry.title}<span>↗</span></a>
    </article>
  </dialog>;
}
