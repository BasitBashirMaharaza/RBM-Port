import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArchiveFace, ArchiveMark } from './ArchiveProjectFace.jsx';
import { archiveColors, archiveLightColors, archiveImages } from './workArchiveMarks.js';
import { projectCaseNotes } from './projectCaseNotes.js';
import './project-case-study.css';

const FACE_WIDTH=1200,FACE_HEIGHT=840;
const flows=[
 ['Symptom input','Clarifying dialogue','Urgency stratification','Care discovery'],
 ['Source documents','Semantic chunks','Context retrieval','Grounded answers'],
 ['Data cleaning','Feature engineering','Model evaluation','Visual analysis'],
 ['Document chunks','Vector embeddings','Cosine similarity','Semantic results'],
 ['Search intent','Crawl optimization','Behavior analysis','Visibility insights'],
];

// Preserve the physical file's proportions throughout its screen-space flight.
function projection(q){
 if(!q)return 'none';
 const [p0,p1,p2,p3]=q,dx1=p1.x-p2.x,dx2=p3.x-p2.x,dy1=p1.y-p2.y,dy2=p3.y-p2.y;
 const sx=p0.x-p1.x+p2.x-p3.x,sy=p0.y-p1.y+p2.y-p3.y,den=dx1*dy2-dx2*dy1;
 if(Math.abs(den)<.001)return 'none';
 const g=(sx*dy2-dx2*sy)/den,h=(dx1*sy-sx*dy1)/den;
 const a=p1.x-p0.x+g*p1.x,b=p1.y-p0.y+g*p1.y,c=p3.x-p0.x+h*p3.x,d=p3.y-p0.y+h*p3.y;
 return `matrix3d(${a/FACE_WIDTH},${b/FACE_WIDTH},0,${g/FACE_WIDTH},${c/FACE_HEIGHT},${d/FACE_HEIGHT},0,${h/FACE_HEIGHT},0,0,1,0,${p0.x},${p0.y},0,1)`;
}
function centeredFace(){
 const width=Math.min(innerWidth-40,1060,(innerHeight-56)*FACE_WIDTH/FACE_HEIGHT),height=width*FACE_HEIGHT/FACE_WIDTH;
 const x=(innerWidth-width)/2,y=(innerHeight-height)/2;
 return projection([{x,y},{x:x+width,y},{x:x+width,y:y+height},{x,y:y+height}]);
}
export default function ProjectArchiveDialog({projects,initial,scene,githubUrl,onClosed,onSound}){
 const [index,setIndex]=useState(initial),[phase,setPhase]=useState('opening'),[tab,setTab]=useState('Overview'),[feature,setFeature]=useState(0);
 const dialog=useRef(null),flight=useRef(null),detail=useRef(null),backdrop=useRef(null),current=useRef(initial);
 const ambient=useRef(null),reflection=useRef(null);
 const closing=useRef(false),alive=useRef(true),animations=useRef([]),opener=useRef(document.activeElement),closeRef=useRef(null);
 const animate=(node,frames,options)=>{const animation=node.animate(frames,{fill:'both',...options});animations.current.push(animation);return animation;};
 useEffect(()=>{
  alive.current=true;
  const modal=dialog.current,body=document.body,oldOverflow=body.style.overflow,oldPadding=body.style.paddingRight;
  const gap=CSS.supports('scrollbar-gutter: stable')?0:innerWidth-document.documentElement.clientWidth;body.style.overflow='hidden';if(gap)body.style.paddingRight=`${gap}px`;
  modal.showModal();scene.current?.hideCard(initial,true);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduced?160:960,target=centeredFace();
  const from=projection(scene.current?.getCorners(initial));
  animate(backdrop.current,[{opacity:0},{opacity:1}],{duration,easing:'ease-out'});
  animate(detail.current,[{opacity:0},{opacity:1}],{duration:reduced?160:300,delay:reduced?0:660,easing:'ease-out'});
  const flightAnimation=animate(flight.current,reduced?[{opacity:0},{opacity:0}]:[{transform:from},{transform:target}],{duration,easing:'cubic-bezier(.23,1,.32,1)'});
  if(!reduced)animate(flight.current,[{opacity:1,offset:0},{opacity:1,offset:.6875},{opacity:0,offset:1}],{duration,easing:'linear'});
  flightAnimation.finished.then(()=>{
   if(!alive.current||closing.current)return;
   flight.current.style.transform=target;flight.current.style.opacity='0';detail.current.style.opacity='1';backdrop.current.style.opacity='1';
   animations.current.forEach(a=>a.cancel());animations.current=[];
   setPhase('open');requestAnimationFrame(()=>detail.current?.querySelector('button')?.focus({preventScroll:true}));
  }).catch(()=>{});
  const cancel=e=>{e.preventDefault();closeRef.current?.();};
  const resize=()=>{if(!closing.current)flight.current.style.transform=centeredFace();};
  modal.addEventListener('cancel',cancel);window.addEventListener('resize',resize);
  return ()=>{alive.current=false;animations.current.forEach(a=>a.cancel());modal.removeEventListener('cancel',cancel);window.removeEventListener('resize',resize);modal.close();body.style.overflow=oldOverflow;body.style.paddingRight=oldPadding;scene.current?.hideCard(current.current,false);scene.current?.setOpening(false);opener.current?.focus?.({preventScroll:true});};
 },[]);
 // Pointer light is an independent composited layer; content never follows the cursor.
 useEffect(()=>{
  if(phase!=='open')return;
  const panel=detail.current,light=reflection.current,background=ambient.current;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  let frame=0,x=0,y=0;
  const reset=()=>{cancelAnimationFrame(frame);frame=0;background.dataset.active='false';light.style.transform='translate3d(0,0,0)';};
  const move=event=>{
   if(reduced.matches||!fine.matches||event.pointerType!=='mouse')return;
   const rect=panel.getBoundingClientRect();x=event.clientX-rect.left-rect.width/2;y=event.clientY-rect.top-rect.height/2;
   if(!frame)frame=requestAnimationFrame(()=>{frame=0;light.style.transform=`translate3d(${x}px,${y}px,0)`;background.dataset.active='true';});
  };
  const visibility=()=>{background.dataset.paused=String(document.hidden);dialog.current.dataset.ambientPaused=String(document.hidden);if(document.hidden)reset();};
  const preference=()=>{if(reduced.matches||!fine.matches)reset();};
  panel.addEventListener('pointermove',move,{passive:true});panel.addEventListener('pointerleave',reset);
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preference);fine.addEventListener('change',preference);visibility();
  return()=>{reset();panel.removeEventListener('pointermove',move);panel.removeEventListener('pointerleave',reset);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);fine.removeEventListener('change',preference);};
 },[phase]);
 const close=async()=>{
  if(closing.current)return;closing.current=true;onSound?.('return',current.current);
  const visibleFlight=getComputedStyle(flight.current),from=visibleFlight.transform,flightOpacity=Number(visibleFlight.opacity),detailOpacity=getComputedStyle(detail.current).opacity,backdropOpacity=getComputedStyle(backdrop.current).opacity;
  animations.current.forEach(a=>a.cancel());animations.current=[];setPhase('closing');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduced?160:820,to=projection(scene.current?.getCorners(current.current));
  animate(detail.current,[{opacity:detailOpacity},{opacity:0}],{duration:reduced?100:160,easing:'ease-out'});
  animate(backdrop.current,[{opacity:backdropOpacity},{opacity:0}],{duration,delay:reduced?0:80,easing:'ease-out'});
  const returning=animate(flight.current,reduced?[{opacity:0},{opacity:0}]:[{transform:from},{transform:to}],{duration,easing:'cubic-bezier(.77,0,.175,1)'});
  if(!reduced)animate(flight.current,[{opacity:flightOpacity},{opacity:1}],{duration:140,easing:'ease-out'});
  await returning.finished.catch(()=>{});if(alive.current)onClosed();
 };
 closeRef.current=close;
 const change=next=>{
  if(phase!=='open'||closing.current)return;onSound?.('click',next);
  scene.current?.hideCard(current.current,false);scene.current?.hideCard(next,true);current.current=next;setIndex(next);setTab('Overview');setFeature(0);
  detail.current.scrollTo({top:0,behavior:'instant'});
 };
 const project=projects[index];
 const notes=projectCaseNotes[index];
 return createPortal(<dialog ref={dialog} className={`wa-dialog wa-${phase}`} aria-labelledby="wa-project-title" style={{'--wa-accent':archiveColors[index],'--wa-light-accent':archiveLightColors[index]}}>
  <div ref={backdrop} className="wa-dialog-backdrop" onClick={close}/>
  <div ref={flight} className="wa-flight" aria-hidden="true"><ArchiveFace project={project} index={index}/></div>
  <div ref={detail} className="wa-detail" inert={phase!=='open'?true:undefined}>
   <div ref={ambient} className="wa-case-ambient" aria-hidden="true"><i className="wa-ambient-wash"/><i className="wa-ambient-trace"/><i ref={reflection} className="wa-ambient-reflection"/></div>
   <div className="wa-detail-top"><span className="wa-monogram">Basit’s Project Notes</span><span className="wa-detail-position">{project.number} — {String(projects.length).padStart(2,'0')}</span><button data-sound="silent" type="button" onClick={close} aria-label="Close project and return to archive"><span>Back to archive</span><span className="wa-close-icon" aria-hidden="true">×</span></button></div>
   <article className="wa-case wa-compact-case" key={index}>
    <header className="wa-compact-heading" data-long-title={project.title.length>28}><div><span className="wa-case-label">{project.eyebrow}</span><h2 id="wa-project-title">{project.title}</h2></div><ArchiveMark index={index}/></header>
    <div className="wa-compact-body">
     <div className="wa-live-visual" aria-hidden="true"><img src={`/project-images/${archiveImages[project.visual]}.svg`} alt=""/><span className="wa-visual-caption"><i/> {notes.output}</span></div>
     <div className="wa-inspector">
      <div className="wa-inspector-tabs" role="tablist" aria-label="Project details">{['Overview','System','Details'].map(label=><button key={label} id={`wa-tab-${label}`} type="button" role="tab" aria-selected={tab===label} aria-controls="wa-inspector-panel" tabIndex={tab===label?0:-1} onClick={()=>setTab(label)} onKeyDown={event=>{const options=['Overview','System','Details'];let next;if(event.key==='ArrowRight')next=options[(options.indexOf(label)+1)%3];if(event.key==='ArrowLeft')next=options[(options.indexOf(label)+2)%3];if(event.key==='Home')next=options[0];if(event.key==='End')next=options[2];if(next){event.preventDefault();setTab(next);event.currentTarget.parentElement.querySelector(`#wa-tab-${next}`)?.focus();}}}>{label}</button>)}</div>
      <section id="wa-inspector-panel" className="wa-inspector-panel" role="tabpanel" aria-labelledby={`wa-tab-${tab}`} tabIndex={0} key={tab}>
       {tab==='Overview'?<><span className="wa-case-label">THE IDEA</span><p className="wa-inspector-lead">{project.description}</p><p className="wa-inspector-copy wa-purpose">{notes.purpose}</p><div className="wa-case-tags" aria-label="Technologies">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div><a className="wa-github-link" href={githubUrl} target="_blank" rel="noreferrer">Browse my GitHub <span>↗</span></a></>:tab==='System'?<><span className="wa-case-label">HOW IT CONNECTS</span><ol className="wa-compact-flow">{flows[index].map((step,i)=><li key={step} style={{'--step':i}}><span>0{i+1}</span><strong>{step}</strong><i aria-hidden="true"/></li>)}</ol><p className="wa-inspector-copy">{project.detail}</p></>:<><div className="wa-feature-picker" aria-label="Capability details">{notes.features.map(([title],i)=><button type="button" key={title} aria-label={`Read about ${title}`} aria-pressed={feature===i} onClick={()=>setFeature(i)}>0{i+1}</button>)}</div><div className="wa-detail-features">{notes.features.map(([title,description],i)=><div key={title} className={feature===i?'is-selected':''}><span>0{i+1}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div><p className="wa-compact-note">{notes.consideration}</p></>}
      </section>
     </div>
    </div>
    <nav className="wa-case-nav" aria-label="Project navigation"><button data-sound="silent" onClick={()=>change((index+projects.length-1)%projects.length)}>← Previous project</button><span>{project.number} / {String(projects.length).padStart(2,'0')}</span><button data-sound="silent" onClick={()=>change((index+1)%projects.length)}>Next project →</button></nav>
   </article>
  </div>
 </dialog>,document.body);
}
