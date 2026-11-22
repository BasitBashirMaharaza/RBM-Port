import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import RotatingText from './RotatingText.jsx';

const traits = [
 ['clear','Clear Thinker','M118 24 C133 18 145 24 151 35 M141 32 L151 35 L149 25'],
 ['detail','Detail-Oriented','M282 24 C267 18 255 24 249 35 M251 25 L249 35 L259 32'],
 ['people','People-First','M54 148 C67 140 79 143 85 156 M75 148 L85 156 L83 145'],
 ['curious','Curious','M346 148 C333 140 321 143 315 156 M325 148 L315 156 L317 145'],
 ['fast','Fast Learner','M112 308 C121 297 135 288 150 285 M137 282 L150 285 L141 294'],
 ['consistent','Consistent','M288 308 C279 297 265 288 250 285 M259 294 L250 285 L263 282'],
];
const skills=['Retrieval-Augmented Generation','Clinical conversational AI','Predictive modeling','Pharmacy operations & ERP'];
const taglines=['purpose.','care.','curiosity.'];

// Resume in place: leaving the section or changing tabs never restarts the sequence.
function useProfileActivity(ref) {
 const [state,setState]=useState({playing:false,reduced:false});
 useEffect(()=>{
  const node=ref.current;if(!node)return undefined;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
  const sync=()=>setState({playing:visible&&!document.hidden&&!preference.matches,reduced:preference.matches});
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.12});
  observer.observe(node);preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
  return()=>{observer.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
 },[ref]);
 return state;
}

export function ProfileTagline(){
 const root=useRef(null);const {playing}=useProfileActivity(root);
 return <span ref={root} className="profile-tagline"><span>Building with</span><RotatingText texts={taglines} effect="slide" direction="up" highlight highlightColor="var(--accent)" style={{color:'var(--accent-ink)'}} staggerFrom="last" staggerDuration={.025} splitLevelClassName="profile-tagline-mask" rotationInterval={3000} auto={playing} mainClassName="profile-tagline-rotator"/></span>;
}

export function ProfileAnnotations(){
 const root=useRef(null);const {playing,reduced}=useProfileActivity(root);
 const order=useRef(null),cursor=useRef(0),started=useRef(false);
 const [shown,setShown]=useState([]);
 useEffect(()=>{
  // Clear Thinker leads; every other label appears once in a shuffled cycle.
  const tail=[1,2,3,4,5];for(let i=tail.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tail[i],tail[j]]=[tail[j],tail[i]];}
  order.current=[0,...tail];
 },[]);
 useEffect(()=>{
  if(!playing)return undefined;
  const step=()=>{
   cursor.current=(cursor.current+1)%(traits.length*2);
   const count=cursor.current<=traits.length?cursor.current:traits.length*2-cursor.current;
   if(count===0){
    const next=[0,1,2,3,4,5];
    for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]];}
    order.current=next;
   }
   setShown(order.current.slice(0,count));
  };
  if(!started.current){started.current=true;step();}
  const timer=setInterval(step,1200);return()=>clearInterval(timer);
 },[playing]);
 return <>
  <svg ref={root} className="about-profile-arrows profile-cycling-arrows" viewBox="0 0 400 320" preserveAspectRatio="none" aria-hidden="true">{traits.map(([id,,path],i)=>{
   const visible=reduced||shown.includes(i);
   return <motion.path key={id} d={path} initial={{opacity:0,pathLength:0}} animate={{opacity:visible?1:0,pathLength:visible?1:0}} transition={{duration:reduced?0:visible ? .38 : .18,delay:reduced||!visible?0:.18,ease:[.22,1,.36,1]}}/>;
  })}</svg>
  {traits.map(([id,label],i)=>{const visible=reduced||shown.includes(i);return <motion.span key={id} className={'about-profile-note profile-cycling-note note-'+id} data-trait={id} data-visible={visible?'true':'false'} initial={{opacity:0,clipPath:'inset(0 100% 0 0)'}} animate={{opacity:visible?1:0,clipPath:visible?'inset(0 0% 0 0)':'inset(0 100% 0 0)'}} transition={{duration:reduced?0:visible ? .3 : .18,delay:reduced||visible?0:.18,ease:[.22,1,.36,1]}}>{label}</motion.span>;})}
 </>;
}

export function ProfileSkillsLoop(){
 const root=useRef(null);const {playing}=useProfileActivity(root);
 return <div ref={root} className="capabilities profile-skills-loop reveal" data-playing={playing?'true':'false'} aria-label="Capabilities"><div className="profile-skills-track">{[0,1].map(copy=><div className="profile-skills-group" key={copy} aria-hidden={copy===1?'true':undefined}>{skills.map(skill=><span key={skill}>{skill}</span>)}</div>)}</div></div>;
}
