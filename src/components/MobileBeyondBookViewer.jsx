import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { beyondBooks } from './beyondCvData.js';
import { BeyondCover, BeyondPage } from './BeyondCover.jsx';
import { SongDetails } from './MusicInteractions.jsx';
import useMusicPreviewPlayer from './useMusicPreviewPlayer.js';
import RecordFlight from './RecordFlight.jsx';
import CinemaDetails from './CinemaDetails.jsx';
import GameDetails from './GameDetails.jsx';
import SocialDetails from './SocialDetails.jsx';
import TrekDetails from './TrekDetails.jsx';
import './mobile-beyond-book.css';

export default function MobileBeyondBookViewer({index,onChoose,onClosed,onSound}) {
 const item=beyondBooks[index],dialog=useRef(null),paper=useRef(null),gesture=useRef(null),animation=useRef(null),direction=useRef(1),opener=useRef(document.activeElement);
 const [page,setPage]=useState(0),[detail,setDetail]=useState(null),[flight,setFlight]=useState(null);
 const {audio,player,events,selectPreview,finishPreview,reset}=useMusicPreviewPlayer(item.id);
 useEffect(()=>{setPage(0);setDetail(null);setFlight(null);},[item.id]);
 useLayoutEffect(()=>{
  const node=dialog.current,body=document.body,html=document.documentElement;
  const bodyOverflow=body.style.overflow,htmlOverflow=html.style.overflow;
  body.style.overflow='hidden';html.style.overflow='hidden';node.showModal();
  return()=>{animation.current?.cancel();node.close();body.style.overflow=bodyOverflow;html.style.overflow=htmlOverflow;if(opener.current?.isConnected)opener.current.focus({preventScroll:true});};
 },[]);
 useLayoutEffect(()=>{
  const node=paper.current,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  animation.current?.cancel();
  // A single paper face is animated, never cloned into moving page strips.
  animation.current=node.animate(reduced?[{opacity:.7},{opacity:1}]:[
   {opacity:.65,transform:`perspective(1100px) translate3d(${direction.current*12}px,0,0) rotateY(${direction.current*9}deg)`},
   {opacity:1,transform:'perspective(1100px) translate3d(0,0,0) rotateY(0deg)'}
  ],{duration:reduced?90:240,easing:'cubic-bezier(.22,1,.36,1)'});
  return()=>animation.current?.cancel();
 },[page,item.id]);
 const change=next=>{
  if(next<0||next>5||next===page)return;
  direction.current=next>page?1:-1;onSound?.(page===0?'hinge':'page');setPage(next);
 };
 const close=()=>{reset();onSound?.('close');onClosed();};
 const choose=next=>{reset();onSound?.('select');setPage(0);onChoose((next+beyondBooks.length)%beyondBooks.length);};
 const preview=(song,from)=>{
  const token=selectPreview(song);if(token===null)return;
  setDetail(null);direction.current=-1;setPage(page===3?4:1);setFlight({song,from,token});
 };
 const key=event=>{
  if(event.target.closest('input,textarea,select,[data-music-control]'))return;
  if(event.key==='ArrowRight'){event.preventDefault();change(page+1);}
  if(event.key==='ArrowLeft'){event.preventDefault();change(page-1);}
 };
 const surface=()=>{
  if(page===0)return <div className="bcv-cover-art bcv-mobile-jacket"><img src={`/beyond-cv/jackets/${item.id}-${document.documentElement.dataset.theme==='light'?'light':'dark'}.jpg`} alt={`${item.title} cover`} decoding="async" draggable="false"/></div>;
  if(page===5)return <BeyondCover item={item} back live={false}/>;
  const spread=Math.floor((page-1)/2),side=(page-1)%2===0?'left':'right';
  return <BeyondPage item={item} spread={spread} side={side} player={player} interactive
   onSongSelect={(song,number,anchor)=>setDetail({kind:'song',entry:song,index:number,anchor})}
   onMovieSelect={(entry,number,anchor)=>setDetail({kind:'movie',entry,index:number,anchor})}
   onGameSelect={(entry,number,anchor)=>setDetail({kind:'game',entry,index:number,anchor})}
   onSocialSelect={(entry,number,anchor)=>setDetail({kind:'social',entry,index:number,anchor})}
   onTrailSelect={(entry,number,anchor)=>setDetail({kind:'trail',entry,index:number,anchor})}/>;
 };
 const shared=detail?{entry:detail.entry,index:detail.index,anchor:detail.anchor,onClosed:()=>setDetail(null),onSound}:null;
 return <dialog ref={dialog} className="bcv-dialog bcv-mobile-dialog" aria-labelledby="bcv-mobile-title" onCancel={event=>{event.preventDefault();close();}} onKeyDown={key}>
  {item.id==='music'&&<audio ref={audio} preload="none" {...events}/>}
  {detail?.kind==='song'&&<SongDetails song={detail.entry} index={detail.index} anchor={detail.anchor} onPreview={preview} onClosed={()=>setDetail(null)}/>}
  {detail?.kind==='game'&&<GameDetails {...shared}/>}
  {detail?.kind==='movie'&&<CinemaDetails {...shared}/>}
  {detail?.kind==='social'&&<SocialDetails {...shared}/>}
  {detail?.kind==='trail'&&<TrekDetails {...shared}/>}
  {flight&&<RecordFlight flight={flight} targetRoot={paper} onArrive={token=>{finishPreview(token);setFlight(null);}}/>}
  <header className="bcv-mobile-header"><div><small>BOOK {String(index+1).padStart(2,'0')} / 05</small><h2 id="bcv-mobile-title">{item.title}</h2></div><button type="button" aria-label="Close personal book" onClick={close}>×</button></header>
  <div className="bcv-mobile-stage" onPointerDown={event=>{
   if(!event.isPrimary||event.button!==0||event.target.closest('a,button,input,select,textarea,[data-music-control]'))return;
   gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY};
  }} onPointerUp={event=>{
   const held=gesture.current;gesture.current=null;if(!held||held.id!==event.pointerId)return;
   const dx=event.clientX-held.x,dy=event.clientY-held.y;
   if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)change(page+(dx<0?1:-1));
  }} onPointerCancel={()=>{gesture.current=null;}}>
   <div ref={paper} className="bcv-book-paper bcv-mobile-paper" key={`${item.id}-${page}`}>{surface()}</div>
  </div>
  <footer className="bcv-mobile-console">
   <nav aria-label="Book page controls"><button type="button" aria-label="Previous page" disabled={page===0} onClick={()=>change(page-1)}>←</button><div><span>{page===0?'COVER':page===5?'BACK COVER':`PAGE ${page} OF 4`}</span><small>{page===0?'Open to explore':'Swipe to turn the page'}</small></div><button type="button" aria-label={page===0?'Open book':'Next page'} disabled={page===5} onClick={()=>change(page+1)}>→</button></nav>
   <div className="bcv-mobile-book-picker"><button type="button" onClick={()=>choose(index-1)}>‹ Previous book</button><button type="button" onClick={()=>choose(index+1)}>Next book ›</button></div>
  </footer>
 </dialog>;
}
