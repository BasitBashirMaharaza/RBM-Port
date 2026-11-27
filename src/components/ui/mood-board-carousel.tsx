"use client";
import {useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import './mood-board-carousel.css';

export interface SliderRevolutionCarouselProps {embedKey:string;ariaLabel?:string;className?:string;placeholderClassName?:string}
const join=(...classes:Array<string|false|undefined>)=>classes.filter(Boolean).join(' ');
/** The supplied hosted-module wrapper. Custom content is authored in SR Anywhere. */
export function SliderRevolutionCarousel({embedKey,ariaLabel='Image carousel',className,placeholderClassName='h-svh'}:SliderRevolutionCarouselProps){
 const host=useRef<HTMLDivElement>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{const el=host.current;if(!el||!embedKey)return;setReady(false);setFailed(false);const script=document.createElement('script');script.src=`https://embed.sliderrevolution.com/i/${embedKey}/embed.js`;script.async=true;script.onerror=()=>setFailed(true);el.appendChild(script);const observer=new ResizeObserver(()=>{if(el.offsetHeight>0)setReady(true)});observer.observe(el);return()=>{observer.disconnect();el.replaceChildren();const loaders=(window as unknown as {__sraLoaders?:Record<string,unknown>}).__sraLoaders;if(loaders)delete loaders['SR7_'+embedKey.replace(/[^A-Za-z0-9]/g,'')+'_1'];};},[embedKey]);
 return <section aria-label={ariaLabel} aria-busy={!ready&&!failed} className={join('mood-hosted-carousel',className)}>{!ready&&<div aria-hidden='true' className={join('mood-hosted-placeholder',!failed&&'is-loading',placeholderClassName)}/>}<div ref={host} className='sr-anywhere-embed-host'/>{failed&&<p role='status'>The gallery could not load. Please try again.</p>}</section>;
}
export default SliderRevolutionCarousel;

export interface MoodMedia {src:string;alt:string;collection:number;entry?:number;video?:string}
interface MoodBoardGalleryProps {media:MoodMedia[];layout?:number;paused?:boolean;onActivate:(collection:number,entry:number,trigger:HTMLButtonElement)=>void}
/** Four independent filmstrips keep the reference frame free of overlapping cards. */
export function MoodBoardGallery({media,layout=0,paused=false,onActivate}:MoodBoardGalleryProps){
 const root=useRef<HTMLDivElement>(null),tracks=useRef<Array<HTMLDivElement|null>>([]),motions=useRef<Animation[]>([]),visible=useRef(false),held=useRef(paused),focused=useRef(false),phase=useRef(0),engine=useRef<(()=>void)|null>(null);
 held.current=paused;
 const railCount=layout===2?3:4,size=Math.ceil(media.length/railCount),groups=Array.from({length:railCount},(_,i)=>media.slice(i*size,(i+1)*size)).map(group=>group.length?group:media.slice(0,1));
 useEffect(()=>{
  const node=root.current;if(!node)return;const preference=matchMedia('(prefers-reduced-motion: reduce)');let disposed=false;
  const sync=()=>motions.current.forEach(a=>{if(visible.current&&!held.current&&!document.hidden&&!preference.matches&&!focused.current)a.play();else a.pause()});engine.current=sync;
  const measure=()=>{
   const w=node.clientWidth,h=node.clientHeight,phone=w<700,gap=phone?12:20;node.style.setProperty('--mood-gap',gap+'px');
   const first=motions.current[0];if(first)phase.current=Number(first.currentTime||0)/(Number(first.effect?.getTiming().duration)||1);
   motions.current.forEach(a=>a.cancel());
   motions.current=tracks.current.map((track,i)=>{
    if(!track)return null;
    const rail=track.parentElement!,horizontal=layout===2||(layout===0&&i<2);
    let rw=w,rh=h*.25,rx=0,ry=0,tw=w/(phone?2:4)-gap,th=h*.25-gap;
    if(layout===1){const widths=phone?[.22,.28,.28,.22]:[.16,.44,.25,.15];rw=w*widths[i];rh=h;rx=w*widths.slice(0,i).reduce((a,b)=>a+b,0);tw=rw-gap;th=h*[.4,.5,.62,.45][i]-gap;}
    else if(layout===2){rh=h/3;ry=i*rh;tw=w*(phone?.58:.29)-gap;th=rh-gap;}
    else{if(i===1)ry=h*.75;if(i>=2){rw=w*(phone?.16:.2);rh=h*.5;ry=h*.25;rx=i===3?w-rw:0;tw=rw-gap/2;}}
    Object.assign(rail.style,{left:rx+'px',top:ry+'px',right:'auto',bottom:'auto',width:rw+'px',height:rh+'px'});track.style.flexDirection=horizontal?'row':'column';
    track.querySelectorAll<HTMLElement>('.mood-frame').forEach(tile=>{tile.style.width=tw+'px';tile.style.height=th+'px'});
    const distance=groups[i].length*((horizontal?tw:th)+gap),duration=distance/22*1000;
    const translate=(amount:number)=>horizontal?`translate3d(${amount}px,0,0)`:`translate3d(0,${amount}px,0)`;
    const reverse=i===0||i===3;
    const animation=track.animate([{transform:translate(reverse?-distance:0)},{transform:translate(reverse?0:-distance)}],{duration,iterations:Infinity,easing:'linear'});
    animation.currentTime=(phase.current+i*.17)*duration;return animation;
   }).filter(Boolean) as Animation[];sync();
  };
  const observer=new IntersectionObserver(([entry])=>{visible.current=entry.isIntersecting;sync()},{threshold:.02});observer.observe(node);
  const resize=new ResizeObserver(()=>{if(!disposed)measure()});resize.observe(node);document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);measure();
  return()=>{const first=motions.current[0];if(first)phase.current=Number(first.currentTime||0)/(Number(first.effect?.getTiming().duration)||1);disposed=true;engine.current=null;observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync);motions.current.forEach(a=>a.cancel());motions.current=[]};
 },[media,layout]);
 useEffect(()=>{engine.current?.()},[paused]);
 return <div className='mood-perimeter' data-layout={layout} ref={root} aria-label='Personal mood board' onFocusCapture={event=>{const tile=event.target as HTMLElement;focused.current=tile.matches(':focus-visible');if(focused.current&&tile.tabIndex===0){const rail=Number(tile.closest<HTMLElement>('.mood-rail')?.dataset.rail),slot=Number(tile.dataset.slot),animation=motions.current[rail];if(animation){const reverse=rail===0||rail===3,progress=reverse?1-slot/groups[rail].length:slot/groups[rail].length;animation.currentTime=Math.min(.99999,progress)*Number(animation.effect?.getTiming().duration||0)}}engine.current?.()}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget)){focused.current=false;engine.current?.()}}}>
  {groups.map((group,rail)=><div className={'mood-rail is-'+['top','bottom','left','right'][rail]} data-rail={rail} key={rail}><div className='mood-rail-track' ref={node=>{tracks.current[rail]=node}}>{Array.from({length:4},(_,copy)=>group.map((item,i)=><button className='mood-frame' data-slot={i} type='button' key={`${copy}-${i}`} aria-label={`Explore ${item.alt}`} aria-hidden={copy>0?true:undefined} tabIndex={copy>0?-1:0} onClick={event=>onActivate(item.collection,item.entry||0,event.currentTarget)}><div className='mood-frame-face' key={item.src} style={{'--reveal-delay':`${rail*25+i*30}ms`} as CSSProperties}><img src={item.src} alt='' decoding='async' loading='eager' draggable={false}/><span aria-hidden='true'>↗</span></div></button>))}</div></div>)}
 </div>;
}
