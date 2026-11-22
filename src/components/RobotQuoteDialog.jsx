import RobotDisplayText from './RobotDisplayText.jsx';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

export default function RobotQuoteDialog({quote,origin,onClose,onProjection,getProjectionFrame}){
 const dialog=useRef(null),panel=useRef(null),close=useRef(null),avatar=useRef(null),rays=useRef([]),timer=useRef(null),closingRef=useRef(false);
 const [revealed,setRevealed]=useState(false),[closing,setClosing]=useState(false);
 const closeWindow=()=>{if(closingRef.current)return;closingRef.current=true;setClosing(true);timer.current=setTimeout(onClose,matchMedia('(prefers-reduced-motion: reduce)').matches?0:240);};
 useLayoutEffect(()=>{
  const node=dialog.current,previous=document.activeElement;node.showModal();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0,alive=true,ports=[];
  onProjection(true,avatar.current);
  const measure=()=>{
   if(!alive)return;const current=getProjectionFrame?.(),eye=current?.eyes?.[0]||origin,width=panel.current.offsetWidth,height=panel.current.offsetHeight,gap=65,margin=24;
   let x=(innerWidth-width)/2,y=(innerHeight-height)/2;
   if(innerWidth>800){x=eye.x<innerWidth/2?eye.x+gap:eye.x-width-gap;}
   else{y=innerHeight-eye.y>height+gap+margin?eye.y+gap:eye.y-height-gap;}
   x=Math.max(margin,Math.min(innerWidth-width-margin,x));y=Math.max(margin,Math.min(innerHeight-height-margin,y));
   panel.current.style.left=x+'px';panel.current.style.top=y+'px';panel.current.style.setProperty('--projection-pivot-x',Math.max(0,Math.min(width,eye.x-x))+'px');panel.current.style.setProperty('--projection-pivot-y',Math.max(0,Math.min(height,eye.y-y))+'px');
   const side=eye.x<x?'left':eye.x>x+width?'right':eye.y<y?'top':'bottom';
   ports=side==='left'?[{x,y:y+height*.38},{x,y:y+height*.62}]:side==='right'?[{x:x+width,y:y+height*.38},{x:x+width,y:y+height*.62}]:side==='top'?[{x:x+width*.35,y},{x:x+width*.65,y}]:[{x:x+width*.35,y:y+height},{x:x+width*.65,y:y+height}];
  };
  const paint=()=>{
   if(!alive)return;const current=getProjectionFrame?.();
   if(current){const r=current.rect;avatar.current.style.cssText=`left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px`;
    current.eyes.forEach((eye,i)=>{const port=ports[i];if(!port)return;const path=`M${eye.x} ${eye.y} L${port.x} ${port.y}`;rays.current[i]?.setAttribute('d',path);rays.current[i+2]?.setAttribute('d',path);});
   }
   if(!reduced&&!document.hidden)frame=requestAnimationFrame(paint);
  };
  measure();const observer=new ResizeObserver(measure);observer.observe(panel.current);window.addEventListener('resize',measure);
  frame=requestAnimationFrame(paint);const reveal=setTimeout(()=>{setRevealed(true);close.current?.focus({preventScroll:true});},reduced?0:500);
  const visibility=()=>{cancelAnimationFrame(frame);if(!reduced&&!document.hidden)frame=requestAnimationFrame(paint);};document.addEventListener('visibilitychange',visibility);
  return()=>{alive=false;cancelAnimationFrame(frame);clearTimeout(reveal);clearTimeout(timer.current);observer.disconnect();window.removeEventListener('resize',measure);document.removeEventListener('visibilitychange',visibility);onProjection(false);node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[onProjection,getProjectionFrame,origin]);
 useEffect(()=>{
  const bodyOverflow=document.body.style.overflow,rootOverflow=document.documentElement.style.overflow,oldGutter=document.documentElement.style.scrollbarGutter;
  document.documentElement.style.scrollbarGutter='stable';document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
  return()=>{document.body.style.overflow=bodyOverflow;document.documentElement.style.overflow=rootOverflow;document.documentElement.style.scrollbarGutter=oldGutter;};
 },[]);
 return createPortal(<dialog ref={dialog} className="robot-quote-dialog" data-revealed={revealed} data-closing={closing} aria-label="A thought from your robot companion" onCancel={event=>{event.preventDefault();closeWindow();}} onClick={event=>{if(event.target===event.currentTarget)closeWindow();}}>
  <canvas ref={avatar} className="robot-projection-avatar" aria-hidden="true"/>
  <svg className="robot-quote-projection" aria-hidden="true" width="100%" height="100%">{[0,1,2,3].map((i)=><path key={i} ref={node=>{rays.current[i]=node;}} className={i<2?'robot-eye-ray':'robot-eye-ray-halo'} pathLength="1" fill="none"/>)}</svg>
  <section ref={panel} className="robot-quote-card">
   <div className="robot-quote-hardware"><svg viewBox="0 0 36 28" fill="none" aria-hidden="true"><path d="M8 5V2h20v3M4 11H2v9h2m28-9h2v9h-2M9 5h18a5 5 0 0 1 5 5v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a5 5 0 0 1 5-5Z"/><rect x="9" y="11" width="18" height="9" rx="4"/><path d="M14 14v3m8-3v3"/></svg><span>YOUR LITTLE COMPANION<small>A small thought from a small friend.</small></span></div>
   <button ref={close} className="robot-quote-close" type="button" aria-label="Close robot quote" onClick={closeWindow}>×</button>
   <div className="robot-quote-screen"><span className="robot-quote-label"><i aria-hidden="true"/> A LITTLE TRANSMISSION</span><blockquote><RobotDisplayText>{quote}</RobotDisplayText></blockquote><p>Curiosity looks good on you.<span>Keep a little room for the unexpected.</span></p><span className="robot-quote-footer"><b aria-hidden="true">◉</b> TRANSMITTED WITH A LITTLE SPARK</span></div>
   <i className="robot-case-screw screw-left" aria-hidden="true"/><i className="robot-case-screw screw-right" aria-hidden="true"/>
  </section>
 </dialog>,document.body);
}
