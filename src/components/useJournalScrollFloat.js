import {useEffect} from 'react';

// Velocity-driven lift on the presentation wrapper, separate from the book's 3D turns.
export default function useJournalScrollFloat(regionRef,presentationRef,bookRef,transitionRef){
 useEffect(()=>{
  const region=regionRef.current,presentation=presentationRef.current,book=bookRef.current;
  if(!region||!presentation||!book)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
  let frame=0,last=0,lastY=scrollY,lastScroll=performance.now(),lastInput=0,inputVelocity=0,position=0,velocity=0,target=0,visible=false,held=false,disposed=false;
  const paint=()=>{presentation.style.translate=`0 ${position.toFixed(3)}px`;};
  const reset=()=>{cancelAnimationFrame(frame);frame=0;last=0;position=velocity=target=inputVelocity=0;presentation.style.removeProperty('translate');presentation.style.removeProperty('will-change');};
  function wake(){if(!frame&&!disposed&&visible&&!document.hidden&&!preference.matches&&!held&&!transitionRef.current){last=0;frame=requestAnimationFrame(tick);}}
  function tick(now){
   frame=0;if(disposed||!visible||document.hidden||preference.matches||held||transitionRef.current)return;
   const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
   if(now-lastInput>140)target=0;
   const rate=9,offset=position-target,combined=velocity+rate*offset,decay=Math.exp(-rate*dt);
   position=target+(offset+combined*dt)*decay;velocity=(velocity-rate*combined*dt)*decay;
   if(Math.abs(position-target)<.025&&Math.abs(velocity)<.12){position=target;velocity=0;}
   paint();
   if(position!==target||velocity||target!==0){presentation.style.willChange='translate';frame=requestAnimationFrame(tick);}
   else{last=0;presentation.style.removeProperty('will-change');}
  }
  const scroll=()=>{
   const now=performance.now(),delta=scrollY-lastY,dt=Math.max(16,now-lastScroll);lastY=scrollY;lastScroll=now;lastInput=now;
   inputVelocity=delta/dt*1000;
   target=-Math.tanh(inputVelocity/950)*(mobile.matches?14:24);wake();
  };
  const down=()=>{held=true;cancelAnimationFrame(frame);frame=0;last=0;};
  const up=()=>{held=false;wake();};
  const sync=()=>{lastY=scrollY;lastScroll=performance.now();if(preference.matches||document.hidden)reset();else wake();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)reset();else{if(performance.now()-lastInput<140)target=-Math.tanh(inputVelocity/950)*(mobile.matches?14:24);wake();}},{rootMargin:'60px'});observer.observe(region);
  // Pause at the current offset while turning a page; resume without changing its hinge geometry.
  const turns=new MutationObserver(()=>{if(transitionRef.current){cancelAnimationFrame(frame);frame=0;last=0;}else wake();});turns.observe(book,{attributes:true,attributeFilter:['class']});
  window.addEventListener('scroll',scroll,{passive:true});region.addEventListener('pointerdown',down,{passive:true});window.addEventListener('pointerup',up,{passive:true});window.addEventListener('pointercancel',up,{passive:true});window.addEventListener('blur',up);document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);mobile.addEventListener('change',sync);
  return()=>{disposed=true;reset();observer.disconnect();turns.disconnect();window.removeEventListener('scroll',scroll);region.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);window.removeEventListener('blur',up);document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync);mobile.removeEventListener('change',sync);};
 },[regionRef,presentationRef,bookRef,transitionRef]);
}

