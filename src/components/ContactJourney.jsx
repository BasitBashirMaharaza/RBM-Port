import {createContactPerchSound} from './contactPerchSound.js';
import ContactBirdMark from './ContactBirdMark.jsx';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import './contact-journey.css';

export const CONTACT_JOURNEY='portfolio:contact-flight';
const ease=t=>t*t*t*(t*(t*6-15)+10);
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

export default function ContactJourney({onRevealEmail}){
 const bird=useRef(null),notice=useRef(null),reveal=useRef(onRevealEmail);reveal.current=onRevealEmail;
 const [portalHost]=useState(()=>{const host=document.createElement('div');host.className='contact-bird-host';return host;});
 useLayoutEffect(()=>{document.body.appendChild(portalHost);return()=>portalHost.remove();},[portalHost]);
 useEffect(()=>{
  const node=bird.current,character=node.querySelector('.contact-journey-character'),html=document.documentElement,motion=matchMedia('(prefers-reduced-motion: reduce)'),root=document.getElementById('root'),sound=createContactPerchSound();let current=null;
  const stop=()=>{
   const job=current;if(!job)return;current=null;
   cancelAnimationFrame(job.frame);clearTimeout(job.timer);clearTimeout(job.idleTimer);clearTimeout(job.actionTimer);job.observer?.disconnect();job.modalObserver?.disconnect();job.sizing?.disconnect();job.resolve?.(false);sound.stop();
   html.style.scrollBehavior=job.behavior;delete html.dataset.contactJourney;
   portalHost.classList.remove('is-perched');document.body.appendChild(portalHost);
   node.hidden=true;node.style.opacity='';node.dataset.phase='';delete node.dataset.action;node.tabIndex=-1;node.setAttribute('aria-hidden','true');
   job.button?.classList.remove('contact-journey-arrived');if(notice.current)notice.current.textContent='';
  };
  const tween=(job,duration,draw)=>new Promise(resolve=>{
   let began;job.resolve=resolve;
   const tick=now=>{
    if(current!==job){resolve(false);return;}
    began??=now;const t=Math.min(1,(now-began)/duration);try{draw(ease(t),t);}catch{stop();return;}
    if(t<1)job.frame=requestAnimationFrame(tick);else{job.resolve=null;resolve(true);}
   };job.frame=requestAnimationFrame(tick);
  });
  const position=(x,y,angle=0)=>{
   node.style.transform=`translate3d(${x-14}px,${y-14}px,0) rotate(${angle}deg)`;
  };
  const scrollGoal=element=>clamp(element.getBoundingClientRect().top+scrollY-72,0,Math.max(0,document.documentElement.scrollHeight-innerHeight));
  const gesture=(action,audible=true)=>{
   const job=current;if(job?.phase!=='perched'||node.hidden||motion.matches||performance.now()-(job.lastGesture||0)<1000)return;
   job.lastGesture=performance.now();clearTimeout(job.actionTimer);node.dataset.action=action;
   if(audible)sound.play(action);
   job.actionTimer=setTimeout(()=>{if(current===job)delete node.dataset.action;},1350);
  };
  const scheduleIdle=job=>{
   if(job.idleTimer||motion.matches||node.hidden)return;
   job.idleTimer=setTimeout(()=>{job.idleTimer=0;if(current!==job||node.hidden)return;const actions=['look','stretch','preen','blink'];gesture(actions[Math.floor(Math.random()*actions.length)],Math.random()<.4);scheduleIdle(job);},4500+Math.random()*3500);
  };
  const pausePerch=job=>{cancelAnimationFrame(job.frame);job.frame=0;clearTimeout(job.idleTimer);job.idleTimer=0;clearTimeout(job.actionTimer);delete node.dataset.action;node.hidden=true;sound.stop();};
  const syncPerch=job=>{
   if(current!==job||job.phase!=='perched')return;
   if(!job.visible||document.hidden||root?.inert){pausePerch(job);return;}
   // This is document-attached now: scrolling and hover need no tracking loop.
   node.hidden=false;scheduleIdle(job);
  };
  const perch=(job,getPoint)=>{
   job.phase='perched';job.getPoint=getPoint;job.visible=true;job.frame=0;
   job.dock=job.button.closest('.mailbox-dock')||job.button.parentElement;
   const mount=()=>{const point=getPoint(),box=job.dock.getBoundingClientRect();position(point.x-box.left,point.y-box.top);};
   portalHost.classList.add('is-perched');job.dock.appendChild(portalHost);mount();
   job.sizing=new ResizeObserver(mount);job.sizing.observe(job.button);
   html.style.scrollBehavior=job.behavior;delete html.dataset.contactJourney;
   node.dataset.phase='landed';node.style.opacity='1';node.tabIndex=0;node.removeAttribute('aria-hidden');character.style.transform='';
   job.button.classList.add('contact-journey-arrived');
   notice.current.textContent='The bird has landed on the mailbox. Choose Email me to leave a message.';
   job.observer=new IntersectionObserver(([entry])=>{job.visible=entry.isIntersecting;syncPerch(job);});job.observer.observe(job.button);
   if(root){job.modalObserver=new MutationObserver(()=>syncPerch(job));job.modalObserver.observe(root,{attributes:true,attributeFilter:['inert']});}
   syncPerch(job);gesture('look',true);
  };
  const launch=async()=>{
   stop();sound.unlock();const button=document.querySelector('.contact-email-trigger'),contact=document.getElementById('contact');if(!button||!contact)return;
   const landingPoint=()=>{const perch=button.querySelector('[data-bird-perch]'),r=(perch||button).getBoundingClientRect();return{x:perch?r.left+r.width*.5:r.left+r.width*.3,y:r.top-11};};
   const origin=document.querySelector('[data-contact-flight-target] > svg')?.getBoundingClientRect();
   const job={phase:'flying',frame:0,timer:0,resolve:null,button,behavior:html.style.scrollBehavior,width:innerWidth,reduced:motion.matches};current=job;
   html.style.scrollBehavior='auto';html.dataset.contactJourney='running';
   notice.current.textContent='Following the bird to Contact. Scroll or press Escape to stop.';
   if(job.reduced){
    reveal.current?.();
    await tween(job,40,()=>{});if(current!==job)return;
    window.scrollTo({top:clamp(button.getBoundingClientRect().top+scrollY-innerHeight*.65,0,Math.max(0,html.scrollHeight-innerHeight)),behavior:'instant'});
    button.focus({preventScroll:true});perch(job,landingPoint);return;
   }
   // Reveal the offscreen landing target before the first frame so a slow device
   // cannot reach the last frame before React has committed its visible state.
   reveal.current?.();
   node.hidden=false;node.tabIndex=-1;node.setAttribute('aria-hidden','true');node.dataset.phase='flying';character.style.transform='';
   const originPoint={x:origin?origin.left+origin.width/2:innerWidth*.72,y:origin?origin.top+origin.height/2:80};
   position(originPoint.x,originPoint.y);
   const startScroll=scrollY,rewind=startScroll>innerHeight*.45;
   const duration=clamp(scrollGoal(contact)*.48,6500,9500)+(rewind?900:0);
   let bank=0,lastTime=0;
   // One clock for the entire flight: no section-boundary easing or resting frames.
   // A cubic flight corridor provides continuous tangents; a tapered drift adds banking.
   const flightPoint=(u,destination)=>{
    const v=1-u,envelope=Math.sin(Math.PI*u)**2;
    return {
     x:v*v*v*originPoint.x+3*v*v*u*innerWidth*.82+3*v*u*u*(destination.x-Math.min(150,innerWidth*.2))+u*u*u*destination.x+Math.sin(4*Math.PI*u)*envelope*innerWidth*.14,
     y:v*v*v*originPoint.y+3*v*v*u*innerHeight*.36+3*v*u*u*destination.y+u*u*u*destination.y+Math.sin(2*Math.PI*u)*envelope*innerHeight*.035
    };
   };
   if(!await tween(job,duration,(u,t)=>{
    // Read geometry before scrolling/writing transforms, avoiding forced layout each frame.
    const box=button.getBoundingClientRect(),perch=landingPoint(),maximum=Math.max(0,html.scrollHeight-innerHeight);
    const endScroll=clamp(box.top+scrollY-innerHeight*.72,0,maximum);
    const route=rewind?(t<.12?startScroll*(1-ease(t/.12)):endScroll*ease((t-.12)/.88)):startScroll+(endScroll-startScroll)*u;
    const destination={x:perch.x,y:perch.y+scrollY-endScroll};
    const point=flightPoint(u,destination);
    // A side-view bird yaws through each turn rather than rolling upside down.
    // The path tangent determines facing; gentle pitch and damped bank keep it stable.
    const behind=flightPoint(Math.max(0,u-.0005),destination);
    const ahead=flightPoint(Math.min(1,u+.0005),destination);
    const dx=ahead.x-behind.x,dy=ahead.y-behind.y;
    const facing=dx<0?-1:1;
    const flare=ease(clamp((u-.9)/.1,0,1));
    const pitch=clamp(Math.atan2(dy,Math.abs(dx))*180/Math.PI,-23,23);
    const targetBank=(35+pitch)*facing*(1-flare);
    const elapsed=(t-lastTime)*duration;lastTime=t;
    bank+=(targetBank-bank)*(1-Math.exp(-elapsed/130));
    character.style.transform=`rotateY(${Math.acos(facing)*180/Math.PI}deg)`;
    position(point.x,point.y,bank);
    node.style.opacity=String(Math.min(1,t*20));
    window.scrollTo({top:route,behavior:'instant'});
   }))return;
   node.dataset.phase='landed';character.style.transform='';button.classList.add('contact-journey-arrived');button.focus({preventScroll:true});
   // Focus lifts the button slightly; follow its real edge as it settles.
   if(!await tween(job,450,()=>{const perch=landingPoint();position(perch.x,perch.y);}))return;
   perch(job,landingPoint);
  };
  const start=()=>{launch().catch(stop);};
  const interrupt=()=>{if(current?.phase!=='perched')stop();};
  const key=event=>{if(current?.phase==='perched'){if(event.key==='Escape'&&!root?.inert)stop();return;}if(current&&['Escape','Tab',' ','ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))stop();};
  const visibility=()=>{if(current?.phase==='perched')syncPerch(current);else if(document.hidden)stop();};
  const resize=()=>{if(current?.phase==='perched')syncPerch(current);else if(current&&Math.abs(innerWidth-current.width)>2)stop();};
  const preference=()=>{if(current?.phase==='perched'){current.reduced=motion.matches;pausePerch(current);syncPerch(current);}else if(current&&current.reduced!==motion.matches)stop();};
  const greet=()=>{sound.unlock();gesture('stretch',true);};
  const noticeCursor=event=>{if(event.pointerType==='mouse')gesture('look',true);};
  const soundPreference=new MutationObserver(()=>{if(html.dataset.sound==='off')sound.stop();});soundPreference.observe(html,{attributes:true,attributeFilter:['data-sound']});
  node.addEventListener('click',greet);node.addEventListener('pointerenter',noticeCursor);
  window.addEventListener(CONTACT_JOURNEY,start);window.addEventListener('wheel',interrupt,{passive:true});window.addEventListener('touchstart',interrupt,{passive:true});window.addEventListener('pointerdown',interrupt,{passive:true});window.addEventListener('keydown',key);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',preference);
  return()=>{stop();sound.dispose();soundPreference.disconnect();node.removeEventListener('click',greet);node.removeEventListener('pointerenter',noticeCursor);window.removeEventListener(CONTACT_JOURNEY,start);window.removeEventListener('wheel',interrupt);window.removeEventListener('touchstart',interrupt);window.removeEventListener('pointerdown',interrupt);window.removeEventListener('keydown',key);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',preference);};
 },[portalHost]);
 return createPortal(<><button ref={bird} type="button" className="contact-journey-bird" hidden aria-label="Say hello to the bird" data-sound="silent" tabIndex={-1}>
  <svg viewBox="0 0 24 24" aria-hidden="true"><g className="contact-journey-idle">
   <ContactBirdMark bodyClass="contact-journey-character" wingClass="contact-journey-wing" eyeClass="contact-journey-eye"/>
  </g></svg>
 </button><span ref={notice} className="sr-only" role="status" aria-live="polite"/></>,portalHost);
}
