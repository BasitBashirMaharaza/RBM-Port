import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArchiveFace, ArchiveMark } from './ArchiveProjectFace.jsx';
import { archiveColors, archiveLightColors, archiveImages } from './workArchiveMarks.js';

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
 const [index,setIndex]=useState(initial),[phase,setPhase]=useState('opening');
 const dialog=useRef(null),flight=useRef(null),detail=useRef(null),backdrop=useRef(null),current=useRef(initial);
 const closing=useRef(false),alive=useRef(true),animations=useRef([]),opener=useRef(document.activeElement),closeRef=useRef(null);
 const animate=(node,frames,options)=>{const animation=node.animate(frames,{fill:'both',...options});animations.current.push(animation);return animation;};
 useEffect(()=>{
  alive.current=true;
  const modal=dialog.current,body=document.body,oldOverflow=body.style.overflow,oldPadding=body.style.paddingRight;
  const gap=innerWidth-document.documentElement.clientWidth;body.style.overflow='hidden';if(gap)body.style.paddingRight=`${gap}px`;
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
  scene.current?.hideCard(current.current,false);scene.current?.hideCard(next,true);current.current=next;setIndex(next);
  detail.current.scrollTo({top:0,behavior:'instant'});
 };
 const project=projects[index];
 return createPortal(<dialog ref={dialog} className={`wa-dialog wa-${phase}`} aria-labelledby="wa-project-title" style={{'--wa-accent':archiveColors[index],'--wa-light-accent':archiveLightColors[index]}}>
  <div ref={backdrop} className="wa-dialog-backdrop" onClick={close}/>
  <div ref={flight} className="wa-flight" aria-hidden="true"><ArchiveFace project={project} index={index}/></div>
  <div ref={detail} className="wa-detail" inert={phase!=='open'?true:undefined}>
   <div className="wa-detail-top"><span className="wa-monogram">BB<span> / WORK ARCHIVE</span></span><button data-sound="silent" type="button" onClick={close}>↙ <span>Back to the archive</span></button></div>
   <article className="wa-case" key={index}>
    <div className="wa-case-kicker"><span>SELECTED WORK / {project.number}</span><span>{project.eyebrow}</span></div>
    <div className="wa-case-hero">
     <div className="wa-case-summary"><div className="wa-case-title"><ArchiveMark index={index}/><h2 id="wa-project-title">{project.title}</h2></div><p className="wa-case-intro">{project.description}</p><div className="wa-case-tags" aria-label="Technologies">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div><a className="wa-github-link" href={githubUrl} target="_blank" rel="noreferrer">Explore on GitHub <span>↗</span></a></div>
     <div className="wa-case-media"><img src={`/project-images/${archiveImages[project.visual]}.svg`} alt={`${project.title} system illustration`}/></div>
    </div>
    <div className="wa-case-context"><div><span className="wa-case-label">THE APPROACH</span><h3>Behind the system.</h3></div><p>{project.detail}</p></div>
    <div className="wa-flow-section"><span className="wa-case-label">SYSTEM FLOW</span><ol className="wa-system-flow">{flows[index].map((step,i)=><li key={step}><span className="wa-flow-number">0{i+1}</span><strong>{step}</strong>{i<3&&<span className="wa-flow-arrow" aria-hidden="true">↗</span>}</li>)}</ol></div>
    <nav className="wa-case-nav" aria-label="Project navigation"><button data-sound="silent" onClick={()=>change((index+projects.length-1)%projects.length)}>← Previous project</button><span>{project.number} / 05</span><button data-sound="silent" onClick={()=>change((index+1)%projects.length)}>Next project →</button></nav>
   </article>
  </div>
 </dialog>,document.body);
}
