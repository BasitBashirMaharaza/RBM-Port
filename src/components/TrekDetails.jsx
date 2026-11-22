import {useEffect,useLayoutEffect,useRef} from 'react';
import {TrailCamp,TrailContours} from './TrekkingBook.jsx';
function Compass(){return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="16"/><path d="m20 7 4 13-4 13-4-13Zm-13 13h26"/></svg>;}
export default function TrekDetails({entry,index,anchor,onClosed}){
 const dialog=useRef(null),timer=useRef(null),closing=useRef(false),film=useRef(null);
 const close=()=>{if(closing.current)return;closing.current=true;film.current?.pause();dialog.current.classList.add('is-closing');timer.current=setTimeout(onClosed,matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);};
 useLayoutEffect(()=>{
  const node=dialog.current,previous=document.activeElement;node.showModal();
  const place=()=>{const rect=anchor?.isConnected?anchor.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};node.style.transformOrigin=`${rect.left+rect.width/2-node.getBoundingClientRect().left}px ${rect.top+rect.height/2-node.getBoundingClientRect().top}px`;};place();
  window.addEventListener('resize',place);
  return()=>{clearTimeout(timer.current);window.removeEventListener('resize',place);node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[anchor]);
 useEffect(()=>{const pause=()=>{if(document.hidden)film.current?.pause();};document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause);},[]);
 return <dialog ref={dialog} className="bcv-trail-preview" aria-labelledby="bcv-trail-detail-title" onCancel={event=>{event.preventDefault();event.stopPropagation();close();}} onKeyDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)close();}}>
  <article className="bcv-trail-dossier"><TrailContours/><div className="bcv-trail-dossier-bar"><span className="bcv-trail-log-mark"><Compass/><span>BASIT’S TRAIL JOURNAL<small>FIELD NOTE {String(index+1).padStart(2,'0')} / KASHMIR</small></span></span><button type="button" onClick={close} aria-label="Close trek details" data-sound="silent" autoFocus>×</button></div>
   <div className="bcv-trail-dossier-photo">{entry.cover?<img src={entry.cover} alt={entry.alt} decoding="async"/>:<TrailCamp/>}<span>FROM MY TRAIL CAMERA</span></div>
   <div className="bcv-trail-dossier-copy"><span>{entry.region}</span><h3 id="bcv-trail-detail-title">{entry.title}</h3><p className="bcv-trail-dossier-subtitle">{entry.subtitle}</p><div className="bcv-trail-stats"><span><small>LANDSCAPE</small>{entry.terrain}</span><span><small>SETTING</small>{entry.altitude}</span></div><section className="bcv-trail-field-notes" aria-label="About this trail"><h4>On the trail</h4><p>{entry.description}</p><p>{entry.detail}</p></section><div className="bcv-trail-route"><span>THE TRAIL, AT A GLANCE</span><ol>{entry.route.map(stop=><li key={stop}>{stop}</li>)}</ol></div><a className="bcv-trail-reference" href={entry.source} target="_blank" rel="noopener noreferrer" data-sound="silent">Trail reference · {entry.sourceName} ↗</a>
   {entry.extra&&<figure className="bcv-trail-extra"><img src={entry.extra.image} alt={entry.extra.label} loading="lazy" decoding="async"/><figcaption>{entry.extra.label}</figcaption></figure>}
   <details className="bcv-trail-film" onToggle={event=>{if(!event.currentTarget.open)film.current?.pause();}}><summary>A few moments outdoors <span>WATCH TRAIL FILM ↗</span></summary><video ref={film} controls playsInline preload="none" poster="/beyond-cv/trails/tulian-forest.jpg" src="/beyond-cv/trails/trail-film.mp4"/><p>A personal trekking film.</p></details>
   </div>
  </article>
 </dialog>;
}
