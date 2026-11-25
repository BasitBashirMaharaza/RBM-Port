import {createBeyondBookSound} from './beyondBookSound.js';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { beyondBooks } from './beyondCvData.js';
import { BeyondCover } from './BeyondCover.jsx';
const loadBookViewer = () => import('./BeyondBookViewer.jsx');
const BeyondBookViewer = lazy(loadBookViewer);
import SectionTextReveal from './SectionTextReveal.jsx';
import './beyond-cv.css';

const count=beyondBooks.length;
const wrap=value=>((value%count)+count)%count;
const relative=(index,position)=>wrap(index-position+count*.5)-count*.5;
// Exact critically damped integration stays stable when a phone misses a frame.
function spring(position,velocity,target,rate,dt){
 const delta=position-target,term=velocity+rate*delta,decay=Math.exp(-rate*dt);
 return [target+(delta+term*dt)*decay,(velocity-rate*term*dt)*decay];
}

export default function BeyondCvSection() {
 const sound=useRef(null);
 const stage=useRef(null),buttons=useRef([]),drag=useRef(null),suppress=useRef(false);
 const engine=useRef({position:0,velocity:0,target:null,hover:false,focus:false,modal:false,paused:false,visible:false,scrollOffset:0,scrollGoal:0,scrollVelocity:0,scrollTilt:0,tiltGoal:0,hoverIndex:null,frame:0,wake:()=>{},select:()=>{}});
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[opened,setOpened]=useState(null);
 useEffect(()=>{const effects=createBeyondBookSound();sound.current=effects;return()=>{sound.current=null;effects.dispose();};},[]);
 useEffect(()=>{
  const root=stage.current,e=engine.current;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let coverTimer=0,previous=0,spacing=400,activeIndex=0,lastScroll=window.scrollY,lastScrollAt=performance.now(),intentUntil=0,lifts=Array(count).fill(0),sheens=[],shown=Array(count).fill(null),cameraTransform='',visibilityLimit=2.65;
  const camera=root.querySelector('.bcv-shelf-camera');
  const coverEvent=()=>root.dispatchEvent(new Event('portfolio:shelf-motion'));
  const resumeCovers=()=>{
   clearTimeout(coverTimer);
   if(e.modal)return;
   if(drag.current?.started||e.target!==null){coverTimer=setTimeout(resumeCovers,80);return;}
   if(root.hasAttribute('data-motion')){root.removeAttribute('data-motion');coverEvent();}
  };
  const suspendCovers=()=>{
   if(!root.hasAttribute('data-motion')){root.dataset.motion='moving';coverEvent();}
   clearTimeout(coverTimer);coverTimer=setTimeout(resumeCovers,220);
  };
  e.suspendCovers=suspendCovers;e.resumeCovers=resumeCovers;

  const rebase=()=>{
   if(drag.current)return;
   const positionCycles=Math.trunc(e.position/count)*count;
   if(positionCycles){e.position-=positionCycles;if(e.target!==null)e.target-=positionCycles;}
   const scrollCycles=Math.trunc(e.scrollOffset/count)*count;
   if(scrollCycles){e.scrollOffset-=scrollCycles;e.scrollGoal-=scrollCycles;}
  };
  const paint=()=>{
   buttons.current.forEach((node,index)=>{
    if(!node)return;
    const d=relative(index,e.position+e.scrollOffset),distance=Math.abs(d),visible=distance<visibilityLimit,angle=d*.42;
    if(shown[index]!==visible){shown[index]=visible;node.style.visibility=visible?'visible':'hidden';}
    if(!visible)return;
    node.style.opacity=String(Math.max(0,Math.min(1,(visibilityLimit-distance)/.45)));
    node.style.transform=`translate(-50%,-50%) translate3d(${Math.sin(angle)/Math.sin(.42)*spacing}px,${-lifts[index]*9}px,${Math.min(distance,3)*68+lifts[index]*22}px) rotateY(${-Math.tanh(d*1.25)*76.5}deg) rotateX(${lifts[index]*-1.5}deg)`;
    if(sheens[index])sheens[index].style.opacity=String(.18+Math.min(distance,2)*.12+lifts[index]*.1);
   });
   const nextCamera=visibilityLimit<2?'rotateX(2deg)':`translate3d(0,${(e.scrollTilt*-5).toFixed(2)}px,0) rotateX(2deg)`;
   if(nextCamera!==cameraTransform){camera.style.transform=nextCamera;cameraTransform=nextCamera;}
   const next=wrap(Math.round(e.position+e.scrollOffset));
   if(next!==activeIndex){activeIndex=next;setActive(next);if(performance.now()<intentUntil)sound.current?.play('tick',(next/(count-1)-.5)*.8);}
  };
  const tick=now=>{
   e.frame=0;
   if(!e.visible||document.hidden||e.modal){previous=0;return;}
   const dt=previous?Math.min(.1,(now-previous)/1000):1/60;previous=now;
   const blend=1-Math.exp(-dt*12);lifts=lifts.map((value,i)=>value+((e.hoverIndex===i&&!e.modal?1:0)-value)*blend);
   if(!preference.matches){[e.scrollOffset,e.scrollVelocity]=spring(e.scrollOffset,e.scrollVelocity,e.scrollGoal,24,dt);e.scrollTilt+=(e.tiltGoal-e.scrollTilt)*(1-Math.exp(-dt*9));e.tiltGoal*=Math.exp(-dt*5);}else{e.scrollVelocity=0;e.scrollGoal=e.scrollOffset;e.scrollTilt=0;}
   if(!drag.current?.started){
    if(e.target!==null){
     if(preference.matches){e.position=e.target;e.velocity=0;e.target=null;}
     else{
      [e.position,e.velocity]=spring(e.position,e.velocity,e.target,18,dt);
      if(Math.abs(e.target-e.position)<.0005&&Math.abs(e.velocity)<.004){e.position=e.target;e.target=null;e.velocity=0;}
     }
    }else{
     const speed=e.hover||e.focus||e.modal||e.paused||preference.matches?0:.105;
     e.velocity+=(speed-e.velocity)*(1-Math.exp(-dt*5));e.position+=e.velocity*dt;
     if(speed===0&&Math.abs(e.velocity)<.0005)e.velocity=0;
    }
   }
   rebase();paint();
   if(lifts.some((v,i)=>Math.abs(v-(e.hoverIndex===i&&!e.modal?1:0))>.001)||Math.abs(e.scrollGoal-e.scrollOffset)>.0001||Math.abs(e.scrollVelocity)>.001||Math.abs(e.scrollTilt)>.001||drag.current?.started||e.target!==null||Math.abs(e.velocity)>.0001||(!e.hover&&!e.focus&&!e.modal&&!e.paused&&!preference.matches))e.frame=requestAnimationFrame(tick);
   else previous=0;
  };
  const wake=()=>{if(!e.frame&&e.visible&&!document.hidden){previous=0;e.frame=requestAnimationFrame(tick);}};
  const measure=()=>{visibilityLimit=Math.min(innerWidth<=600?1.65:2.65,count*.5);spacing=(buttons.current[0]?.offsetWidth||300)*(innerWidth<=600?.93:1.18);sheens=buttons.current.map(node=>node?.querySelector('.bcv-book-sheen'));paint();wake();};
  e.wake=wake;e.paint=paint;e.spacing=()=>spacing;
  e.select=index=>{suspendCovers();e.scrollGoal=e.scrollOffset;e.scrollVelocity=0;e.target=e.position+relative(index,e.position+e.scrollOffset);if(e.modal){e.position=e.target;e.target=null;e.velocity=0;paint();}wake();};
  const scroll=()=>{
   const now=performance.now(),delta=window.scrollY-lastScroll,dt=Math.max(16,now-lastScrollAt);lastScroll=window.scrollY;lastScrollAt=now;
   if(!e.visible||e.modal||e.paused||preference.matches||drag.current?.started)return;
   suspendCovers();e.scrollGoal+=Math.max(-500,Math.min(500,delta))*.00115;e.tiltGoal=Math.max(-1,Math.min(1,delta/dt*.3));intentUntil=now+550;wake();
  };
  const wheel=event=>{if(Math.abs(event.deltaX)<=Math.abs(event.deltaY)||e.modal||e.paused||preference.matches)return;suspendCovers();const pixels=event.deltaX*(event.deltaMode===1?16:event.deltaMode===2?root.clientWidth:1);e.scrollGoal+=Math.max(-500,Math.min(500,pixels))*.0015;intentUntil=performance.now()+550;wake();};
  window.addEventListener('scroll',scroll,{passive:true});root.addEventListener('wheel',wheel,{passive:true});
  const observer=new IntersectionObserver(([entry])=>{
   e.visible=entry.isIntersecting;
   if(e.visible){wake();}else{sound.current?.stop();cancelAnimationFrame(e.frame);e.frame=0;previous=0;}
  },{rootMargin:'100px'});
  observer.observe(root);
  const prepareViewer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){prepareViewer.disconnect();loadBookViewer().catch(()=>{});}},{rootMargin:'1500px'});
  prepareViewer.observe(root);
  const resize=new ResizeObserver(measure);resize.observe(root);measure();
  const visibility=()=>{cancelAnimationFrame(e.frame);e.frame=0;previous=0;if(!document.hidden)wake();};
  preference.addEventListener('change',wake);document.addEventListener('visibilitychange',visibility);
  return()=>{clearTimeout(coverTimer);root.removeAttribute('data-motion');cancelAnimationFrame(e.frame);window.removeEventListener('scroll',scroll);root.removeEventListener('wheel',wheel);observer.disconnect();prepareViewer.disconnect();resize.disconnect();preference.removeEventListener('change',wake);document.removeEventListener('visibilitychange',visibility);e.wake=()=>{};};
 },[]);
 useEffect(()=>{engine.current.paused=paused;engine.current.wake();},[paused]);
 useEffect(()=>{engine.current.modal=opened!==null;if(!opened)engine.current.resumeCovers?.();engine.current.wake();},[opened!==null]);
 const select=index=>{sound.current?.unlock();sound.current?.play('select');engine.current.select(wrap(index));};
 const activate=index=>{
  if(suppress.current){suppress.current=false;return;}
  const e=engine.current;
  if(Math.abs(relative(index,e.position+e.scrollOffset))>.46){select(index);return;}
  e.modal=true;e.velocity=0;e.target=null;e.scrollGoal=e.scrollOffset;sound.current?.play('open',0,beyondBooks[index].id);
  setOpened({index});
 };
 const start=event=>{
  if(!event.isPrimary||event.button!==0||event.target.closest('.bcv-shelf-controls'))return;
  sound.current?.unlock();suppress.current=false;
  drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,position:engine.current.position+engine.current.scrollOffset,started:false};
 };
 const move=event=>{
  const gesture=drag.current;if(!gesture||gesture.id!==event.pointerId)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.started){
   if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag.current=null;return;}
   if(Math.abs(dx)<8)return;
   gesture.started=true;engine.current.suspendCovers?.();event.currentTarget.setPointerCapture(event.pointerId);suppress.current=true;
  }
  event.preventDefault();engine.current.target=null;engine.current.velocity=0;
  engine.current.position=gesture.position-dx/(engine.current.spacing?.()||350)-engine.current.scrollOffset;engine.current.wake();
 };
 const end=event=>{
  const gesture=drag.current;if(!gesture||gesture.id!==event.pointerId)return;
  if(gesture.started){engine.current.target=Math.round(engine.current.position+engine.current.scrollOffset)-engine.current.scrollOffset;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
  drag.current=null;engine.current.wake();
 };
 const chooseBook=index=>{select(index);setOpened({index:wrap(index)});};
 const closeBook=()=>{const index=opened.index;setOpened(null);requestAnimationFrame(()=>buttons.current[index]?.focus({preventScroll:true}));};
 return <section className="beyond-cv-section" id="beyond-cv" aria-labelledby="beyond-cv-title">
  <div className="bcv-heading container">
   <p className="bcv-kicker">the things that never fit on<br/>a CV <span aria-hidden="true">↘</span></p>
   <h2 id="beyond-cv-title"><SectionTextReveal>Beyond the <em>CV</em></SectionTextReveal><svg viewBox="0 0 400 25" fill="none" aria-hidden="true"><path d="M4 20C89 1 276 7 392 10"/></svg></h2>
   <p className="bcv-introduction"><SectionTextReveal>A glimpse into what drives me —<br/>beyond work, beyond code.</SectionTextReveal></p>
  </div>
  <div className="bcv-shelf" ref={stage} role="region" aria-label="Beyond the CV: personal book collection"
   onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
   onPointerEnter={event=>{if(event.pointerType==='mouse'){engine.current.hover=true;engine.current.wake();}}}
   onPointerLeave={()=>{engine.current.hover=false;engine.current.wake();}}
   onFocusCapture={()=>{engine.current.focus=true;engine.current.wake();}}
   onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget)){engine.current.focus=false;engine.current.wake();}}}
   onKeyDown={event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(active+(event.key==='ArrowRight'?1:-1));}
   }}>
   <div className="bcv-shelf-floor" aria-hidden="true" />
   <div className="bcv-shelf-camera">
    {beyondBooks.map((item,index)=><button key={item.id} type="button" data-sound="silent" className="bcv-shelf-book" style={{'--jacket':item.color,'--jacket-ink':item.ink}} onPointerEnter={event=>{if(event.pointerType==='mouse'){engine.current.hoverIndex=index;sound.current?.play('hover',(index/(count-1)-.5)*.8);engine.current.wake();}}} onPointerLeave={()=>{engine.current.hoverIndex=null;engine.current.wake();}} ref={node=>{buttons.current[index]=node;}} tabIndex={index===active?0:-1} aria-label={index===active?'Open '+item.title:'Select '+item.title} onClick={()=>activate(index)}>
     <span className="bcv-volume-edge" aria-hidden="true"/><span className="bcv-book-spine" aria-hidden="true"><span>{item.title}</span><small>bb.</small></span><span className="bcv-book-foreedge" aria-hidden="true"/><span className="bcv-book-topedge" aria-hidden="true"/><span className="bcv-book-bottomedge" aria-hidden="true"/><BeyondCover item={item} live={index===active&&opened===null}/><span className="bcv-book-sheen" aria-hidden="true"/>
    </button>)}
   </div>
  </div>
  <div className="bcv-shelf-controls container">
   <div className="bcv-catalogue"><span className="bcv-barcode" aria-hidden="true"/><span>A PERSONAL COLLECTION — {String(active+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span><small>DRAG · CHOOSE · OPEN ↗</small></div>
   <div className="bcv-shelf-navigation">
    <button type="button" data-sound="silent" onClick={()=>select(active-1)} aria-label="Previous personal book">←</button>
    <div className="bcv-shelf-dots" aria-label="Personal book selection">{beyondBooks.map((item,index)=><button key={item.id} type="button" data-sound="silent" aria-label={'Select '+item.title} aria-current={index===active?'true':undefined} onClick={()=>select(index)}/>)}</div>
    <button type="button" data-sound="silent" onClick={()=>select(active+1)} aria-label="Next personal book">→</button>
    <button type="button" data-sound="silent" className="bcv-motion-control" aria-label={paused?'Resume shelf motion':'Pause shelf motion'} onClick={()=>setPaused(value=>!value)}>{paused?'▶':'Ⅱ'}</button>
   </div>
  </div>
  <Suspense fallback={null}>{opened&&<BeyondBookViewer index={opened.index} getOrigin={()=>buttons.current[opened.index]?.getBoundingClientRect()} onChoose={chooseBook} onClosed={closeBook} onSound={kind=>sound.current?.play(kind,0,beyondBooks[opened.index].id)}/>}</Suspense>
 </section>;
}


