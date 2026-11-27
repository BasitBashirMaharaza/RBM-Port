import {useEffect,useRef,useState} from 'react';
import {isLearningFramed} from './learningEntranceVisibility.js';
import './learning-computer-intro.css';

export default function LearningComputerIntro({sectionRef,onComplete}){
 const host=useRef(null),finishRef=useRef(onComplete),[done,setDone]=useState(false);
 finishRef.current=onComplete;
 useEffect(()=>{
  let dispose,dead=false,started=false,settle=0,watchdog=0,frame=0;
  const finish=()=>{if(dead)return;setDone(true);finishRef.current();dispose?.();};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches){finish();return;}
  const begin=async()=>{
   settle=0;if(dead||started||!isLearningFramed(sectionRef.current))return;
   started=true;
   // Only time out the module import; leaving the section must pause, not skip, the intro.
   watchdog=setTimeout(finish,12000);
   try{const {createComputerEntrance}=await import('./learningComputerScene.js');clearTimeout(watchdog);if(!dead&&host.current)dispose=createComputerEntrance(host.current,finish);}
   catch(error){console.warn('Education computer opening could not start',error);finish();}
  };
  const check=()=>{
   frame=0;if(started)return;
   if(!isLearningFramed(sectionRef.current)){clearTimeout(settle);settle=0;return;}
   if(!settle)settle=setTimeout(begin,280);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(check);};
  const observer=new IntersectionObserver(schedule,{threshold:[0,.25,.5,.75,1]});observer.observe(sectionRef.current);
  const welcomeObserver=new MutationObserver(schedule);welcomeObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);schedule();
  return()=>{dead=true;observer.disconnect();welcomeObserver.disconnect();clearTimeout(watchdog);clearTimeout(settle);cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);dispose?.();};
 },[sectionRef]);
 if(done)return null;
 return <div className="lg-computer-intro"><div className="lg-computer-canvas" ref={host} aria-hidden="true"/><span className="sr-only" role="status">Opening education and capabilities on a retro computer.</span><button type="button" className="lg-computer-skip" onClick={()=>{setDone(true);finishRef.current();}}>Skip intro ↗</button></div>;
}
