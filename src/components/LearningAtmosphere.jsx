import {useEffect,useRef} from 'react';
import './learning-atmosphere.css';

const neurons=[[1100,165],[1100,235],[1100,305],[1200,140],[1200,235],[1200,330],[1300,185],[1300,285]];

export default function LearningAtmosphere(){
 const root=useRef(null);
 useEffect(()=>{
  const node=root.current,motion=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
  const sync=()=>node.toggleAttribute('data-running',visible&&!document.hidden&&!motion.matches);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{rootMargin:'60px'});observer.observe(node);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);};
 },[]);
 return <div className="lg-living-background" ref={root} aria-hidden="true">
  <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" fill="none">
   <g className="lg-background-circuits">
    <g className="lg-background-structure"><path d="M-20 175h124l44 44h111M-20 355h98l70-70h111M196 0v110l32 32v48M196 500v-92l32-32v-58M338 240h68l52-52h92"/><rect x="151" y="190" width="124" height="124" rx="12"/><rect x="168" y="207" width="90" height="90" rx="4"/><path d="M178 178v12m24-12v12m24-12v12m24-12v12M178 314v12m24-12v12m24-12v12m24-12v12M139 216h12m-12 24h12m-12 24h12m-12 24h12m124-72h12m-12 24h12m-12 24h12m-12 24h12"/></g>
    <path className="lg-background-signal signal-compute" pathLength="100" d="M-20 175h124l44 44h111M196 500v-92l32-32v-58M338 240h68l52-52h92"/>
    {Array.from({length:9},(_,i)=><rect key={i} className="lg-background-register" x={184+(i%3)*22} y={223+Math.floor(i/3)*22} width="13" height="13" rx="2" style={{animationDelay:(i*.65)+'s'}}/>)}
   </g>
   <g className="lg-background-neural">
    <g className="lg-background-structure"><path d="m1100 165 100-25 100 45m-200-20 100 70 100-50m-200 50h100l100-50m-200 50 100 95 100-45m-200 20 100-70 100 50m-200 20 100 25 100-45M1000 235h100m200 0h160"/>{neurons.map(([x,y])=><circle key={x+','+y} cx={x} cy={y} r="8"/>)}</g>
    <path className="lg-background-signal signal-learning" pathLength="100" d="M1000 235h100l100-95 100 45m-200 120 100-70 100 50h160"/>
    {neurons.map(([x,y],i)=><circle key={i} className="lg-background-neuron" cx={x} cy={y} r="3" style={{animationDelay:(i*.8)+'s'}}/>)}
   </g>
   <g className="lg-background-analytics">
    <g className="lg-background-structure"><path d="M935 625h480M966 650V480M1028 625v-24m58 24v-46m58 46v-69m58 69v-88m58 88v-116m58 116v-149"/><path d="M980 594c47 0 67-52 112-52s48 25 94 1 92-72 170-65"/></g>
    <path className="lg-background-signal signal-analytics" pathLength="100" d="M980 594c47 0 67-52 112-52s48 25 94 1 92-72 170-65"/>
    <path className="lg-background-contour" d="M-20 605h154l72-72h145l75 75h128M-20 629h168l72-72h120l75 75h139"/>
   </g>
  </svg>
 </div>;
}
