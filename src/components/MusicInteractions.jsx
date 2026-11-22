import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import './music-interactions.css';
import './song-record-preview.css';
const time=value=>`${Math.floor((value||0)/60)}:${String(Math.floor((value||0)%60)).padStart(2,'0')}`;

export function MusicTurntable({player,interactive=true}){
 const deck=useRef(null),drag=useRef(null),suppress=useRef(false),[angle,setAngle]=useState(player?.stylusOn?33:0);
 const on=!!player?.stylusOn,song=player?.song,loading=!!player?.loading;
 const title=song?.title||'Choose a record';
 useEffect(()=>{if(!drag.current)setAngle(on?33:0);},[on]);
 const move=event=>{
  const gesture=drag.current;if(!gesture)return;event.stopPropagation();
  if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<5&&!gesture.moved)return;
  gesture.moved=true;const rect=deck.current.getBoundingClientRect(),pivotX=rect.left+rect.width*.86,pivotY=rect.top+rect.height*.18;
  const next=Math.max(0,Math.min(40,Math.atan2(pivotX-event.clientX,event.clientY-pivotY)*180/Math.PI));gesture.angle=next;setAngle(next);
  if(next<18&&on)player.setStylus(false);
 };
 const end=event=>{
  const gesture=drag.current;if(!gesture)return;drag.current=null;event.stopPropagation();
  if(gesture.moved){suppress.current=true;player.setStylus(event.type!=='pointercancel'&&gesture.angle>=18);}
  else if(event.type==='pointercancel')setAngle(on?33:0);
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
 };
 return <div className={'bcv-turntable'+(song?' has-song':'')} style={{'--record-accent':song?.accent||'#9eaca1'}} aria-busy={loading} data-music-control onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
  <div className="bcv-turntable-slot"><div ref={deck} className={'bcv-turntable-deck'+(player?.playing?' is-playing':'')+(loading?' is-loading':'')+(song?' has-song':'')}>
   <span className="bcv-deck-label">BB / ANALOGUE 01</span>
   <div className="bcv-turntable-platter"><div className="bcv-turntable-disc"><span>{song?<img className="bcv-record-label-art" src={song.cover} alt=""/>:<><small>YOUR SELECTION</small><b>bb.</b></>}<i className="bcv-record-label-hole"/></span></div></div>
   <div className="bcv-stylus-pivot"/>
   <button className="bcv-stylus" style={{transform:`rotate(${angle}deg)`}} type="button" disabled={!interactive||!song||loading} aria-label={!song?'Choose a song tile to load a preview':on?'Lift stylus and pause '+title:'Place stylus on record and play '+title} aria-pressed={on} data-sound="silent"
    onPointerDown={event=>{if(event.button!==0)return;event.stopPropagation();drag.current={x:event.clientX,y:event.clientY,angle,moved:false};suppress.current=false;event.currentTarget.setPointerCapture(event.pointerId);}}
    onPointerMove={move} onPointerUp={end} onPointerCancel={end}
    onClick={()=>{if(suppress.current){suppress.current=false;return;}player?.setStylus(!on);}}><span className="bcv-stylus-rod"/><span className="bcv-stylus-head"/><span className="sr-only">Drag or press to move the stylus</span></button>
   <span className={'bcv-turntable-led'+(player?.playing?' is-on':'')}/><span className="bcv-turntable-speed">33⅓ RPM</span>
  </div></div>
  <div className="bcv-turntable-info"><strong>{title}{song&&<span> — {song.artist}</span>}</strong><small aria-live="polite">{player?.error||(loading?'Loading your record…':!song?'Open a song tile, then tap Preview':on?'Lift the stylus to pause':'Drag or tap the stylus to play')}</small></div>
  <div className="bcv-turntable-seek"><span>{time(player?.position)}</span><input type="range" aria-label={'Seek '+(song?.title||'preview')} min="0" max={player?.duration||1} step="0.1" value={player?.position||0} disabled={!interactive||loading||!player?.duration} onChange={e=>player.seek(+e.target.value)}/><span>{time(player?.duration)}</span></div>
  <label className="bcv-turntable-volume">VOL<input type="range" aria-label="Turntable volume" min="0" max="1" step=".01" value={player?.volume??.55} disabled={!interactive} onChange={e=>player.setVolume(+e.target.value)}/></label>
 </div>;
}

export function SongDetails({song,index,anchor,onPreview,onClosed}){
 const dialog=useRef(null),closing=useRef(false),timer=useRef(null);
 const close=()=>{if(closing.current)return;closing.current=true;dialog.current.classList.add('is-closing');timer.current=setTimeout(onClosed,matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);};
 useLayoutEffect(()=>{
  const node=dialog.current,previous=document.activeElement;node.showModal();
  const place=()=>{
   const rect=anchor?.isConnected?anchor.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};
   const viewport=window.visualViewport,width=viewport?.width||innerWidth,height=viewport?.height||innerHeight;
   const offsetX=viewport?.offsetLeft||0,offsetY=viewport?.offsetTop||0;
   const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;
   const left=Math.max(offsetX+12,Math.min(offsetX+width-node.offsetWidth-12,centerX-node.offsetWidth/2));
   const top=Math.max(offsetY+12,Math.min(offsetY+height-node.offsetHeight-12,centerY-node.offsetHeight/2));
   node.style.left=left+'px';node.style.top=top+'px';
   node.style.setProperty('--song-origin-x',(centerX-left)+'px');node.style.setProperty('--song-origin-y',(centerY-top)+'px');
  };
  place();window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);
  return()=>{clearTimeout(timer.current);window.removeEventListener('resize',place);window.visualViewport?.removeEventListener('resize',place);node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[anchor]);
 return <dialog ref={dialog} className="bcv-song-dialog bcv-song-popover" aria-labelledby="bcv-song-title" onCancel={e=>{e.preventDefault();e.stopPropagation();close();}} onKeyDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)close();}}>
  <article className="bcv-song-card bcv-record-preview">
   <div className="bcv-record-preview-masthead"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="2"/><path d="M5 10a5 5 0 0 1 5-5m5 5a5 5 0 0 1-5 5"/></svg><span>BASIT'S RECORD SHELF</span></div>
   <button type="button" className="bcv-song-close" aria-label="Close song details" onClick={close} autoFocus data-sound="silent">×</button>
   <div className="bcv-song-preview-heading">
    <div className="bcv-song-sleeve"><div className="bcv-song-mini-vinyl" aria-hidden="true"><span><img src={song.cover} alt=""/></span></div><div className="bcv-song-art"><img src={song.cover} alt={song.title+' cover artwork'} decoding="async"/></div><button type="button" className="bcv-song-preview-button" aria-label={'Preview '+song.title} data-sound="silent" onClick={event=>{event.stopPropagation();const rect=event.currentTarget.parentElement.querySelector('.bcv-song-art').getBoundingClientRect();onPreview?.(song,{left:rect.left,top:rect.top,width:rect.width,height:rect.height});}}><svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 1 8 5-8 5Z"/></svg>Preview</button></div>
    <div className="bcv-song-preview-copy"><span className="bcv-song-eyebrow">SIDE {index<5?'A':'B'} / TRACK {String(index+1).padStart(2,'0')}</span><h3 id="bcv-song-title">{song.title}</h3><p>{song.artist}</p></div>
   </div>
   <div className="bcv-record-listen-label"><span>LISTEN ON</span><i aria-hidden="true"/></div>
   <div className="bcv-song-links">
    <a href={song.url} target="_blank" rel="noopener noreferrer" data-sound="silent"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M6.3 9c3.8-1.2 7.6-.9 11.4 1M7.2 12.4c3.3-.9 6.2-.6 9.4.9m-8.6 2.3c2.7-.7 4.9-.4 7.4.6"/></svg>Spotify <span>↗</span></a>
    <a href={song.youtubeMusic} target="_blank" rel="noopener noreferrer" data-sound="silent"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="7"/><path d="m10 8 6 4-6 4Z"/></svg>YouTube Music <span>↗</span></a>
   </div>
   <div className="bcv-record-preview-footer"><span>THE PERSONAL SOUNDTRACK</span><svg viewBox="0 0 62 14" fill="none" aria-hidden="true"><path d="M1 7h9l3-4 4 8 5-10 5 12 4-8 4 4 4-2h22"/></svg></div>
  </article>
 </dialog>;
}
