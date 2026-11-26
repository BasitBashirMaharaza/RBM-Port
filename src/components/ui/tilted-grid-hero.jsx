import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import './tilted-grid-hero.css';

// Geometry and the sixteen image facets are from the supplied TiltedGridHero reference.
const SLICES=16,CAMERA=1.6,MAX_WIDTH=55;
const wrap=(value,length)=>((value%length)+length)%length;
function arc(bend){return (CAMERA-1+Math.cos(bend))/(2*CAMERA*Math.sin(bend));}
function measure(width,height,tile,aspect,gap,bend){
 const h=Math.min(tile/100*height,MAX_WIDTH/100*width/aspect),radius=width*arc(bend);
 if(!(h>0)||!(radius>0))return{columns:2,sweep:0,unit:0,limit:0};
 const deg=rad=>rad*180/Math.PI,unit=deg(h/radius),pitch=(aspect+gap/100)*unit;
 const limit=deg(bend)+aspect*unit/2,columns=Math.min(60,Math.max(2,Math.ceil(2*limit/pitch)));
 const round=n=>+n.toFixed(4),sweep=round(columns*pitch/2);
 return{columns,sweep,unit:round(unit),limit:round(Math.min(sweep,limit))};
}
export const TiltedGridHero=forwardRef(function TiltedGridHero({images,speed=4,tileHeight=26,aspectRatio=16/9,gap=6,axis=56,curve=80,fade=12,paused=false,onActivate,onActiveChange,onHover,className='',children},api){
 const root=useRef(null),tiles=useRef([]),shownRef=useRef({}),controls=useRef({}),held=useRef(null),suppress=useRef(false),active=useRef(0),pauseRef=useRef(paused);
 const [layout,setLayout]=useState(null),[shown,setShown]=useState({}),[focusSlot,setFocusSlot]=useState(0);
 const id=useId().replace(/[^a-zA-Z0-9]/g,''),orbit=`tgh-o-${id}`;
 const bend=Math.min(85,Math.max(5,curve))*Math.PI/180;
 const {columns,sweep,unit,limit}=layout??measure(1200,560,tileHeight,aspectRatio,gap,bend);
 const duration=columns*speed,centre=Math.floor(columns/2),phase=columns%2?.5:0;
 const first=t=>centre-t;
 const indexFor=t=>wrap(shownRef.current[t]??first(t),Math.max(1,images.length));
 const u=n=>`calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(MAX_WIDTH/aspectRatio).toFixed(4)}cqw))`;
 const r=100*arc(bend),radius=`${+r.toFixed(3)}cqw`;
 const turn=degrees=>`translateZ(${radius}) rotateY(${+degrees.toFixed(4)}deg) translateZ(-${radius})`;
 const hide=+(((sweep-limit)/(2*sweep||1))*100).toFixed(4),feather=Math.min(8,unit*.12);
 const alpha=a=>Math.max(0,Math.min(1,(limit-Math.abs(a))/feather));
 const fadeIn=(sweep-limit+feather)/(2*sweep||1)*100,fadeOut=100-fadeIn;
 const css=`@keyframes ${orbit}{from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}0%,${hide}%,${100-hide}%,100%{visibility:hidden;opacity:0}${hide+.001}%,${100-hide-.001}%{visibility:visible}${fadeIn}%,${fadeOut}%{opacity:1}}`;
 useEffect(()=>{
  const observer=new ResizeObserver(([entry])=>{
   const next=measure(entry.contentRect.width,entry.contentRect.height,tileHeight,aspectRatio,gap,bend);
   setLayout(previous=>previous?.columns===next.columns&&previous.sweep===next.sweep&&previous.unit===next.unit?previous:next);
  });observer.observe(root.current);return()=>observer.disconnect();
 },[tileHeight,aspectRatio,gap,bend]);
 useEffect(()=>{for(const {src}of images){const image=new Image();image.src=src;image.decoding='async';}},[images]);
 useLayoutEffect(()=>{
  if(!layout)return;
  tiles.current.length=columns;
  const node=root.current,motion=matchMedia('(prefers-reduced-motion: reduce)'),ms=duration*1000;
  let visible=false,focus=false,disposed=false,navigating=false,overlays=[],queued=null,swapTimers=[];
  // Advancing by a whole multiple of the image list leaves the initial jackets unchanged,
  // and gives reverse navigation room before zero on the document timeline.
  const loops=Math.max(1,images.length)*100,base=tiles.current.map(tile=>{getComputedStyle(tile).animationName;return tile.getAnimations().find(a=>a.animationName===orbit);});
  if(base.some(animation=>!animation)){const retry=requestAnimationFrame(()=>setLayout(current=>({...current})));return()=>cancelAnimationFrame(retry);}
  const publish=()=>{if(disposed)return;let best=0,distance=Infinity;
   base.forEach((animation,t)=>{const p=animation?.effect.getComputedTiming().progress;if(p===null||p===undefined)return;const a=-sweep+2*sweep*p;if(Math.abs(a)<distance){distance=Math.abs(a);best=t;}});
   const index=indexFor(best);active.current=index;setFocusSlot(best);onActiveChange?.(index);
  };
  const setImagesAt=()=>{
   const next={};base.forEach((animation,t)=>{const time=Number(animation.currentTime)||0;const lap=Math.floor((time+(t+phase)*speed*1000)/ms);next[t]=lap*columns+first(t);});shownRef.current=next;return next;
  };
  base.forEach(animation=>{if(animation)animation.currentTime=loops*ms+active.current*speed*1000;});
  setShown(setImagesAt());
  const sync=()=>{const stop=!visible||document.hidden||motion.matches||pauseRef.current||focus||held.current||navigating;
   base.forEach(animation=>{if(!animation)return;if(stop)animation.pause();else animation.play();});
   if(!navigating)publish();
  };
  // Invert ease-in-out to swap a jacket only while its wrapped volume is invisible.
  const easeTime=progress=>{let lo=0,hi=1;for(let i=0;i<18;i++){const t=(lo+hi)/2,y=3*t*t-2*t*t*t;if(y<progress)lo=t;else hi=t;}const t=(lo+hi)/2;return 3*.42*(1-t)*(1-t)*t+3*.58*(1-t)*t*t+t*t*t;};
  const seek=(steps,immediate=false)=>{
   if(!base[0])return;
   if(navigating){queued={steps:wrap((queued?.steps||0)+steps+images.length/2,images.length)-images.length/2,immediate};return;}
   publish();navigating=true;sync();
   const current=Number(base[0].currentTime)||0;
   let nearest=Infinity,angle=0;
   const angles=base.map(animation=>{const p=animation.effect.getComputedTiming().progress??0,a=-sweep+2*sweep*p;if(Math.abs(a)<nearest){nearest=Math.abs(a);angle=a;}return a;});
   const delta=steps*2*sweep/columns-angle,deltaTime=delta/(2*sweep)*ms;
   const liftTime=current+deltaTime<ms?loops*ms:0;
   const targetTimes=base.map(animation=>(Number(animation.currentTime)||0)+deltaTime+liftTime);
   const targetImages=Object.fromEntries(targetTimes.map((time,t)=>[t,Math.floor((time+(t+phase)*speed*1000)/ms)*columns+first(t)]));
   const finish=()=>{if(disposed)return;swapTimers.forEach(clearTimeout);swapTimers=[];
    base.forEach((animation,t)=>{animation.currentTime=targetTimes[t];});shownRef.current=targetImages;setShown({...targetImages});
    overlays.forEach(animation=>animation.cancel());overlays=[];navigating=false;sync();
    if(queued){const next=queued;queued=null;if(next.index!==undefined)select(next.index,next.immediate);else if(next.steps)seek(next.steps,next.immediate);}
   };
   if(immediate||motion.matches||Math.abs(delta)<.01){finish();return;}
   const navDuration=720;
   overlays=tiles.current.map((tile,t)=>{
    const start=angles[t],end=start+delta,points=new Set(Array.from({length:25},(_,i)=>i/24));
    const lower=Math.min(start,end),upper=Math.max(start,end);
    for(let lap=Math.floor((lower+sweep)/(2*sweep));lap<=Math.ceil((upper+sweep)/(2*sweep));lap++){
     const boundary=-sweep+lap*2*sweep,p=(boundary-start)/delta;
     if(p>0&&p<1){points.add(Math.max(0,p-.00001));points.add(Math.min(1,p+.00001));
      swapTimers.push(setTimeout(()=>{if(disposed)return;setShown(previous=>({...previous,[t]:targetImages[t]}));},navDuration*easeTime(p)));
     }
    }
    return tile.animate([...points].sort((a,b)=>a-b).map(p=>{
     const a=wrap(start+delta*p+sweep,2*sweep)-sweep;
     return{offset:p,transform:turn(a),opacity:alpha(a),visibility:Math.abs(a)<limit?'visible':'hidden'};
    }),{duration:navDuration,easing:'ease-in-out',fill:'both'});
   });
   const start=document.timeline.currentTime;overlays.forEach(animation=>{animation.startTime=start;});
   Promise.all(overlays.map(animation=>animation.finished)).then(finish).catch(()=>{});
  };
  const select=(index,immediate=false)=>{if(navigating){queued={index,immediate};return;}publish();const length=images.length;const steps=wrap(index-active.current+length/2,length)-length/2;seek(steps,immediate);};
  controls.current={sync,step:seek,select,publish,isNavigating:()=>navigating,imageAt:t=>Math.floor(((Number(base[t]?.currentTime)||0)+(t+phase)*speed*1000)/ms)*columns+first(t)};
  const focusIn=event=>{focus=event.target.matches(':focus-visible');sync();},focusOut=event=>{if(!node.contains(event.relatedTarget)){focus=false;sync();}};
  node.addEventListener('focusin',focusIn);node.addEventListener('focusout',focusOut);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.18;node.dataset.visible=String(entry.isIntersecting);sync();},{threshold:[0,.18]});observer.observe(node);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  const report=setInterval(()=>{if(visible&&!document.hidden&&!navigating)publish();},speed*1000);
  sync();
  return()=>{disposed=true;clearInterval(report);swapTimers.forEach(clearTimeout);overlays.forEach(animation=>animation.cancel());observer.disconnect();node.removeEventListener('focusin',focusIn);node.removeEventListener('focusout',focusOut);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);controls.current={};};
 },[layout,speed]);
 useEffect(()=>{pauseRef.current=paused;controls.current.sync?.();},[paused]);
 useImperativeHandle(api,()=>({
  step:(amount,immediate)=>controls.current.step?.(amount,immediate),
  select:(index,immediate)=>controls.current.select?.(index,immediate),
  hold:()=>{pauseRef.current=true;controls.current.sync?.();},
  getOrigin:index=>{const tile=tiles.current.find((tile,t)=>tile&&indexFor(t)===index&&getComputedStyle(tile).visibility==='visible');return tile?.getBoundingClientRect();},
  focusBook:index=>{const tile=tiles.current.find((tile,t)=>tile&&indexFor(t)===index&&getComputedStyle(tile).visibility==='visible');tile?.focus({preventScroll:true});},
 }));
 const end=event=>{const gesture=held.current;if(!gesture||event.pointerId!==gesture.id)return;held.current=null;
  if(gesture.dragged){suppress.current=true;if(event.type!=='pointercancel')controls.current.step?.(gesture.dx<0?1:-1);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
  controls.current.sync?.();
 };
 return <div ref={root} className={`tilted-grid-hero ${className}`} role="region" aria-label="Curved personal book collection" data-ready={!!layout}
  onPointerDown={event=>{if(!event.isPrimary||event.button!==0)return;suppress.current=false;held.current={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,dragged:false};controls.current.sync?.();}}
  onPointerMove={event=>{const gesture=held.current;if(!gesture||gesture.id!==event.pointerId)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;if(!gesture.dragged&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){held.current=null;controls.current.sync?.();return;}gesture.dx=dx;if(Math.abs(dx)>35){gesture.dragged=true;event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault();}}}
  onPointerUp={end} onPointerCancel={end} onClickCapture={event=>{if(suppress.current){suppress.current=false;event.preventDefault();event.stopPropagation();}}}
  onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();controls.current.step?.(event.key==='ArrowRight'?1:-1,true);}}}>
  <style>{css}</style>
  <div className="tgh-band" style={{opacity:layout?1:0,perspective:`${+(r*CAMERA).toFixed(3)}cqw`,perspectiveOrigin:`50% ${axis}%`,maskImage:`linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100-fade}%,transparent)`}}>
   {Array.from({length:columns},(_,t)=>{const index=wrap(shown[t]??first(t),Math.max(1,images.length)),image=images[index],share=aspectRatio/SLICES;
    return <button key={t} ref={node=>{tiles.current[t]=node;}} type="button" data-sound="silent" data-book-index={index} className="tgh-tile" tabIndex={t===focusSlot?0:-1} aria-label={`Open ${image?.alt||'personal book'}`}
     style={{left:`calc(50% - ${u(aspectRatio/2)})`,top:`calc(${axis}% - ${u(.5)})`,width:u(aspectRatio),height:u(1),'--tgh-period':`${duration}s`,animation:`${orbit} ${duration}s linear ${-(t+phase)*speed}s infinite`}}
     onPointerEnter={event=>{if(event.pointerType==='mouse')onHover?.(index);}} onClick={event=>{controls.current.publish?.();onActivate?.(index,event.currentTarget);}}
     onAnimationIteration={event=>{if(event.target!==event.currentTarget||event.animationName!==orbit)return;const lap=Math.round(event.elapsedTime/duration),next=controls.current.imageAt?.(t)??(lap*columns+first(t));shownRef.current={...shownRef.current,[t]:next};if(!controls.current.isNavigating?.())setShown(previous=>previous[t]===next?previous:{...previous,[t]:next});}}>
     {Array.from({length:SLICES},(_,k)=>{const bleedLeft=k===0?0:1.5,bleedRight=k===SLICES-1?0:1.5;
      return <span key={k} className={`tgh-facet${k===0?' tgh-first':''}${k===SLICES-1?' tgh-last':''}`} aria-hidden="true" style={{left:`calc(${u((aspectRatio-share)/2)} - ${bleedLeft}px)`,width:`calc(${u(share)} + ${bleedLeft+bleedRight}px)`,height:u(1),transformOrigin:`calc(${u(share/2)} + ${bleedLeft}px) 50%`,transform:turn((aspectRatio/2-(k+.5)*share)*unit)}}>{image&&<img src={image.src} alt="" draggable={false} decoding="async" style={{left:`calc(${u(-k*share)} + ${bleedLeft}px)`,width:u(aspectRatio),height:u(1)}}/>}</span>;
     })}
    </button>;
   })}
  </div>{children}
 </div>;
});
export default TiltedGridHero;
