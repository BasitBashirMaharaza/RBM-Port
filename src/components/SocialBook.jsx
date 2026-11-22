import {useEffect,useRef} from 'react';
import './social-book.css';

export function SocialMark({id}){
 return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{id==='instagram'?<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/></>:id==='youtube'?<><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z" fill="currentColor" stroke="none"/></>:id==='x'?<><path d="m5 4 14 16h-4L1 4h4Zm-2 16L19 4" transform="translate(2 0) scale(.9 1)"/></>:<path d="M12 3c-3.2 0-4.5 2.4-4.5 5.4 0 .8.1 1.5.1 2.2-.5.3-1.6-.8-2.3-.3-.7.6.4 1.6 1.5 2.1-.5 2-1.8 3.5-3.4 4 .1 1.1 1.4 1.4 2.6 1.6l.5 1.4c1.5-.4 2.7-.2 3.4.4.6.5 1.2.8 2.1.8s1.5-.3 2.1-.8c.7-.6 1.9-.8 3.4-.4L18 18c1.2-.2 2.5-.5 2.6-1.6-1.6-.5-2.9-2-3.4-4 1.1-.5 2.2-1.5 1.5-2.1-.7-.5-1.8.6-2.3.3 0-.7.1-1.4.1-2.2C16.5 5.4 15.2 3 12 3Z"/>}</svg>;
}
function useSocialMotion(root,enabled,observe=false){
 useEffect(()=>{
  const node=root.current,motion=matchMedia('(prefers-reduced-motion: reduce)');let visible=!observe;
  const sync=()=>node.toggleAttribute('data-running',enabled&&visible&&!document.hidden&&!motion.matches);
  const observer=observe?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}):null;
  observer?.observe(node);sync();document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  return()=>{observer?.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);node.removeAttribute('data-running');};
 },[root,enabled,observe]);
}
export function SocialCover({entries,live=true}){
 const root=useRef(null);useSocialMotion(root,live,true);
 return <div ref={root} className="bcv-social-jacket"><div className="bcv-social-cover-scene" aria-hidden="true"><svg className="bcv-social-cover-signals" viewBox="0 0 300 340" fill="none"><path d="M45 35C45 130 150 90 150 165S255 230 255 290M255 100c-80 0-40 65-105 65S40 205 40 285"/><circle cx="150" cy="165" r="64"/></svg><div className="bcv-social-cover-hub is-portrait"><img src="/portfolio_photo.webp" alt="" decoding="async" draggable="false"/><i/></div>{entries.map(entry=><span key={entry.id} className={'bcv-social-cover-badge badge-'+entry.id} style={{'--social-accent':entry.accent}}><SocialMark id={entry.id}/></span>)}</div><p className="bcv-social-cover-quote">Moments. Stories.<br/><em>A little more of my world.</em></p></div>;
}
export function SocialArtwork({entry}){
 return <span className={'bcv-social-artwork social-art-'+entry.id}>
  {entry.id==='instagram'&&<><span className="bcv-social-camera-lens"><svg viewBox="0 0 100 100" fill="none"><path d="m50 18 28 16v32L50 82 22 66V34Z"/><path d="m50 18 10 26 18-10M78 66l-28-4v20M22 66l18-22-18-10M40 44h20l-10 18Z"/></svg></span><span className="bcv-social-camera-reflection"/></>}
  {entry.id==='youtube'&&<><span className="bcv-social-video-screen"><svg viewBox="0 0 100 30" fill="none"><path d="M3 15h8l3-6 7 13 5-16 6 20 6-17 5 10 5-6 5 2h44"/></svg></span><span className="bcv-social-video-timeline"><i/><i/><i/><b/></span></>}
  {entry.id==='x'&&<span className="bcv-social-thought"><span>Think.</span><span>Share.</span><em>Connect.</em><i/></span>}
  {entry.id==='snapchat'&&<><span className="bcv-social-snap-ghost"><SocialMark id="snapchat"/></span><span className="bcv-social-snap-bubble bubble-one"/><span className="bcv-social-snap-bubble bubble-two"/></>}
  <span className="bcv-social-platform-mark"><SocialMark id={entry.id}/></span><i aria-hidden="true"/>
 </span>;
}
export default function SocialBookPage({item,spread,side,interactive=true,onSocialSelect}){
 const root=useRef(null),index=spread*2+(side==='left'?0:1),entry=item.entries[index];useSocialMotion(root,interactive);
 return <div ref={root} className={'bcv-paper-page bcv-social-page social-page-'+entry.id} style={{'--social-accent':entry.accent}}>
  <span className="bcv-page-folio">{String(index+1).padStart(2,'0')}</span>
  <header className="bcv-social-page-heading"><span className="bcv-page-eyebrow">{entry.label}</span><h3>{entry.title}</h3><p>{entry.caption}</p></header>
  <button type="button" className="bcv-social-profile-tile" data-sound="silent" aria-haspopup="dialog" aria-label={'View '+entry.title+' profile'} disabled={!interactive} onClick={event=>{event.stopPropagation();onSocialSelect?.(entry,index,event.currentTarget);}}><SocialArtwork entry={entry}/><span className="bcv-social-profile-handle">{entry.handle}<i aria-hidden="true">↗</i></span><span className="bcv-social-tile-description">{entry.description}</span></button>
  <div className="bcv-social-page-footer"><span>BEYOND THE FEED / {String(index+1).padStart(2,'0')}</span><span>VIEW PROFILE ↗</span></div>
 </div>;
}


