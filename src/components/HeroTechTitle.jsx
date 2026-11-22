import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useHeroReducedMotion from './useHeroReducedMotion.js';
import { TextRoll } from './ui/text-roll.tsx';
import TechText from './TechText.jsx';
import './hero-tech-title.css';


function measureIDot(style){
 const size=parseFloat(style.fontSize),pad=8,canvas=document.createElement('canvas');
 canvas.width=Math.ceil(size+pad*2);canvas.height=Math.ceil(size*1.5+pad*2);
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return {x:0,top:-size*.75,width:size*.12};
 ctx.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;ctx.fillText('i',pad,size+pad);
 const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);let first=false,left=canvas.width,right=0,top=0;
 for(let y=0;y<canvas.height;y++){
  let row=false;for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>64){row=true;left=Math.min(left,x);right=Math.max(right,x);}
  if(first&&!row)break;if(row&&!first){top=y;first=true;}
 }
 return first?{x:(left+right+1)/2-pad,top:top-size-pad,width:right-left+1}:{x:ctx.measureText('i').width/2,top:-size*.75,width:size*.12};
}

export default function HeroTechTitle({onAnimationComplete}) {
 const root=useRef(null),baseline=useRef(null);
 const [geometry,setGeometry]=useState(null),[finished,setFinished]=useState(false),[ready,setReady]=useState(false),[fine,setFine]=useState(false),[idleSweep,setIdleSweep]=useState(false);
 const reduced=useHeroReducedMotion();
 useEffect(()=>{
  const query=matchMedia('(hover: hover) and (pointer: fine)');const update=()=>setFine(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  if(!ready||reduced){setIdleSweep(false);return undefined;}
  const hero=root.current?.closest('#home');if(!hero)return undefined;
  let timer=0,visible=false;
  const activity=()=>{
   clearTimeout(timer);setIdleSweep(false);
   if(visible&&!document.hidden)timer=setTimeout(()=>setIdleSweep(true),8000);
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.intersectionRatio>=.6;activity();},{threshold:[0,.6]});observer.observe(hero);
  const events=['pointermove','pointerdown','keydown','scroll'];
  events.forEach(event=>window.addEventListener(event,activity,{passive:true}));document.addEventListener('visibilitychange',activity);
  return()=>{clearTimeout(timer);observer.disconnect();events.forEach(event=>window.removeEventListener(event,activity));document.removeEventListener('visibilitychange',activity);};
 },[ready,reduced]);
 useLayoutEffect(()=>{
  const node=root.current;let disposed=false;
  const measure=()=>{
   if(disposed)return;const rect=node.getBoundingClientRect(),style=getComputedStyle(node),pad=48;
   const wrap=node.closest('.editorial-title-wrap'),letter=node.querySelectorAll('.text-roll-width')[7],signature=wrap?.querySelector('.editorial-signature');
   wrap?.style.setProperty('--hero-word-width',rect.width+'px');
   if(wrap&&letter&&signature){
    const frame=wrap.getBoundingClientRect(),dot=measureIDot(style),left=letter.getBoundingClientRect().left-frame.left+dot.x+dot.width*.65;
    const top=baseline.current.getBoundingClientRect().top-frame.top+dot.top-dot.width*.6;
    wrap.style.setProperty('--hero-name-top',top+'px');
    wrap.style.setProperty('--hero-name-available',Math.max(30,frame.width-left-8)+'px');
    wrap.style.setProperty('--hero-name-left',left+'px');
    const nameStyle=getComputedStyle(signature),probe=document.createElement('canvas').getContext('2d');
    if(probe){probe.font=`${nameStyle.fontStyle} 400 100px ${nameStyle.fontFamily}`;const ratio=Math.max(1,probe.measureText('Basit Bashir').width/100-.035*12+.7);wrap.style.setProperty('--hero-name-fit',Math.max(10,(frame.width-left-8)/ratio)+'px');}
   }
   const next={fontSize:parseFloat(style.fontSize),fontFamily:style.fontFamily,left:pad,baseline:baseline.current.getBoundingClientRect().top-rect.top+pad,width:rect.width,positions:[...node.querySelectorAll('.text-roll-width')].map(letter=>letter.getBoundingClientRect().left-rect.left+pad)};
   setGeometry(previous=>JSON.stringify(previous)===JSON.stringify(next)?previous:next);
  };
  const observer=new ResizeObserver(measure);observer.observe(node);window.addEventListener('resize',measure);measure();document.fonts?.ready.then(measure);
  return()=>{disposed=true;observer.disconnect();window.removeEventListener('resize',measure);};
 },[]);
 const complete=()=>{setFinished(true);onAnimationComplete?.();};
 return <span ref={root} className={'hero-tech-word'+(ready?' is-tech-ready':'')+(idleSweep?' is-idle-sweeping':'')}>
  <TextRoll className="editorial-title-roll" duration={.42} getEnterDelay={index=>index*.035} getExitDelay={index=>index*.035+.18} onAnimationComplete={complete}>Portfolio</TextRoll><span ref={baseline} className="hero-tech-baseline" aria-hidden="true"/>
  {(finished||reduced)&&geometry&&<span className="hero-tech-stage" aria-hidden="true"><TechText text="Portfolio" fontFamily={geometry.fontFamily} fontWeight={700} fontSize={geometry.fontSize} letterSpacing={-.067} layout={geometry} color="currentColor" accentColor="currentColor" reveal="letter" dashLength={4} dashGap={2} specks={15} intro="none" clickKick={!reduced} draggable={fine&&!reduced} sweep={idleSweep&&!reduced} guides={false} onReady={()=>setReady(true)}/></span>}
 </span>;
}
