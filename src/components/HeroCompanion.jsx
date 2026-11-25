import RobotDisplayText from './RobotDisplayText.jsx';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import IntroPoster from '../IntroPoster.jsx';
import useHeroRobotMotion from './useHeroRobotMotion.js';
import RobotQuoteDialog from './RobotQuoteDialog.jsx';
import {createHeroRobotSound} from './heroRobotSound.js';
import {nextRobotThought} from './robotThoughts.js';
import './hero-companion.css';
import './robot-conversation.css';

export default function HeroCompanion(){
 const enteredAt=useRef(performance.now()),root=useRef(null),canvas=useRef(null),engine=useRef(null),audio=useRef(null),interaction=useRef(null),greeted=useRef(false),previousQuote=useRef(null);
 const [ready,setReady]=useState(false),[conversation,setConversation]=useState(''),[videoRequest,setVideoRequest]=useState(0),[quote,setQuote]=useState(null);
 useEffect(()=>{
  let alive=true,scene,timer;
  const titleWindow=new Promise(resolve=>{timer=setTimeout(resolve,1100);});
  Promise.all([import('./heroRobotScene.js'),titleWindow]).then(async([{createHeroRobot}])=>{
   if(!alive)return;
   scene=await createHeroRobot(canvas.current);if(!alive){scene.dispose();return;}
   engine.current=scene;setReady(true);
  }).catch(()=>{if(alive)root.current.dataset.failed='true';});
  return()=>{alive=false;clearTimeout(timer);engine.current=null;scene?.dispose();};
 },[]);
 useEffect(()=>{
  const sound=createHeroRobotSound();audio.current=sound;
  const unlock=()=>sound.unlock();document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
  return()=>{audio.current=null;document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);sound.dispose();};
 },[]);
 useHeroRobotMotion({ready,root,engine,audio,interaction,enteredAt});
 useLayoutEffect(()=>{
  if(!conversation)return;const align=()=>{const rect=root.current.getBoundingClientRect(),width=innerWidth<=600?208:228,left=Math.max(12-rect.left,Math.min((72-width)/2,innerWidth-12-width-rect.left));root.current.style.setProperty('--robot-chat-left',left+'px');root.current.style.setProperty('--robot-chat-tail',Math.max(12,Math.min(width-20,36-left))+'px');};align();window.addEventListener('resize',align);return()=>window.removeEventListener('resize',align);
 },[conversation]);
 const talk=()=>{if(quote)return;const sound=audio.current,activated=sound?.unlock();if(activated?.then)activated.then(()=>sound?.play('click'));else sound?.play('click');if(!greeted.current){greeted.current=true;setConversation('hello');}else setConversation('options');};
 const dismiss=()=>{setConversation('');root.current?.querySelector('.intro-poster')?.focus({preventScroll:true});};
 useEffect(()=>{
  if(!conversation||quote)return;
  const outside=event=>{if(!root.current?.contains(event.target))setConversation('');};
  const escape=event=>{if(event.key==='Escape')setConversation('');};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[conversation,quote]);
 const project=useCallback((value,surface)=>engine.current?.setProjection(value,surface),[]);
 const projectionFrame=useCallback(()=>engine.current?.getProjectionFrame(),[]);
 const showQuote=()=>setConversation('projecting');
 useEffect(()=>{
  if(conversation!=='projecting'||quote)return;
  let frame=0,alive=true;
  const present=()=>{if(!alive)return;if(interaction.current?.getState().phase!=='resting'){frame=requestAnimationFrame(present);return;}
   const rect=canvas.current.getBoundingClientRect(),text=nextRobotThought(previousQuote.current);previousQuote.current=text;
   setQuote({text,origin:engine.current?.getEyeOrigin()||{x:rect.left+rect.width*.5,y:rect.top+rect.height*.46}});
  };frame=requestAnimationFrame(present);
  return()=>{alive=false;cancelAnimationFrame(frame);};
 },[conversation,quote]);
 const bubble=conversation&&conversation!=='projecting'?<span className="hero-robot-chat" role={conversation==='hello'?'status':'group'} aria-label={conversation==='options'?'Choose a little adventure':undefined}>
  <button className="hero-chat-dismiss" type="button" aria-label="Dismiss robot chat" onClick={dismiss}>×</button>
  <span className="hero-chat-identity"><svg viewBox="0 0 36 28" fill="none" aria-hidden="true"><path d="M8 5V2h20v3M4 11H2v9h2m28-9h2v9h-2M9 5h18a5 5 0 0 1 5 5v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a5 5 0 0 1 5-5Z"/><rect x="9" y="11" width="18" height="9" rx="4"/><path d="M14 14v3m8-3v3"/></svg><small>YOUR LITTLE COMPANION</small></span>
  <span className="hero-chat-readout">
  {conversation==='hello'?<><strong><RobotDisplayText>Hello, curious human.</RobotDisplayText></strong><span>Friend detected. Worry level: zero.<br/>Tap me again. Let’s explore something.</span></>:<><strong><RobotDisplayText>Curiosity, activated.</RobotDisplayText></strong><span>A story to watch, or a thought to take along?</span><div className="hero-chat-choices"><button type="button" onClick={()=>{setConversation('');setVideoRequest(value=>value+1);}}>Watch intro <i aria-hidden="true">↗</i></button><button type="button" onClick={showQuote}>A little quote <i aria-hidden="true">✧</i></button></div></>}
  </span>
 </span>:null;
 return <div ref={root} className="hero-companion" data-ready={ready} data-phase="waiting" data-mood="curious" data-conversation={conversation}>
  <IntroPoster heroMode onHeroClick={talk} heroBubble={bubble} videoRequest={videoRequest} heroExpanded={Boolean(conversation)} character={<canvas ref={canvas} className="hero-robot-canvas" aria-hidden="true"/>}/>
  {quote&&<RobotQuoteDialog quote={quote.text} origin={quote.origin} onProjection={project} getProjectionFrame={projectionFrame} onClose={()=>{setQuote(null);setConversation('options');requestAnimationFrame(()=>root.current?.querySelector('.intro-poster')?.focus({preventScroll:true}));}}/>}
 </div>;
}
