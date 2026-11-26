import {useEffect,useRef} from 'react';

// One observed heading and one compositor animation; no per-letter scroll work.
export default function ContactHeading(){
 const heading=useRef(null);
 useEffect(()=>{
  const node=heading.current,preference=matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  const observer=new IntersectionObserver(([entry])=>{
   if(!entry.isIntersecting)return;
   observer.disconnect();
   if(!preference.matches)animation=node.animate([{opacity:.55,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.23,1,.32,1)'});
  },{threshold:.2});
  const reduce=()=>{if(preference.matches)animation?.finish();};
  observer.observe(node);preference.addEventListener('change',reduce);
  return()=>{observer.disconnect();animation?.cancel();preference.removeEventListener('change',reduce);};
 },[]);
 return <h2 ref={heading}>Let’s build something <em>useful.</em></h2>;
}
