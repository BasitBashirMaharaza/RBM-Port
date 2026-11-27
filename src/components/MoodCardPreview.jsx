import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

export default function MoodCardPreview({book,entry,src,anchor,trigger,onClosed}){
 const root=useRef(null),audio=useRef(null),closeRef=useRef(()=>{}),id=useId(),[playing,setPlaying]=useState(false),[error,setError]=useState(''),[page,setPage]=useState(0);
 const themes={trails:['FIELD JOURNAL','↟'],music:['RECORD SLEEVE','◎'],cinema:['SCREENING NOTES','▤'],games:['PLAYER FILE','✛'],social:['A SMALL CONNECTION','↗']};
 const [edition,symbol]=themes[book.id];
 useLayoutEffect(()=>{
  const node=root.current,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches||trigger?.matches(':focus-visible');
  let disposed=false,closing=false,motion=null;const fades=[];
  const area=document.querySelector('#beyond-cv .mood-center-mat').getBoundingClientRect();
  const width=Math.min(area.width,innerWidth-24),height=Math.min(area.height,(window.visualViewport?.height||innerHeight)-24);
  const left=Math.max(12,Math.min(innerWidth-width-12,area.left)),top=Math.max(12,Math.min(innerHeight-height-12,area.top));
  Object.assign(node.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
  node.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const origin=rect=>`translate(${rect.left+rect.width/2-left-width/2}px,${rect.top+rect.height/2-top-height/2}px) scale(${rect.width/width},${rect.height/height})`;
  const image=node.querySelector('.mood-preview-flight-art');
  if(!reduce){
   motion=node.animate([{transform:origin(anchor)},{transform:'none'}],{duration:480,easing:'cubic-bezier(.23,1,.32,1)',fill:'both'});
   fades.push(image.animate([{opacity:1},{opacity:0}],{duration:240,delay:130,fill:'both'}));
   for(const child of node.children)if(child!==image&&child.tagName!=='AUDIO')fades.push(child.animate([{opacity:0},{opacity:1}],{duration:220,delay:160,fill:'both'}));
  }
  const close=(immediate=false)=>{
   if(closing||disposed)return;closing=true;audio.current?.pause();
   if(immediate||reduce){onClosed();return;}
   const current=getComputedStyle(node).transform;motion?.cancel();fades.forEach(a=>a.cancel());
   const destination=trigger?.isConnected?trigger.getBoundingClientRect():anchor;
   image.style.opacity='1';
   for(const child of node.children)if(child!==image&&child.tagName!=='AUDIO')child.style.opacity='0';
   motion=node.animate([{transform:current,opacity:1},{transform:origin(destination),opacity:1}],{duration:320,easing:'cubic-bezier(.77,0,.175,1)',fill:'both'});
   motion.finished.then(()=>{if(!disposed)onClosed()}).catch(()=>{});
  };
  closeRef.current=close;
  const outside=event=>{const r=node.getBoundingClientRect();if(event.target===node&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))close()};
  const cancel=event=>{event.preventDefault();close(true)};
  const resize=()=>close(true);node.addEventListener('pointerdown',outside);node.addEventListener('cancel',cancel);window.addEventListener('resize',resize);
  node.querySelector('button')?.focus({preventScroll:true});
  return()=>{disposed=true;motion?.cancel();fades.forEach(a=>a.cancel());node.removeEventListener('pointerdown',outside);node.removeEventListener('cancel',cancel);window.removeEventListener('resize',resize);audio.current?.pause();node.close();document.body.style.overflow=overflow;trigger?.focus({preventScroll:true})};
 },[]);
 useEffect(()=>{const hide=()=>{if(document.hidden)audio.current?.pause()};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[]);
 const play=async()=>{const node=audio.current;if(!node)return;setError('');if(!node.paused){node.pause();return}try{if(node.error)node.load();await node.play()}catch(cause){if(cause.name!=='AbortError')setError('Preview unavailable. Try the streaming links.')}};
 const facts=[['Artist',entry.artist],['Profile',entry.handle],['Released',entry.year],['Format',entry.kind],['Genre',entry.genre],['Creator',entry.credit],['Publisher',entry.publisher],['Location',entry.region],['Elevation',entry.altitude],['Terrain',entry.terrain]].filter(([,value])=>value);
 const labels={trails:'A NOTE FROM THE TRAIL',music:'ON THE RECORD',cinema:'THE STORY',games:'INSIDE THE WORLD',social:'BEHIND THE PROFILE'};
 const musicDetail=entry.artist?`${entry.title} — ${entry.artist}. A pick from my personal soundtrack, ready for a quick listen here or the full track on Spotify and YouTube Music.`:null;
 const paragraphs=[entry.teaser||entry.description||entry.caption||musicDetail||book.note,entry.teaser?entry.description:null,entry.detail].filter(Boolean);
 const chunk=matchMedia('(max-height:650px)').matches?90:200;
 const pages=paragraphs.flatMap(text=>text.match(new RegExp('.{1,'+chunk+'}(?:\\s|$)','g'))||[text]);
 if(entry.route)pages.push(entry.route.join(' → '));
 return createPortal(<dialog ref={root} className={'mood-card-preview mood-stage-preview mood-preview-'+book.id+(playing?' is-playing':'')} role='dialog' aria-modal='true' aria-labelledby={id} style={{'--preview-color':entry.accent||book.color}}>
  <img className='mood-preview-flight-art' src={src} alt='' aria-hidden='true'/>
  <header><span><b aria-hidden='true'>{symbol}</b> {edition}</span><button type='button' aria-label='Close card preview' onClick={()=>closeRef.current()}>×</button></header>
  <div className='mood-card-preview-summary'><div className='mood-card-preview-art'><img src={src} alt={entry.alt||entry.artAlt||entry.title}/>{entry.preview&&<button type='button' aria-label={(playing?'Pause ':'Preview ')+entry.title} onClick={play}>{playing?'Ⅱ':'▷'}</button>}</div><div><span>{entry.tag||entry.label||entry.collection||'A PERSONAL PICK'}</span><h3 id={id}>{entry.title}</h3>{entry.subtitle&&<small>{entry.subtitle}</small>}<dl className='mood-preview-facts'>{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></div>
  <div className='mood-card-preview-body'><span className='mood-preview-detail-label'>{labels[book.id]}</span><p key={page}>{pages[page]}</p>{pages.length>1&&<nav aria-label='Preview details'><button type='button' aria-label='Previous detail' disabled={page===0} onClick={()=>setPage(page-1)}>←</button><span>{String(page+1).padStart(2,'0')} / {String(pages.length).padStart(2,'0')}</span><button type='button' aria-label='Next detail' disabled={page===pages.length-1} onClick={()=>setPage(page+1)}>→</button></nav>}</div>
  <footer>{entry.url&&<a href={entry.url} target='_blank' rel='noreferrer'>{book.id==='music'?'Spotify':book.id==='games'?'Explore game':book.id==='social'?'Visit '+entry.title:'Explore title'} <span aria-hidden='true'>↗</span></a>}{entry.youtubeMusic&&<a href={entry.youtubeMusic} target='_blank' rel='noreferrer'>YouTube Music <span aria-hidden='true'>↗</span></a>}{entry.source&&<a href={entry.source} target='_blank' rel='noreferrer'>{entry.sourceName||'Route information'} <span aria-hidden='true'>↗</span></a>}</footer>
  {error&&<p className='mood-preview-error' role='alert'>{error}</p>}
  {entry.preview&&<audio ref={audio} src={entry.preview} preload='none' onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError('Preview unavailable. Try the streaming links.')}}/>}
 </dialog>,document.body);
}
