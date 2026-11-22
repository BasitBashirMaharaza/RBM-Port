import {useEffect,useRef} from 'react';

const colors=['#a8e786','#83cde3','#d6a5f1','#edbc77','#ef9baa','#90ddb7'];
function SubjectMark({kind}){
 return <svg viewBox="0 0 80 60" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
  {kind===0?<><path d="m12 15 28 15L12 45m28-15 28-15M40 30l28 15M12 15l56 30M12 45l56-30"/>{[[12,15],[12,45],[40,30],[68,15],[68,45]].map(([x,y])=><circle key={x+','+y} cx={x} cy={y} r="4" fill="currentColor"/>)}</>:kind===1?<><path d="m25 15-17 15 17 15m30-30 17 15-17 15M46 9 34 51"/></>:kind===2?<><path d="m40 8 32 16-32 16L8 24 40 8ZM8 33l32 16 32-16M8 42l32 16 32-16"/></>:<><path d="M10 8v44h62M22 43V32m13 11V24m13 19V19m13 24V10M18 25l17-10 13 3L66 5"/></>}
 </svg>;
}

export default function LearningScreensaver({active,label,logo,kind}){
 const root=useRef(null),sprite=useRef(null),state=useRef({x:null,y:null,vx:52,vy:37,hits:0,color:0});
 useEffect(()=>{
  const node=root.current,mark=sprite.current,motion=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last=0,visible=false,alive=true,maxX=0,maxY=0;
  const place=()=>{const s=state.current;mark.style.transform=`translate3d(${s.x||0}px,${s.y||0}px,0)`;};
  const measure=()=>{maxX=Math.max(0,node.clientWidth-mark.offsetWidth);maxY=Math.max(0,node.clientHeight-mark.offsetHeight);const s=state.current;if(s.x===null){s.x=maxX*.18;s.y=maxY*.26;}s.x=Math.min(maxX,Math.max(0,s.x));s.y=Math.min(maxY,Math.max(0,s.y));if(motion.matches){s.x=maxX/2;s.y=maxY/2;}place();};
  const paint=now=>{
   frame=0;if(!alive||!active||!visible||document.hidden||motion.matches)return;
   const dt=last?Math.min((now-last)/1000,.05):0;last=now;const s=state.current;let hit=false;s.x+=s.vx*dt;s.y+=s.vy*dt;
   if(s.x>=maxX){s.x=maxX;s.vx=-Math.abs(s.vx);hit=true;}else if(s.x<=0){s.x=0;s.vx=Math.abs(s.vx);hit=true;}
   if(s.y>=maxY){s.y=maxY;s.vy=-Math.abs(s.vy);hit=true;}else if(s.y<=0){s.y=0;s.vy=Math.abs(s.vy);hit=true;}
   if(hit){s.hits++;s.color=(s.color+1)%colors.length;mark.style.color=colors[s.color];node.dataset.bounces=String(s.hits);}
   place();frame=requestAnimationFrame(paint);
  };
  const sync=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(active&&visible&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(paint);};
  const resize=new ResizeObserver(()=>{measure();sync();});resize.observe(node);resize.observe(mark);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(node);
  mark.style.color=colors[state.current.color];measure();
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',measure);motion.addEventListener('change',sync);
  return()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',measure);motion.removeEventListener('change',sync);};
 },[active]);
 return <div ref={root} className="lg-screen-saver" data-bounces={state.current.hits} role="img" aria-label={`${label} bouncing logo screensaver`}>
  <div ref={sprite} className="lg-saver-logo" aria-hidden="true">{logo?<span className="lg-saver-brand" style={{maskImage:`url("${logo}")`,WebkitMaskImage:`url("${logo}")`}}/>:kind==='overview'?<strong className="lg-saver-monogram">BB.</strong>:<SubjectMark kind={kind}/>}
   <span>{label}</span>
  </div>
 </div>;
}
