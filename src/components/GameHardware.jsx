import { useEffect, useRef } from 'react';
import './game-hardware.css';

export function useGameMotion(root, enabled=true, observe=false) {
 useEffect(()=>{
  const node=root.current,motion=matchMedia('(prefers-reduced-motion: reduce)');let visible=!observe;
  const sync=()=>node.toggleAttribute('data-running',enabled&&visible&&!document.hidden&&!motion.matches);
  const observer=observe?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}):null;
  observer?.observe(node);sync();document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  return()=>{observer?.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);node.removeAttribute('data-running');};
 },[root,enabled,observe]);
}
export function GameCartridgeArt({game}) {
 return <span className="bcv-cartridge-case"><span className="bcv-cartridge-grip" aria-hidden="true"/><span className="bcv-cartridge-screen"><img src={game.cover} alt="" decoding="async" draggable="false"/><i aria-hidden="true"/></span><span className="bcv-cartridge-contacts" aria-hidden="true"/><span className="bcv-cartridge-led" aria-hidden="true"/></span>;
}
export function GameCover({entries,live=true}) {
 const root=useRef(null);useGameMotion(root,live,true);
 return <div ref={root} className="bcv-game-jacket"><div className="bcv-handheld">
  <div className="bcv-handheld-screen"><div className="bcv-game-cover-grid">{entries.map((game,index)=><span className="bcv-game-cover-cartridge" key={game.id} style={{'--slot-angle':[-5,3,-2,4][index%4]+'deg'}}><GameCartridgeArt game={game}/></span>)}</div></div>
  <span className="bcv-handheld-dpad" aria-hidden="true"/><span className="bcv-handheld-buttons" aria-hidden="true"><i/><i/><i/><i/></span><span className="bcv-handheld-speaker" aria-hidden="true"/>
 </div><p className="bcv-game-cover-quote">A different world.<br/><em>One more adventure.</em></p></div>;
}
export function GameCartridge({game,index,interactive,onSelect}) {
 return <button className="bcv-game-cartridge" type="button" data-sound="silent" aria-haspopup="dialog" aria-label={'Details for '+game.title} disabled={!interactive} onClick={event=>{event.stopPropagation();onSelect?.(game,index,event.currentTarget);}}>
  <GameCartridgeArt game={game}/><span className="bcv-cartridge-caption"><small>{String(index+1).padStart(2,'0')}</small><strong>{game.title}</strong></span>
 </button>;
}
