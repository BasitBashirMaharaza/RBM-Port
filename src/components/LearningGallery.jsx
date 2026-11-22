import RetroLearningFrame from './RetroLearningFrame.jsx';
import LearningAtmosphere from './LearningAtmosphere.jsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { educationRecords } from './learningRecords.js';
import './learning-gallery.css';
import {unlockLearningSound,learningSlideSound,stopLearningSound,disposeLearningSound} from './learningSound.js';
import LearningComputerIntro from './LearningComputerIntro.jsx';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function LearningDiagram({index}){
 return <svg className={`lg-diagram lg-diagram-${index}`} viewBox="0 0 440 160" fill="none" aria-hidden="true">
  <path className="lg-diagram-grid" d="M0 40H440M0 80H440M0 120H440M55 0V160M165 0V160M275 0V160M385 0V160"/>
  {index===0?<><path d="m85 36 135 44L85 124m135-44 135-44M220 80l135 44M85 36l270 88M85 124l270-88"/>{[[85,36],[85,124],[220,80],[355,36],[355,124]].map(([x,y])=><circle key={x+','+y} cx={x} cy={y} r="10"/>)}</>:index===1?<><path d="M58 118h53V80h53V56h53V96h53V37h53v81h58M58 136h323"/><path className="lg-diagram-signal" d="m55 98 60-44 56 23 57-44 55 31 49-37 52 10"/></>:index===2?<><path d="M48 82h96l24-39 32 76 32-55 20 18h140"/><path d="M204 28h32m-16-16v32"/></>:<><path d="M53 120c90 0 101-78 171-78s77 64 165-13M53 143h337"/><path className="lg-diagram-signal" d="M53 119c90 0 101-78 171-78s77 64 165-13"/>{[[96,110],[223,42],[350,43]].map(([x,y])=><circle key={x} cx={x} cy={y} r="6"/>)}</>}
 </svg>;
}
function DegreeCard({record}){
 return <div className="lg-card-body lg-degree-body">
  <div className="lg-window-bar"><span className="lg-window-dots"/><span>education / gcet-kashmir</span><span>01</span></div>
  <div className="lg-degree-content"><div className="lg-degree-brand"><img src={record.logo} alt=""/><div><strong>{record.institution}</strong><span>{record.location}</span></div><time>{record.period}</time></div>
   <span className="lg-small-label">{record.label}</span><h3>{record.title}</h3><h4>{record.subtitle}</h4><p>{record.description}</p><div className="lg-degree-topics">{record.tags.map(tag=><span key={tag}><span className="lg-tag-label">{tag}</span></span>)}</div>
   <svg className="lg-degree-circuit" viewBox="0 0 500 180" fill="none" aria-hidden="true"><path d="M0 135h95l54-54h104l42 42h74l37-37h94M0 44h145l40 40h159l54-54h102"/><circle cx="95" cy="135" r="5"/><circle cx="344" cy="84" r="5"/></svg>
  </div><span className="lg-card-gloss" aria-hidden="true"/>
 </div>;
}
function CredentialCard({record,triggerRef,onOpen,active,index}){
 const label=record.id==='michigan'?'University of Michigan Applied Machine Learning':'Google Fundamentals of Digital Marketing';
 return <div className="lg-card-body lg-credential-body"><div className="lg-window-bar"><span className="lg-window-dots"/><span>education / {record.id}</span><span>0{index}</span></div>
  <div className="lg-credential-content"><button className="lg-certificate-trigger" ref={triggerRef} onClick={onOpen} tabIndex={active?0:-1} aria-haspopup="dialog" aria-label={`View ${label} certificate`}><span className="lg-credential-brand"><img src={record.logo} alt={`${record.institution} logo`}/><span>{record.institution}</span><time>{record.period}</time></span><span className="lg-certificate-image"><img src={record.certificate} alt="" loading="lazy" decoding="async"/></span><span className="lg-view-certificate">View certificate <span>↗</span></span></button>
   <h3>{record.title}</h3><p>{record.description}</p>{record.credential&&<small>{record.credential}</small>}
  </div><span className="lg-card-gloss" aria-hidden="true"/>
 </div>;
}
function SkillCard({group,index}){
 return <div className={`lg-card-body lg-skill-body lg-skill-${index}`}><div className="lg-window-bar"><span className="lg-window-dots"/><span>capabilities / {group[0].toLowerCase()}</span><span>0{index+4}</span></div><div className="lg-skill-content"><span className="lg-small-label">Working knowledge</span><h3>{group[0]}</h3><LearningDiagram index={index}/><ul>{group.slice(1).map((skill,i)=><li key={skill}><span>{String(i+1).padStart(2,'0')}</span><span className="lg-skill-label">{skill}</span></li>)}</ul></div><span className="lg-card-gloss" aria-hidden="true"/></div>;
}
export default function LearningGallery({skillGroups,michiganLogoRef,googleLogoRef,onMichiganOpen,onGoogleOpen}){
 const root=useRef(null),stage=useRef(null),cards=useRef([]),range=useRef(null),drag=useRef(null);
 const engine=useRef({position:0,target:0,velocity:0,wake:null,paint:null,spacing:680,lastIndex:0,suppressClick:false,wheelTimer:0,clickTimer:0});
 const [entranceDone,setEntranceDone]=useState(false);
 const [active,setActive]=useState(0),[screenReady,setScreenReady]=useState(0),[hoveredFolder,setHoveredFolder]=useState(null);
 const items=useMemo(()=>[{title:'Formal learning, applied.',category:'Overview'},...educationRecords.map(record=>({title:record.title,category:record.institution})),...skillGroups.map(group=>({title:group[0],category:'Capabilities'}))],[skillGroups]);
 const choose=(value,direct=false)=>{const e=engine.current;clearTimeout(e.wheelTimer);e.target=clamp(value,0,items.length-1);if(!direct){e.lastIndex=-1;setScreenReady(-1);}setActive(Math.round(e.target));if(!direct&&e.velocity*(e.target-e.position)<0)e.velocity*=.25;const focused=document.activeElement;if(cards.current.some((card,i)=>i!==Math.round(e.target)&&card?.contains(focused)))range.current?.focus({preventScroll:true});if(direct){e.position=e.target;e.velocity=0;e.paint?.();}e.wake?.();};
 useLayoutEffect(()=>{
  const element=stage.current,e=engine.current,preference=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last=0,visible=false,disposed=false;
  const paint=()=>{
   cards.current.forEach((card,i)=>{if(!card)return;const relative=i-e.position,far=Math.abs(relative);card.style.transform=`translate3d(calc(-50% + ${relative*e.spacing}px),-50%,${-Math.min(far,3)*90}px) rotateY(${clamp(-relative*27,-38,38)}deg)`;card.style.opacity=far>2.3?'0':'1';card.style.visibility=far>2.3?'hidden':'visible';card.style.filter='none';card.style.willChange=far<1.8?'transform':'auto';card.style.zIndex=String(20-Math.round(far*3));});
   if(range.current&&!e.sliderDragging)range.current.value=String(e.position);
   const nearest=clamp(Math.round(e.target),0,items.length-1);if(Math.abs(e.position-e.target)<.012&&Math.abs(e.velocity)<.06&&nearest!==e.lastIndex){e.lastIndex=nearest;setScreenReady(nearest);}
  };
  const tick=now=>{frame=0;if(disposed||!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.12):1/60;last=now;
   if(preference.matches){e.position=e.target;e.velocity=0;}else{const offset=e.position-e.target,rate=22,decay=Math.exp(-rate*dt),combined=e.velocity+rate*offset;e.position=e.target+(offset+combined*dt)*decay;e.velocity=(e.velocity-rate*combined*dt)*decay;if(Math.abs(e.target-e.position)<.0003&&Math.abs(e.velocity)<.003){e.position=e.target;e.velocity=0;}}
   learningSlideSound(e.position,e.velocity,items.length-1);paint();if(e.position!==e.target||e.velocity)frame=requestAnimationFrame(tick);else last=0;
  };
  const wake=()=>{if(!frame&&!disposed&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}};e.wake=wake;e.paint=paint;
  const wheel=event=>{
   if(event.ctrlKey)return;unlockLearningSound();const rect=element.getBoundingClientRect();if(rect.top>innerHeight*.28||rect.bottom<innerHeight*.63)return;
   const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(!delta)return;
   const next=clamp(e.target+delta*.0015,0,items.length-1);if(next===e.target)return;
   event.preventDefault();e.target=next;setActive(Math.round(next));wake();clearTimeout(e.wheelTimer);e.wheelTimer=setTimeout(()=>{e.target=Math.round(e.target);setActive(e.target);wake();},130);
  };
  const sync=()=>{if(document.hidden)stopLearningSound();cancelAnimationFrame(frame);frame=0;last=0;wake();};
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;root.current?.toggleAttribute('data-in-view',visible);sync();},{rootMargin:'100px'});io.observe(element);
  const measure=()=>{e.spacing=(cards.current[1]?.offsetWidth||560)+(innerWidth<700?58:130);paint();wake();};const resize=new ResizeObserver(measure);resize.observe(element);measure();element.addEventListener('wheel',wheel,{passive:false});document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);paint();
  return()=>{disposed=true;stopLearningSound();cancelAnimationFrame(frame);clearTimeout(e.wheelTimer);clearTimeout(e.clickTimer);io.disconnect();resize.disconnect();element.removeEventListener('wheel',wheel);document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync);e.wake=e.paint=null;};
 },[items.length]);

 useEffect(()=>{
  // Unlock only on real user input; an automatic computer entrance never forces autoplay.
  const unlock=()=>unlockLearningSound();
  document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
  return()=>{document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);disposeLearningSound();};
 },[]);
 const start=event=>{unlockLearningSound();if(event.button!==0||event.target.closest('input'))return;drag.current={x:event.clientX,y:event.clientY,position:engine.current.position,horizontal:false};};
 const move=event=>{const d=drag.current;if(!d)return;const dx=event.clientX-d.x,dy=event.clientY-d.y;if(!d.horizontal&&Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){drag.current=null;return;}if(!d.horizontal&&Math.abs(dx)>8){d.horizontal=true;event.currentTarget.setPointerCapture(event.pointerId);}if(d.horizontal){const next=d.position-dx/engine.current.spacing;learningSlideSound(next,(next-engine.current.position)*30,items.length-1);choose(next,true);}};
 const end=event=>{const d=drag.current;drag.current=null;if(!d?.horizontal)return;engine.current.suppressClick=true;clearTimeout(engine.current.clickTimer);engine.current.clickTimer=setTimeout(()=>engine.current.suppressClick=false,0);choose(Math.round(engine.current.target));if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);};
 const keys=event=>{unlockLearningSound();let next;if(event.key==='ArrowRight')next=active+1;else if(event.key==='ArrowLeft')next=active-1;else if(event.key==='Home')next=0;else if(event.key==='End')next=items.length-1;else return;event.preventDefault();event.stopPropagation();choose(next);};
 return <section id="education" onPointerDownCapture={unlockLearningSound} onKeyDownCapture={unlockLearningSound} ref={root} className="learning-gallery-section" data-entrance={entranceDone?'done':'booting'} aria-labelledby="learning-gallery-title">
  {!entranceDone&&<LearningComputerIntro sectionRef={root} onComplete={()=>setEntranceDone(true)}/>}
  <h2 id="learning-gallery-title" className="sr-only">Education & capabilities</h2><span id="toolkit" className="lg-deep-link" aria-hidden="true"/>
  <div className="lg-topline"><span>~/education & capabilities</span><span>3 achievements · 4 areas of practice</span></div>
  <div ref={stage} inert={!entranceDone} className="lg-stage" tabIndex={0} role="region" aria-label="Education and capabilities gallery. Drag, scroll, or use arrow keys to browse." onKeyDown={keys} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onDragStart={event=>event.preventDefault()} onClickCapture={event=>{if(engine.current.suppressClick){event.preventDefault();event.stopPropagation();}}}>
   <LearningAtmosphere/>
   <div className="lg-camera">
    <div className="lg-card lg-intro" ref={el=>cards.current[0]=el} aria-hidden={active!==0}>
     <RetroLearningFrame active={active===0&&screenReady===0} label="Basit Bashir" kind="overview"><div className="lg-card-body lg-overview-screen">
     <div className="lg-intro-identity"><img src="/portfolio_photo.webp" alt="Basit Bashir"/><div><h3>Basit Bashir</h3><p>Computer Science & Engineering</p></div></div>
     <p className="lg-intro-description">Formal learning, <span>applied.</span><br/>Capabilities over <span>percentages.</span></p>
     <div className="lg-directory"><span className="lg-directory-path">~/education</span>{educationRecords.map((record,i)=><div className="lg-directory-row" key={record.id} onPointerEnter={()=>setHoveredFolder(record.id)} onPointerLeave={()=>setHoveredFolder(null)}><button tabIndex={active===0?0:-1} onFocus={()=>setHoveredFolder(record.id)} onBlur={()=>setHoveredFolder(null)} onClick={()=>choose(i+1)}><span aria-hidden="true">{i===2?'└──':'├──'}</span> {record.institution.toLowerCase()}/ <span>+</span></button>{hoveredFolder===record.id&&<span className="lg-folder-detail">{record.period} · {record.title}</span>}</div>)}<span className="lg-directory-path lg-directory-skills">~/capabilities</span>{skillGroups.map(([title],i)=><div className="lg-directory-row" key={title}><button tabIndex={active===0?0:-1} onClick={()=>choose(i+4)}><span aria-hidden="true">{i===3?'└──':'├──'}</span> {title.toLowerCase()}/ <span>↗</span></button></div>)}</div>
     </div></RetroLearningFrame>
    </div>
    {educationRecords.map((record,i)=><article className="lg-card" key={record.id} ref={el=>cards.current[i+1]=el} aria-hidden={active!==i+1} onClick={()=>{if(active!==i+1)choose(i+1);}}>
     <RetroLearningFrame active={active===i+1&&screenReady===i+1} label={record.institution} logo={record.logo}>{i===0?<DegreeCard record={record}/>:<CredentialCard record={record} index={i+1} active={active===i+1} triggerRef={i===1?michiganLogoRef:googleLogoRef} onOpen={()=>active===i+1?(i===1?onMichiganOpen():onGoogleOpen()):choose(i+1)}/>}</RetroLearningFrame><div className="lg-card-caption"><h3>{record.title}</h3><span>{record.institution}</span></div>
    </article>)}
    {skillGroups.map((group,i)=><article className="lg-card" key={group[0]} ref={el=>cards.current[i+4]=el} aria-hidden={active!==i+4} onClick={()=>{if(active!==i+4)choose(i+4);}}><RetroLearningFrame active={active===i+4&&screenReady===i+4} label={group[0]} logo={i===2?'/logos/pharmacy.svg':undefined} kind={i}><SkillCard group={group} index={i}/></RetroLearningFrame><div className="lg-card-caption"><h3>{group[0]}</h3><span>Capabilities</span></div></article>)}
   </div>
  </div>
  <div className="lg-navigation" inert={!entranceDone}><div className="lg-slider-well"><input ref={range} type="range" min="0" max={items.length-1} step="0.001" defaultValue="0" data-sound="silent" aria-label="Browse education and capabilities" aria-valuetext={`${String(active).padStart(2,'0')} ${items[active].title}`} onPointerDown={()=>{engine.current.sliderDragging=true;engine.current.sliderValue=engine.current.target;unlockLearningSound();}} onPointerUp={()=>{engine.current.sliderDragging=false;choose(Math.round(engine.current.sliderValue??engine.current.position));}} onPointerCancel={()=>{engine.current.sliderDragging=false;choose(Math.round(engine.current.position));}} onBlur={()=>{if(engine.current.sliderDragging){engine.current.sliderDragging=false;choose(Math.round(engine.current.position));}}} onInput={event=>{const next=Number(event.currentTarget.value);engine.current.sliderValue=next;learningSlideSound(next,(next-engine.current.position)*30,items.length-1);choose(next,true);}} onKeyDown={keys}/></div><div className="lg-slider-stops">{items.map((item,i)=><button type="button" key={item.title} data-sound="silent" aria-label={`Show ${item.title}`} aria-current={active===i?'true':undefined} onClick={()=>choose(i)}>{String(i).padStart(2,'0')}</button>)}</div><p className="lg-navigation-hint">Drag to explore <span>·</span> scroll through learning & practice</p></div>
 </section>;
}





