import TrekDetails from './TrekDetails.jsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { beyondBooks } from './beyondCvData.js';
import { BeyondCover, BeyondPage } from './BeyondCover.jsx';
import {SongDetails} from './MusicInteractions.jsx';
import './beyond-book-polish.css';
import useMusicPreviewPlayer from './useMusicPreviewPlayer.js';
import RecordFlight from './RecordFlight.jsx';
import CinemaDetails from './CinemaDetails.jsx';
import GameDetails from './GameDetails.jsx';
import SocialDetails from './SocialDetails.jsx';
import './responsive-book-spread.css';

const segments=1;
const duration=880;
const wrap=index=>(index+beyondBooks.length)%beyondBooks.length;
function poses(progress,_width,board=false){
 // One unbroken face avoids strip seams and ten copies of every page's content.
 const angle=-Math.PI*progress;
 const lift=board?0:Math.sin(Math.PI*progress)*.012;
 return [`rotateY(${angle}rad) rotateZ(${lift}rad)`];
}

export default function BeyondBookViewer({ index, getOrigin, onChoose, onClosed, onSound }) {
 const item=beyondBooks[index];
 // Warm only the opened book's small artwork while its cover arrives. A hidden
 // reverse face must not wait until halfway through a turn to decode its photos.
 useEffect(()=>{
  const artwork=[...new Set(item.entries.map(entry=>entry.cover).filter(Boolean))];
  artwork.forEach(src=>{const image=new Image();image.decoding='async';image.src=src;image.decode().catch(()=>{});});
 },[item.id]);
 const {audio,player,events,selectPreview,finishPreview,reset:stopMusic}=useMusicPreviewPlayer(item.id);
 const [selectedTrail,setSelectedTrail]=useState(null);
 const [selectedSong,setSelectedSong]=useState(null),[discFlight,setDiscFlight]=useState(null),[selectedMovie,setSelectedMovie]=useState(null),[selectedGame,setSelectedGame]=useState(null),[selectedSocial,setSelectedSocial]=useState(null);
 useEffect(()=>{setSelectedTrail(null);setSelectedSong(null);setDiscFlight(null);setSelectedMovie(null);setSelectedGame(null);setSelectedSocial(null);},[item.id]);
 const previewSong=(song,from)=>{
  const token=selectPreview(song);if(token===null)return;
  setSelectedSong(null);setDiscFlight({song,from,token});
 };
 const finishFlight=token=>{
  finishPreview(token);setDiscFlight(current=>current?.token===token?null:current);
 };

 const dialog=useRef(null),presentation=useRef(null),rig=useRef(null),strips=useRef([]);
 const [page,setPage]=useState(-1),[turn,setTurn]=useState(null),[closing,setClosing]=useState(false),[entryReady,setEntryReady]=useState(false);
 const transition=useRef(null),animations=useRef([]),gesture=useRef(null),suppress=useRef(false),release=useRef(null);
 const pageRef=useRef(page),exitStarted=useRef(false),pendingClose=useRef(false),exit=useRef(()=>{}),turnAction=useRef(()=>{});
 const origin=useRef(getOrigin);origin.current=getOrigin;pageRef.current=page;
 const entryAnimation=useRef(null);
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

 const animateOut=()=>{
  if(exitStarted.current)return;exitStarted.current=true;
  dialog.current.classList.add('is-exiting');
  onSound?.('close');
  const currentStyle=getComputedStyle(presentation.current);
  const startTransform=currentStyle.transform==='none'?'translate3d(0,0,0) scale(1)':currentStyle.transform;
  const startOpacity=currentStyle.opacity;
  entryAnimation.current?.cancel();
  const target=origin.current?.();
  const book=rig.current.querySelector(pageRef.current===2?'.bcv-book-left':'.bcv-book-right').getBoundingClientRect();
  const dx=target?target.left+target.width/2-book.left-book.width/2:0;
  const dy=target?target.top+target.height/2-book.top-book.height/2:16;
  const scale=target?target.width/book.width:.96;
  const animation=presentation.current.animate([{transform:startTransform,opacity:startOpacity},{transform:`translate3d(${dx}px,${dy}px,0) scale(${scale})`,opacity:0}],{duration:reduced()?100:560,easing:'cubic-bezier(.65,0,.35,1)',fill:'both'});
  entryAnimation.current=animation;
  animation.finished.then(onClosed).catch(()=>{});
 };
 exit.current=animateOut;
 const finish=complete=>{
  const current=transition.current;if(!current)return;
  const next=(current.completion??complete)?current.to:current.from;
  transition.current=null;pageRef.current=next;
  // Commit the resting faces before cancelling the completed moving sheet.
  flushSync(()=>{setPage(next);setTurn(null);});
  if(pendingClose.current)requestAnimationFrame(()=>{if(next===2)exit.current();else turnAction.current(next+1);});
 };
 const turnTo=(next,manual=false)=>{
  if((player.loading&&!pendingClose.current)||transition.current||next===pageRef.current||next< -1||next>2)return false;
  onSound?.(pageRef.current===-1?'hinge':next===-1||next===2?'cover':'page');
  if(reduced()){
   if(!manual){setPage(next);pageRef.current=next;if(pendingClose.current)requestAnimationFrame(()=>{if(next===2)exit.current();else turnAction.current(next+1);});}
   return false;
  }
  const current={from:pageRef.current,to:next,forward:next>pageRef.current,manual};
  transition.current=current;setTurn(current);return true;
 };
 turnAction.current=turnTo;
 const requestClose=()=>{
  if(pendingClose.current)return;onSound?.('powerOff');setDiscFlight(null);stopMusic();pendingClose.current=true;setClosing(true);
  const held=gesture.current;if(held&&rig.current?.hasPointerCapture(held.id))rig.current.releasePointerCapture(held.id);gesture.current=null;
  if(transition.current){settle(transition.current.forward);return;}
  if(pageRef.current===-1||pageRef.current===2)animateOut();else turnTo(pageRef.current+1);
 };
 const choose=next=>{
  if(transition.current||closing)return;
  onSound?.('select');setDiscFlight(null);stopMusic();setPage(-1);pageRef.current=-1;onChoose(wrap(next));
 };
 const scrub=progress=>{
  const value=Math.max(0,Math.min(1,progress));if(gesture.current)gesture.current.progress=value;
  animations.current.forEach(animation=>{animation.currentTime=value*duration;});
 };
 const settle=complete=>{
  if(!transition.current)return;
  transition.current.completion=complete;
  if(!animations.current.length){release.current=complete;return;}
  animations.current.forEach(animation=>{animation.playbackRate=complete?1.12:-1.4;animation.play();});
  Promise.all(animations.current.map(animation=>animation.finished)).then(()=>finish(complete)).catch(()=>{});
 };
 useLayoutEffect(()=>{
  if(!turn||!rig.current)return undefined;
  const width=rig.current.offsetWidth/2;
  const board=turn.from===-1||turn.to===-1||turn.from===2||turn.to===2;
  const samples=Array.from({length:61},(_,step)=>poses(turn.forward?step/60:1-step/60,width,board));
  const options={duration:pendingClose.current?720:duration,easing:turn.manual?'linear':'cubic-bezier(.65,0,.35,1)',fill:'both'};
  const leaves=strips.current.map((node,part)=>node.animate(samples.map((row,step)=>({offset:step/60,transform:row[part]})),options));
  // Explicitly gate each face as it crosses the spine. Some mobile compositors
  // otherwise keep promoted album images from the reverse face in the frame.
  strips.current.forEach(node=>{
   ['.bcv-strip-front','.bcv-strip-back'].forEach((selector,index)=>{
    const visibleFirst=turn.forward?index===0:index===1;
    leaves.push(node.querySelector(selector).animate([
     {offset:0,visibility:visibleFirst?'visible':'hidden'},
     {offset:.499,visibility:visibleFirst?'visible':'hidden'},
     {offset:.5,visibility:visibleFirst?'hidden':'visible'},
     {offset:1,visibility:visibleFirst?'hidden':'visible'},
    ],options));
   });
  });
  const offset=value=>value===-1?'-25%':value===2?'25%':'0%';
  leaves.push(rig.current.animate([{transform:`translateX(${offset(turn.from)})`},{transform:`translateX(${offset(turn.to)})`}],options));
  animations.current=leaves;
  if(turn.manual){
   leaves.forEach(a=>a.pause());scrub(gesture.current?.progress||0);
   if(release.current!==null){const complete=release.current;release.current=null;settle(complete);}
  }else if(release.current!==null){const complete=release.current;release.current=null;settle(complete);}
  else Promise.all(leaves.map(animation=>animation.finished)).then(()=>finish(true)).catch(()=>{});
  return()=>{leaves.forEach(a=>a.cancel());animations.current=[];};
 },[turn]);
 useLayoutEffect(()=>{
  let disposed=false;
  const element=dialog.current;element.showModal();
  const oldOverflow=document.body.style.overflow,oldPadding=document.body.style.paddingRight;
  const gap=CSS.supports('scrollbar-gutter: stable')?0:innerWidth-document.documentElement.clientWidth;
  document.body.style.overflow='hidden';if(gap)document.body.style.paddingRight=`${gap}px`;
  const board=rig.current.querySelector('.bcv-book-right').getBoundingClientRect();
  const outer=presentation.current.getBoundingClientRect();
  presentation.current.style.transformOrigin=`${board.left+board.width/2-outer.left}px ${board.top+board.height/2-outer.top}px`;
  const target=origin.current?.();
  if(target&&!reduced()){
   entryAnimation.current=presentation.current.animate([{transform:`translate3d(${target.left+target.width/2-board.left-board.width/2}px,${target.top+target.height/2-board.top-board.height/2}px,0) scale(${target.width/board.width})`,opacity:.6},{transform:'translate3d(0,0,0) scale(1)',opacity:1}],{duration:650,easing:'cubic-bezier(.23,1,.32,1)',fill:'both'});
  }
  if(entryAnimation.current)entryAnimation.current.finished.then(()=>{if(!disposed&&!exitStarted.current)setEntryReady(true);}).catch(()=>{});else setEntryReady(true);
  return()=>{disposed=true;entryAnimation.current?.cancel();animations.current.forEach(a=>a.cancel());element.close();document.body.style.overflow=oldOverflow;document.body.style.paddingRight=oldPadding;};
 },[]);
 useEffect(()=>{
  const keys=event=>{
   if(event.key==='Escape'){event.preventDefault();requestClose();}
   if(closing||event.target.closest?.('input,textarea,select,[data-music-control]'))return;
   if(event.key==='ArrowRight'){event.preventDefault();turnTo(pageRef.current+1);}
   if(event.key==='ArrowLeft'){event.preventDefault();turnTo(pageRef.current-1);}
  };
  document.addEventListener('keydown',keys);
  return()=>document.removeEventListener('keydown',keys);
 },[closing]);
 useEffect(()=>{
  let viewportWidth=document.documentElement.clientWidth;
  const resize=()=>{
   const nextWidth=document.documentElement.clientWidth;
   // Mobile browser chrome changes height while scrolling. It must not
   // interrupt a page turn; only reframe when the actual layout width changes.
   if(Math.abs(nextWidth-viewportWidth)<2)return;
   viewportWidth=nextWidth;
   if(transition.current){animations.current.forEach(a=>a.cancel());finish(false);}
  };
  window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);
 },[]);
 const start=event=>{
  if(!event.isPrimary||event.button!==0||transition.current||closing||reduced()||event.target.closest('input,textarea,select,[data-music-control],.bcv-turntable'))return;
  suppress.current=false;gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,progress:0,started:false};
 };
 const move=event=>{
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;
  const dx=event.clientX-g.x,dy=event.clientY-g.y;
  if(!g.started){
   if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){gesture.current=null;return;}
   if(Math.abs(dx)<8)return;
   const direction=dx<0?1:-1;if(!turnTo(pageRef.current+direction,true)){gesture.current=null;return;}
   g.started=true;g.direction=direction;event.currentTarget.setPointerCapture(event.pointerId);suppress.current=true;
  }
  event.preventDefault();scrub(-dx*g.direction/Math.max(100,rig.current.offsetWidth*.4));
 };
 const end=event=>{
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;
  if(g.started){settle(event.type!=='pointercancel'&&g.progress>.23);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
  gesture.current=null;
 };
 const clickPage=event=>{
  if(suppress.current){suppress.current=false;event.preventDefault();return;}
  if(event.target.closest('a,button,input,textarea,select,[data-music-control]')||closing)return;
  if(event.target===rig.current){requestClose();return;}
  if(page===-1)turnTo(0);else if(page===2)turnTo(1);else{
   const rect=rig.current.getBoundingClientRect();turnTo(page+(event.clientX<rect.left+rect.width/2?-1:1));
  }
 };
 const captureClick=event=>{
  // A swipe that began on an album/cartridge is a page turn, not a detail tap.
  if(suppress.current){suppress.current=false;event.preventDefault();event.stopPropagation();}
 };
 const frontClosed=page===-1&&!turn,backClosed=page===2&&!turn;
 const turnControl=turn?(turn.forward?(turn.from===-1?'play':'next'):'back'):'';
 const endBoard=turn&&(turn.to===2||turn.from===2);
 const cover=entryReady?<BeyondCover item={item} live={frontClosed&&!closing}/>:<div className="bcv-cover-art bcv-entry-jacket"><img src={`/beyond-cv/jackets/${item.id}-${document.documentElement.dataset.theme==='light'?'light':'dark'}.jpg`} alt="" draggable="false"/></div>;
 const back=<BeyondCover item={item} back/>;
 const surface=(spread,side)=><BeyondPage item={item} spread={spread} side={side} onTrailSelect={(entry,trailIndex,anchor)=>setSelectedTrail({entry,index:trailIndex,anchor})} onSongSelect={(song,trackIndex,anchor)=>setSelectedSong({song,index:trackIndex,anchor})} onMovieSelect={(entry,movieIndex,anchor)=>{onSound?.('projectorOpen');setSelectedMovie({entry,index:movieIndex,anchor});}} onGameSelect={(entry,gameIndex,anchor)=>{onSound?.('gameOpen');setSelectedGame({entry,index:gameIndex,anchor});}} onSocialSelect={(entry,profileIndex,anchor)=>{onSound?.('socialOpen');setSelectedSocial({entry,index:profileIndex,anchor});}} player={player} interactive={!turn&&!closing}/>;
 const left=turn?(turn.forward?turn.from:turn.to):page;
 const right=endBoard?1:turn?(turn.forward?turn.to:turn.from):page;
 const front=endBoard?surface(1,'right'):turn?.from===-1||turn?.to===-1?cover:turn&&surface(turn.forward?turn.from:turn.to,'right');
 const reverse=endBoard?back:turn&&surface(turn.forward?turn.to:turn.from,'left');
 return <dialog ref={dialog} className="bcv-dialog bcv-spread-dialog" data-entering={entryReady?undefined:"true"} data-book-theme={item.id} data-record-loading={player.loading?'true':undefined} data-turn-control={turnControl} data-power={closing?'off':'on'} aria-labelledby="bcv-book-title" onCancel={event=>{event.preventDefault();requestClose();}} onClick={event=>{if(!event.target.closest('.bcv-book-rig,.bcv-control-deck,.bcv-book-picker,.bcv-book-header'))requestClose();}}>
  {item.id==='music'&&<audio ref={audio} preload="none" {...events}/>} 
  {selectedTrail&&<TrekDetails entry={selectedTrail.entry} index={selectedTrail.index} anchor={selectedTrail.anchor} onClosed={()=>setSelectedTrail(null)}/>}
  {selectedSong&&<SongDetails song={selectedSong.song} index={selectedSong.index} anchor={selectedSong.anchor} onPreview={previewSong} onClosed={()=>setSelectedSong(null)}/>}
  {selectedSocial&&<SocialDetails entry={selectedSocial.entry} index={selectedSocial.index} anchor={selectedSocial.anchor} onSound={onSound} onClosed={()=>setSelectedSocial(null)}/>}
  {selectedGame&&<GameDetails entry={selectedGame.entry} index={selectedGame.index} anchor={selectedGame.anchor} onSound={onSound} onClosed={()=>setSelectedGame(null)}/>}
  {selectedMovie&&<CinemaDetails entry={selectedMovie.entry} index={selectedMovie.index} anchor={selectedMovie.anchor} onSound={onSound} onClosed={()=>setSelectedMovie(null)}/>}
  {discFlight&&<RecordFlight flight={discFlight} targetRoot={rig} onArrive={finishFlight}/>}
  <header className="bcv-book-header"><div><span>▶ BOOK {String(index+1).padStart(2,'0')} / {String(beyondBooks.length).padStart(2,'0')}</span><h2 id="bcv-book-title">{item.title}</h2></div><button type="button" data-sound="silent" onClick={requestClose} disabled={closing} aria-pressed={!closing} aria-label="Close personal book"><i key={item.id} className="bcv-power-rocker"><b aria-hidden="true"/>ON / OFF</i><span>{closing?'CLOSING…':'CLOSE · ESC'}</span></button></header>
  <div className="bcv-theatre">{frontClosed&&!closing&&<div className="bcv-explore-cue" key={item.id} aria-hidden="true"><span>Explore</span><svg viewBox="0 0 96 58" fill="none"><path pathLength="1" d="M5 8c22-3 8 27 37 23 23-4 32-5 43 18m-18-6 18 6-2-18"/></svg></div>}<div className="bcv-book-presentation" ref={presentation}>
   <div ref={rig} className={'bcv-book-rig'+(frontClosed?' is-front-closed':'')+(backClosed?' is-back-closed':'')+(turn?' is-turning':'')} aria-busy={!!turn} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onClickCapture={captureClick} onClick={clickPage}>
    <div className="bcv-book-paper bcv-book-left" style={{visibility:frontClosed||left<0?'hidden':undefined}}>{backClosed?back:left>=0&&left<2&&surface(left,'left')}</div>
    <div className="bcv-book-paper bcv-book-right" style={{visibility:backClosed||endBoard?'hidden':undefined}}>{!endBoard&&(frontClosed?cover:right>=0&&right<2&&surface(right,'right'))}</div>
    {turn&&<div className="bcv-curved-leaf bcv-continuous-leaf" aria-hidden="true">{Array.from({length:segments},(_,part)=><div key={part} className="bcv-page-strip" ref={node=>{strips.current[part]=node;}} style={{width:`${100/segments}%`}}>
     <div className="bcv-strip-face bcv-strip-front"><div className="bcv-strip-content" style={{width:`${segments*100}%`,left:`${-part*100}%`}}>{front}</div></div>
     <div className="bcv-strip-face bcv-strip-back"><div className="bcv-strip-content" style={{width:`${segments*100}%`,left:`${-(segments-1-part)*100}%`}}>{reverse}</div></div>
    </div>)}</div>}
   </div>
  </div></div>
  <footer className="bcv-book-console">
   <div className="bcv-control-deck" aria-busy={!!turn||closing||player.loading}><i/><i/><i/><i/><button type="button" data-sound="silent" disabled={page===-1||!!turn||closing||player.loading} aria-label="Previous page" onClick={()=>turnTo(page-1)}>◀<span>BACK</span></button><div className="bcv-deck-display"><small>{player.loading?'LOADING…':turn?'TURNING…':closing?'POWER OFF':page===-1?'SIDE A':page===2?'SIDE B':'PLAY ▶'}</small><strong>{page===-1?'COVER':page===2?'BACK':String(page+1).padStart(2,'0')+'/02'}</strong></div><button type="button" data-sound="silent" className="bcv-deck-forward" disabled={page===2||!!turn||closing||player.loading} aria-label={page===-1?'Open book':'Next page'} onClick={()=>turnTo(page+1)}>▶<span>{page===-1?'OPEN':'NEXT'}</span></button></div>
   <div className="bcv-book-picker"><button type="button" data-sound="silent" disabled={!!turn||closing} onClick={()=>choose(index-1)}>‹ PREV BOOK</button><div>{beyondBooks.map((book,i)=><button key={book.id} type="button" data-sound="silent" aria-label={'Read '+book.title} aria-current={index===i?'true':undefined} disabled={!!turn||closing} onClick={()=>choose(i)}/>)}</div><button type="button" data-sound="silent" disabled={!!turn||closing} onClick={()=>choose(index+1)}>NEXT BOOK ›</button></div>
   <p>← → TURN PAGES · DRAG THE PAPER · ESC CLOSE</p>
  </footer>
 </dialog>;
}

