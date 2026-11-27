import {Fragment,memo,useEffect,useMemo,useRef,useState} from 'react';
import {beyondBooks} from './beyondCvData.js';
import {MoodBoardGallery} from './ui/mood-board-carousel';
import {createBeyondBookSound} from './beyondBookSound.js';
import './beyond-mood-board.css';
import MoodCardPreview from './MoodCardPreview.jsx';
import MoodFluidCursor from './MoodFluidCursor.jsx';

export default memo(function BeyondCvSection(){
 const root=useRef(null),sound=useRef(null),aura=useRef(null),[active,setActive]=useState(0),[preview,setPreview]=useState(null),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches);
 const panel=useRef(null),animation=useRef(null),transitionId=useRef(0),activeRef=useRef(active),phaseRef=useRef('idle'),changeRef=useRef(null),welcomed=useRef(false),waitTimer=useRef(null),waitResolve=useRef(null),[phase,setPhase]=useState('idle'),[directChange,setDirectChange]=useState(false),[settled,setSettled]=useState(false),[intro,setIntro]=useState(true);
 activeRef.current=active;
 const media=useMemo(()=>{
  const book=beyondBooks[active];
  const images=book.entries.map((entry,i)=>({src:entry.cover||`/beyond-cv/social/mood-${entry.id}.svg`,alt:entry.title,collection:active,entry:i}));
  return Array.from({length:Math.max(12,images.length)},(_,i)=>images[i%images.length]);
 },[active]);
 useEffect(()=>{const effects=createBeyondBookSound();sound.current=effects;return()=>{effects.dispose();sound.current=null}},[]);
 useEffect(()=>{
  const node=root.current,observer=new IntersectionObserver(([entry])=>{
   const shown=entry.isIntersecting&&entry.intersectionRatio>=.55;setVisible(shown);if(shown)setIntro(true);if(shown&&welcomed.current&&phaseRef.current==='idle'){setSettled(false);if(!matchMedia('(prefers-reduced-motion:reduce)').matches)changeRef.current?.(activeRef.current,{welcome:true})}
   if(shown&&!welcomed.current){welcomed.current=true;if(!matchMedia('(prefers-reduced-motion:reduce)').matches)changeRef.current?.(activeRef.current,{welcome:true})}
  },{threshold:[0,.55]});observer.observe(node);
  const preference=matchMedia('(prefers-reduced-motion:reduce)'),change=()=>{setReduced(preference.matches);if(preference.matches)changeRef.current?.(activeRef.current,{direct:true})};preference.addEventListener('change',change);
  return()=>{observer.disconnect();preference.removeEventListener('change',change);transitionId.current++;animation.current?.cancel();clearTimeout(waitTimer.current);waitResolve.current?.()};
 },[]);
 useEffect(()=>{if(!visible||preview||reduced)return;const timer=setInterval(()=>{if(phaseRef.current==='idle'&&!document.hidden&&!(document.activeElement?.matches(':focus-visible')&&root.current?.contains(document.activeElement)))changeRef.current?.((activeRef.current+1)%beyondBooks.length)},12000);return()=>clearInterval(timer)},[visible,preview,reduced]);
 useEffect(()=>{
  const node=root.current,glow=aura.current,stages=node.querySelectorAll('.mood-depth-scene,.mood-depth-title');if(!visible||reduced||preview||phase!=='idle')return;
  let frame=0,bounds=null,x=0,y=0,gx=0,gy=0,entered=false;
  const tick=()=>{frame=0;x+=(gx-x)*.16;y+=(gy-y)*.16;glow.style.transform=`translate3d(${x-220}px,${y-220}px,0)`;for(const stage of stages)stage.style.transform=`perspective(1500px) translate3d(${(x/bounds.width-.5)*-8}px,${(y/bounds.height-.5)*-5}px,-75px) rotateX(${2+(y/bounds.height-.5)*-1.6}deg) rotateY(${(x/bounds.width-.5)*1.8}deg)`;if(Math.abs(gx-x)+Math.abs(gy-y)>.2)frame=requestAnimationFrame(tick)};
  const move=event=>{if(event.pointerType!=='mouse')return;bounds||=node.getBoundingClientRect();gx=event.clientX-bounds.left;gy=event.clientY-bounds.top;if(!entered){x=gx;y=gy;entered=true}glow.style.opacity='1';if(!frame)frame=requestAnimationFrame(tick)};
  const leave=()=>{glow.style.opacity='0';stages.forEach(stage=>stage.style.removeProperty('transform'));entered=false;cancelAnimationFrame(frame);frame=0};
  const scroll=()=>{bounds=null;leave()};node.addEventListener('pointermove',move,{passive:true});node.addEventListener('pointerleave',leave);window.addEventListener('scroll',scroll,{passive:true});
  return()=>{leave();node.removeEventListener('pointermove',move);node.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',scroll)};
 },[visible,reduced,!!preview,phase]);
 const change=async(index,{welcome=false,direct=false}={})=>{
  index=(index+beyondBooks.length)%beyondBooks.length;const node=panel.current;if(!node)return;
  if(index===activeRef.current&&phaseRef.current==='idle'&&!welcome&&!direct)return;
  const ticket=++transitionId.current,from=getComputedStyle(node).transform;
  animation.current?.cancel();clearTimeout(waitTimer.current);waitResolve.current?.();waitResolve.current=null;
  const mark=value=>{phaseRef.current=value;setPhase(value)};
  const done=()=>{animation.current?.cancel();animation.current=null;node.style.opacity='0';node.style.transform='translateY(100%)';mark('idle');setSettled(true)};
  if(direct||matchMedia('(prefers-reduced-motion:reduce)').matches){setDirectChange(true);setIntro(welcome);setActive(index);done();return;}
  setDirectChange(false);setSettled(false);node.dataset.collection=beyondBooks[index].id;node.style.opacity='1';node.style.transformOrigin='center';
  try{
   if(welcome){
    mark('welcoming');animation.current=node.animate([{opacity:0},{opacity:0}],{duration:1500,fill:'both'});
    await animation.current.finished;
   }else{
    mark('covering');animation.current=node.animate([{transform:from,opacity:1},{transform:'translateY(0)',opacity:1}],{duration:480,easing:'cubic-bezier(.77,0,.175,1)',fill:'both'});
    await animation.current.finished;if(ticket!==transitionId.current)return;
    node.style.transform='translateY(0)';animation.current.cancel();setIntro(false);setActive(index);mark('holding');
    await new Promise(resolve=>{waitResolve.current=resolve;waitTimer.current=setTimeout(()=>{waitResolve.current=null;resolve()},260)});if(ticket!==transitionId.current)return;
    mark('revealing');animation.current=node.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-100%)',opacity:1}],{duration:760,easing:'cubic-bezier(.77,0,.175,1)',fill:'both'});await animation.current.finished;
   }
   if(ticket===transitionId.current)done();
  }catch{/* A new selection retargets the currently visible panel. */}
 };
 changeRef.current=change;
 const select=(index,direct=false)=>{sound.current?.unlock();sound.current?.play('select');change(index,{direct})};
 const open=(collection,entry,node)=>{const item=beyondBooks[collection].entries[entry];setActive(collection);sound.current?.unlock();sound.current?.play('select');setPreview({collection,entry,src:item.cover||`/beyond-cv/social/mood-${item.id}.svg`,anchor:node.getBoundingClientRect().toJSON(),trigger:node})};
 const current=beyondBooks[active],title=intro?'Beyond the CV':current.title;
 return <section id='beyond-cv' ref={root} className={'beyond-mood-section'+(!visible||preview||phase!=='idle'?' is-resting':'')+(visible?' is-in-view':'')+' is-'+phase+(directChange?' has-direct-change':'')+(settled?' has-settled-title':'')} aria-labelledby='beyond-cv-title' data-layout={0} data-phase={phase} aria-busy={phase!=='idle'} style={{'--mood-accent':current.color}} onKeyDown={event=>{if(preview)return;if(event.key==='ArrowRight'){event.preventDefault();select(active+1,true)}if(event.key==='ArrowLeft'){event.preventDefault();select(active-1,true)}}}>
  <MoodFluidCursor active={visible&&!preview&&phase==='idle'&&!reduced} color={current.color} containerRef={root}/>
  <div className='mood-depth-scene'>
  <MoodBoardGallery media={media} layout={0} paused={!!preview||!visible||phase==='holding'||phase==='welcoming'} onActivate={open}/>
  <div className='mood-center-mat' aria-hidden='true'/>
  <div className='mood-cursor-aura' ref={aura} aria-hidden='true'/>
  <p className='mood-section-signoff'>THE THINGS THAT NEVER FIT ON A CV</p>
  </div>
  <div className='mood-transition-panel' ref={panel} aria-hidden='true'/>
  <div className='mood-depth-title'>
  <div className='mood-center'>
   <span className='mood-eyebrow' key={active+'-label'}>{current.kicker}</span>
   <h2 id='beyond-cv-title' className='mood-title' key={title}>{title.split(' ').map((word,i)=><Fragment key={i}>{i>0?' ':null}<span>{word}</span></Fragment>)}</h2>
   <div className='mood-pagination' role='group' aria-label='Choose a personal collection'>{beyondBooks.map((book,i)=><button type='button' key={book.id} aria-label={'Select '+book.title} aria-current={active===i?'true':undefined} onClick={event=>select(i,event.detail===0)}><span key={i===active?`${active}-${visible}`:'idle'}><i/></span></button>)}</div>
  </div>
  </div>
  {preview&&<MoodCardPreview key={preview.collection+'-'+preview.entry} book={beyondBooks[preview.collection]} entry={beyondBooks[preview.collection].entries[preview.entry]} src={preview.src} anchor={preview.anchor} trigger={preview.trigger} onClosed={()=>setPreview(null)}/>}
 </section>;
});
