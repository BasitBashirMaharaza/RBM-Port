import { useEffect, useRef, useState } from 'react';
import { ArchiveFace } from './ArchiveProjectFace.jsx';
import { archiveColors,archiveLightColors } from './workArchiveMarks.js';
import './selected-work-archive.css';
import ProjectArchiveDialog from './ProjectArchiveDialog.jsx';
import SectionTextReveal from './SectionTextReveal.jsx';
import {createArchiveSound} from './archiveSound.js';
import ArchiveContributionOverlay,{ArchiveContributionSource} from './ArchiveContributions.jsx';

export default function SelectedWorkArchive({projects,githubUrl}){
 const contributionIndex=projects.length,count=projects.length+1;
 const entries=[...projects,{title:'GitHub contributions',number:String(count).padStart(2,'0')}];
 const colors=[...archiveColors,'#b6d889'],lightColors=[...archiveLightColors,'#4d7137'];
 const pickerAction=useRef(null);
 const host=useRef(null),section=useRef(null),scene=useRef(null),openRef=useRef(null),swipe=useRef(null);
 const audio=useRef(null),contributionTrigger=useRef(null);
 const [contributionsOpen,setContributionsOpen]=useState(false);
 const openContributions=()=>{if(!contributionsOpen){contributionTrigger.current=pickerAction.current;audio.current?.unlock();audio.current?.play('click',contributionIndex);scene.current?.setOpening(true);setContributionsOpen(true);}};
 const contributionAction=useRef(openContributions);contributionAction.current=openContributions;
 const updateContributionCanvas=useRef(canvas=>scene.current?.setContributionCanvas(canvas)).current;
 const [ready,setReady]=useState(false),[fallback,setFallback]=useState(false),[hover,setHover]=useState(-1),[selected,setSelected]=useState(0),[opened,setOpened]=useState(null);
 const open=index=>{if(index===contributionIndex){openContributions();return;}if(opened!==null||contributionsOpen)return;audio.current?.unlock();audio.current?.play('click',index);scene.current?.setOpening(true);setOpened(index);};openRef.current=open;
 useEffect(()=>{
  const sound=createArchiveSound();audio.current=sound;
  const unlock=()=>sound.unlock(),visibility=()=>{if(document.hidden)sound.stop();};
  document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);document.addEventListener('visibilitychange',visibility);
  return()=>{document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);document.removeEventListener('visibilitychange',visibility);sound.dispose();audio.current=null;};
 },[]);
 useEffect(()=>{
  let disposed=false,started=false;
  const observer=new IntersectionObserver(async entries=>{if(!entries[0].isIntersecting||started)return;started=true;observer.disconnect();try{const {createArchiveScene}=await import('./archiveScene.js');if(disposed)return;scene.current=createArchiveScene(host.current,projects,{onHover:i=>{setHover(i);if(i>=0)audio.current?.play('hover',i);},onLidMotion:kind=>audio.current?.play(kind),onOpen:i=>openRef.current(i),onContributions:()=>contributionAction.current(),onReady:()=>setReady(true),onError:()=>setFallback(true)});}catch{if(!disposed)setFallback(true);}},{rootMargin:'400px'});
  observer.observe(section.current);return ()=>{disposed=true;observer.disconnect();scene.current?.dispose();};
 },[projects]);
 const choose=index=>{audio.current?.unlock();setSelected(index);scene.current?.setHover(index);audio.current?.play('click',index);};
 const featured=hover>=0?hover:selected;
 return <section ref={section} id="work" className="wa-section" aria-label="Selected work" onPointerOver={event=>{if(event.pointerType!=='mouse')return;const button=event.target.closest('button');if(button&&!button.contains(event.relatedTarget))audio.current?.play('hover',featured);}}>
  <div className="wa-heading"><div><span className="wa-overline">SELECTED WORK</span><h2><SectionTextReveal>A collection of <em>systems.</em></SectionTextReveal></h2></div><p><SectionTextReveal>AI, data & healthcare.<br/>Five projects, filed for exploration.</SectionTextReveal></p></div>
  <div className={`wa-stage${fallback?' has-fallback':''}${ready?' is-ready':''}`} ref={host}>
   {!ready&&!fallback&&<div className="wa-loading">Opening the archive<span> · · ·</span></div>}
   <div className="wa-stage-instruction" aria-hidden="true">HOVER TO EXPLORE · CLICK TO OPEN</div>
  </div>
  {ready&&!fallback&&<ArchiveContributionSource onCanvasDraw={updateContributionCanvas}/>}
  {contributionsOpen&&<ArchiveContributionOverlay trigger={contributionTrigger.current} onClosed={()=>{setContributionsOpen(false);scene.current?.setOpening(false);}}/>}
  {fallback&&<div className="wa-fallback">{projects.map((project,i)=><button data-sound="silent" key={project.title} onClick={()=>open(i)} style={{'--wa-accent':archiveColors[i],'--wa-light-accent':archiveLightColors[i]}}><ArchiveFace project={project} index={i}/></button>)}</div>}
  <div className="wa-project-picker" onPointerDown={e=>{swipe.current={x:e.clientX,y:e.clientY};}} onPointerUp={e=>{const start=swipe.current;swipe.current=null;if(start&&Math.abs(e.clientX-start.x)>55&&Math.abs(e.clientY-start.y)<35)choose((featured+(e.clientX<start.x?1:count-1))%count);}} style={{'--wa-accent':colors[featured],'--wa-light-accent':lightColors[featured]}}>
   <div className="wa-picker-main"><span>{entries[featured].number} / {String(count).padStart(2,'0')}</span><button ref={pickerAction} data-sound="silent" onClick={()=>open(featured)} aria-label={`Open ${entries[featured].title}`}>{entries[featured].title}<span>↗</span></button><button data-sound="silent" className="wa-mobile-open" onClick={()=>open(featured)}>{featured===contributionIndex?'Open contributions ↗':'Open project ↗'}</button></div>
   <div className="wa-picker-controls"><button data-sound="silent" aria-label="Previous project" onClick={()=>choose((featured+count-1)%count)}>←</button><div>{entries.map((project,i)=><button data-sound="silent" key={project.title} aria-label={`Select ${project.title}`} aria-pressed={featured===i} onClick={()=>choose(i)}><span/></button>)}</div><button data-sound="silent" aria-label="Next project" onClick={()=>choose((featured+1)%count)}>→</button></div>
  </div>
  {opened!==null&&<ProjectArchiveDialog projects={projects} initial={opened} scene={scene} onSound={(kind,index)=>audio.current?.play(kind,index)} githubUrl={githubUrl} onClosed={()=>setOpened(null)}/>}
 </section>;
}
