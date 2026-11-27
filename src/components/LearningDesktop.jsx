import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {educationRecords} from './learningRecords.js';
import RetroLearningFrame from './RetroLearningFrame.jsx';
import {computerSound} from './learningSound.js';

function FileIcon({file}){
 if(file.kind==='folder')return <svg className='ld-folder-icon' viewBox='0 0 80 64' fill='none' aria-hidden='true'><path d='M7 15a6 6 0 0 1 6-6h18l7 7h29a6 6 0 0 1 6 6v31a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V15Z' fill='currentColor'/><path d='M7 25h66v28a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V25Z' fill='currentColor' className='ld-folder-front'/><path d='M14 27h52' stroke='white' strokeOpacity='.45'/><path d='m34 36-6 6 6 6m12-12 6 6-6 6m-4-14-4 16' stroke='var(--ld-folder-ink)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/></svg>;
 return <span className='ld-document-icon'><span className='ld-document-fold'/><img src={file.record.logo} alt=''/><i/><i/><b>{file.record.certificate?'IMAGE':'DEGREE'}</b></span>;
}
function DocumentContent({file,michiganLogoRef,googleLogoRef,onMichiganOpen,onGoogleOpen}){
 const record=file.record;
 return <div className={'ld-file-document'+(record.certificate?' is-certificate':'')}>
  <div className='ld-document-heading'><img src={record.logo} alt=''/><div><span>{record.institution}</span><h3>{record.title}</h3>{record.subtitle&&<p>{record.subtitle}</p>}</div></div>
  {record.certificate?<><div className='ld-certificate-sheet'><img src={record.certificate} alt={record.title+' certificate'} decoding='async'/></div><p className='ld-document-description'>{record.description}</p><div className='ld-certificate-actions'><span>{record.period}{record.credential?' · '+record.credential:''}</span><button type='button' ref={record.id==='michigan'?michiganLogoRef:googleLogoRef} onClick={record.id==='michigan'?onMichiganOpen:onGoogleOpen}>View original ↗</button></div></>:<><dl className='ld-document-facts'><div><dt>Period</dt><dd>{record.period}</dd></div><div><dt>Location</dt><dd>{record.location}</dd></div></dl><p className='ld-document-description'>{record.description}</p><h4>Academic foundations</h4><div className='ld-study-topics'>{record.tags.map((tag,i)=><div key={tag}><span>{String(i+1).padStart(2,'0')}</span>{tag}</div>)}</div></>}
 </div>;
}
function CapabilityContent({file}){
 return <div className='ld-capability-content'><div className='ld-folder-heading'><FileIcon file={file}/><div><span>CAPABILITY FOLDER</span><h3>{file.title}</h3><p>{file.group.length-1} working notes · applied knowledge</p></div></div><div className='ld-explorer-columns' aria-hidden='true'><span>Name</span><span>Type</span></div><ul>{file.group.slice(1).map((skill,i)=><li key={skill}><span className='ld-note-icon' aria-hidden='true'>≡</span><div><strong>{skill}</strong><small>Working knowledge</small></div><span className='ld-note-type'>Note {String(i+1).padStart(2,'0')}</span></li>)}</ul><p className='ld-folder-footnote'>Tools and practices that connect my formal learning with the work I do.</p></div>;
}
function FileWindow({file,files,source,direct,onSelect,onClose,onMinimize,trigger,...certificateProps}){
 const root=useRef(null),[maximized,setMaximized]=useState(false),[closing,setClosing]=useState(false),motion=useRef(null),closeRef=useRef(null),drag=useRef(null),offset=useRef({x:0,y:0});
 const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 useLayoutEffect(()=>{
  const node=root.current;
  if(!direct&&!reduce()){const r=node.getBoundingClientRect();motion.current=node.animate([{opacity:0,transform:`translate(${source.left+source.width/2-r.left-r.width/2}px,${source.top+source.height/2-r.top-r.height/2}px) scale(.92)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.23,1,.32,1)'});}
  node.querySelector('button')?.focus({preventScroll:true});
  return()=>{motion.current?.cancel();if(trigger?.isConnected)trigger.focus({preventScroll:true})};
 },[]);
 const close=(instant=false)=>{if(closing)return;setClosing(true);computerSound('hold');if(instant||reduce()){onClose();return;}const node=root.current,r=node.getBoundingClientRect(),destination=trigger?.isConnected?trigger.getBoundingClientRect():source;motion.current?.cancel();motion.current=node.animate([{opacity:1,transform:node.style.transform||'none'},{opacity:0,transform:`translate(${destination.left+destination.width/2-r.left-r.width/2}px,${destination.top+destination.height/2-r.top-r.height/2}px) scale(.95)`}],{duration:180,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'});motion.current.finished.then(onClose).catch(()=>{});};
 closeRef.current=close;
 useEffect(()=>{const key=event=>{if(event.key==='Escape'&&!document.querySelector('.michigan-certificate-overlay')){event.preventDefault();closeRef.current(true)}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[]);
 const dragStart=event=>{if(event.button!==0||event.target.closest('button')||maximized||event.pointerType==='touch')return;drag.current={pointerX:event.clientX,pointerY:event.clientY,x:offset.current.x,y:offset.current.y};event.currentTarget.setPointerCapture(event.pointerId)};
 const dragMove=event=>{const d=drag.current;if(!d)return;const parent=root.current.parentElement;offset.current={x:Math.max(-parent.clientWidth*.06,Math.min(parent.clientWidth*.06,d.x+event.clientX-d.pointerX)),y:Math.max(-12,Math.min(24,d.y+event.clientY-d.pointerY))};root.current.style.transform=`translate(${offset.current.x}px,${offset.current.y}px)`};
 return <div ref={root} className={'ld-file-window'+(maximized?' is-maximized':'')+(closing?' is-closing':'')} role='dialog' aria-modal='false' aria-label={file.title+' file preview'} style={{'--file-color':file.color}}>
  <div className='ld-window-titlebar' onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} onDoubleClick={()=>{setMaximized(!maximized);offset.current={x:0,y:0};root.current.style.transform='none'}}><span>{file.kind==='folder'?'▱':'▤'} {file.filename}</span><div><button type='button' aria-label='Minimize file preview' onClick={onMinimize}>−</button><button type='button' aria-label={maximized?'Restore window size':'Maximize file preview'} onClick={()=>{setMaximized(!maximized);offset.current={x:0,y:0};root.current.style.transform='none'}}>□</button><button type='button' aria-label='Close file preview' onClick={()=>close()}>×</button></div></div>
  <div className='ld-window-toolbar'><span>Basit’s PC <i>›</i> {file.kind==='folder'?'Capabilities':'Education'} <i>›</i> <b>{file.title}</b></span><span>{file.kind==='folder'?'Folder':'Quick Look'}</span></div>
  <div className='ld-window-workspace'><nav className='ld-explorer-sidebar' aria-label='Learning files'><span>EDUCATION</span>{files.filter(f=>f.kind==='document').map(f=><button key={f.id} aria-current={f.id===file.id?'page':undefined} onClick={()=>onSelect(f.id)}>{f.shortTitle}</button>)}<span>CAPABILITIES</span>{files.filter(f=>f.kind==='folder').map(f=><button key={f.id} aria-current={f.id===file.id?'page':undefined} onClick={()=>onSelect(f.id)}>{f.title}</button>)}</nav><div className='ld-file-content' key={file.id}>{file.kind==='folder'?<CapabilityContent file={file}/>:<DocumentContent file={file} {...certificateProps}/>}</div></div>
  <div className='ld-window-status'><span>{file.kind==='folder'?file.group.length-1+' notes':'Read-only preview'}</span><span>{file.kind==='folder'?'CAPABILITIES':'EDUCATION'} / BASIT BASHIR</span></div>
 </div>;
}
export default function LearningDesktop({skillGroups,ready,visible,...certificateProps}){
 const desktop=useRef(null),buttons=useRef({}),lastPointer=useRef('mouse'),[selected,setSelected]=useState(null),[opened,setOpened]=useState(null),[minimized,setMinimized]=useState(false),[clock,setClock]=useState(()=>new Date());
 const files=useMemo(()=>[...educationRecords.map((record,i)=>({id:record.id,kind:'document',record,title:record.title,shortTitle:['GCET Kashmir','Applied ML','Digital marketing'][i],filename:['gcet-kashmir.md','applied-machine-learning.png','digital-marketing.jpg'][i],color:['#a0b9bc','#aeb6d4','#c9b895'][i]})),...skillGroups.map((group,i)=>({id:'capability-'+i,kind:'folder',group,title:group[0],shortTitle:group[0],filename:group[0],color:['#9caec9','#b3c596','#c4ada8','#b8b0cb'][i]}))],[skillGroups]);
 useEffect(()=>{if(!visible)return;const timer=setInterval(()=>setClock(new Date()),60000);return()=>clearInterval(timer)},[visible]);
 const open=(file,direct=false)=>{computerSound('hold');const node=buttons.current[file.id];setSelected(file.id);setMinimized(false);setOpened({id:file.id,source:node.getBoundingClientRect().toJSON(),direct,trigger:node})};
 const selectFile=id=>{setSelected(id);setOpened(current=>({...current,id}));computerSound('hold')};
 const file=opened?files.find(f=>f.id===opened.id):null;
 return <RetroLearningFrame active={ready&&visible} kind='overview' label='Education desktop'>
  <div ref={desktop} className={'ld-desktop'+(ready?' is-ready':'')} onPointerDown={event=>{if(event.target===event.currentTarget)setSelected(null)}}>
   <div className='ld-desktop-menubar'><strong><span aria-hidden='true'>▦</span> Basit’s PC</strong><span>Education & capabilities</span><time>{clock.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time></div>
   <div className='ld-desktop-wallpaper' aria-hidden='true'><span>Learn.<br/><em>Put it to work.</em></span><svg viewBox='0 0 600 350' fill='none'><path d='M20 300 190 160l110 60L480 60M20 320l170-120 110 40L480 80M120 350l110-80 80 20L590 60'/><circle cx='480' cy='60' r='25'/></svg></div>
   <div className='ld-desktop-files' role='group' aria-label='Education documents and capability folders'>{files.map((item,i)=><button type='button' className={'ld-desktop-file'+(selected===item.id?' is-selected':'')} key={item.id} ref={node=>buttons.current[item.id]=node} style={{'--file-color':item.color,'--file-delay':i*45+'ms'}} aria-label={'Open '+item.title} aria-pressed={selected===item.id} onPointerDown={event=>{lastPointer.current=event.pointerType}} onClick={event=>{setSelected(item.id);if(event.detail===0||lastPointer.current==='touch')open(item,event.detail===0)}} onDoubleClick={()=>open(item)}><FileIcon file={item}/><span>{item.shortTitle}</span><small>{item.kind==='folder'?'Folder':item.filename.split('.').at(-1).toUpperCase()}</small></button>)}</div>
   <div className='ld-desktop-caption'><span>PERSONAL LEARNING ARCHIVE</span><p>Three achievements.<br/>Four areas of practice.</p></div>
   {opened&&!minimized&&<FileWindow key='file-window' file={file} files={files} source={opened.source} direct={opened.direct} trigger={opened.trigger} onSelect={selectFile} onClose={()=>setOpened(null)} onMinimize={()=>setMinimized(true)} {...certificateProps}/>}
   <div className='ld-desktop-taskbar'><button type='button' className='ld-home-button' aria-label='Show desktop' onClick={()=>setMinimized(true)}><span aria-hidden='true'>▦</span> Desktop</button><span className='ld-taskbar-divider'/>{opened?<button className='ld-taskbar-file' type='button' aria-pressed={!minimized} onClick={()=>setMinimized(!minimized)}>▤ {file.shortTitle}</button>:<span className='ld-taskbar-idle'>7 items · Ready to explore</span>}<span className='ld-taskbar-online'><i/> Local archive</span></div>
  </div>
 </RetroLearningFrame>;
}
