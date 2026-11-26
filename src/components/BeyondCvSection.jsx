import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createBeyondBookSound } from './beyondBookSound.js';
import { beyondBooks } from './beyondCvData.js';
import TiltedGridHero from './ui/tilted-grid-hero.jsx';
import './beyond-cv.css';
const loadBookViewer=()=>import('./BeyondBookViewer.jsx');
const BeyondBookViewer=lazy(loadBookViewer),count=beyondBooks.length;
const wrap=value=>((value%count)+count)%count;
export default memo(function BeyondCvSection(){
 const sound=useRef(null),shelf=useRef(null),stage=useRef(null),origin=useRef(null);
 const [active,setActive]=useState(0),[opened,setOpened]=useState(null);
 const [compact,setCompact]=useState(()=>matchMedia('(max-width:700px)').matches);
 useEffect(()=>{const media=matchMedia('(max-width:700px)'),change=()=>setCompact(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 const [theme,setTheme]=useState(()=>document.documentElement.dataset.theme==='light'?'light':'dark');
 const images=useMemo(()=>beyondBooks.map(item=>({src:`/beyond-cv/jackets/${item.id}-${theme}.jpg`,alt:item.title})),[theme]);
 useEffect(()=>{const effects=createBeyondBookSound();sound.current=effects;return()=>{sound.current=null;effects.dispose();};},[]);
 useEffect(()=>{const node=document.documentElement,observer=new MutationObserver(()=>setTheme(node.dataset.theme==='light'?'light':'dark'));observer.observe(node,{attributes:true,attributeFilter:['data-theme']});return()=>observer.disconnect();},[]);
 useEffect(()=>{let idle=0,timer=0;const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)return;observer.disconnect();const prepare=()=>loadBookViewer().catch(()=>{});if(window.requestIdleCallback)idle=requestIdleCallback(prepare,{timeout:1500});else timer=setTimeout(prepare,100);},{rootMargin:'1400px'});observer.observe(stage.current);return()=>{observer.disconnect();if(window.cancelIdleCallback)cancelIdleCallback(idle);clearTimeout(timer);};},[]);
 const select=index=>{sound.current?.unlock();sound.current?.play('select');shelf.current?.select(wrap(index));};
 const step=direction=>{sound.current?.unlock();sound.current?.play('select');shelf.current?.step(direction);};
 const open=(index,node)=>{if(opened)return;shelf.current?.hold();sound.current?.unlock();sound.current?.play('open',0,beyondBooks[index].id);const bounds=stage.current.getBoundingClientRect(),facets=[...node.querySelectorAll('.tgh-facet')].map(part=>part.getBoundingClientRect());const left=Math.max(bounds.left,0,Math.min(...facets.map(r=>r.left))),right=Math.min(bounds.right,innerWidth,Math.max(...facets.map(r=>r.right))),top=Math.max(bounds.top,0,Math.min(...facets.map(r=>r.top))),bottom=Math.min(bounds.bottom,innerHeight,Math.max(...facets.map(r=>r.bottom)));origin.current={index,rect:{left,top,width:Math.max(20,right-left),height:Math.max(20,bottom-top)}};setActive(index);setOpened({index});};
 const chooseBook=index=>{shelf.current?.select(wrap(index),true);setOpened({index:wrap(index)});};
 const closeBook=()=>{const index=opened.index;setOpened(null);requestAnimationFrame(()=>shelf.current?.focusBook(index));};
 const getOrigin=()=>origin.current?.index===opened?.index?origin.current.rect:shelf.current?.getOrigin(opened?.index)||origin.current?.rect;
 return <section className="beyond-cv-section" id="beyond-cv" aria-labelledby="beyond-cv-title">
  <div className="bcv-heading container">
   <p className="bcv-kicker">the things that never fit on<br/>a CV <span aria-hidden="true">↘</span></p>
   <h2 id="beyond-cv-title">Beyond the <em>CV</em><svg viewBox="0 0 400 25" fill="none" aria-hidden="true"><path d="M4 20C89 1 276 7 392 10"/></svg></h2>
   <p className="bcv-introduction">A glimpse into what drives me —<br/>beyond work, beyond code.</p>
  </div>
  <div className="bcv-shelf bcv-curved-shelf" ref={stage}>
   <TiltedGridHero ref={shelf} images={images} speed={5.5} tileHeight={compact?42:56} aspectRatio={2/3} gap={9} axis={50} curve={80} fade={12} paused={opened!==null} onActiveChange={setActive} onActivate={open} onHover={index=>sound.current?.play('hover',(index/(count-1)-.5)*.8)}/>
  </div>
  <div className="bcv-shelf-controls container">
   <div className="bcv-catalogue"><span className="bcv-barcode" aria-hidden="true"/><span>A PERSONAL COLLECTION — {String(active+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span></div>
   <div className="bcv-shelf-navigation">
    <button type="button" data-sound="silent" onClick={()=>step(-1)} aria-label="Previous personal book">←</button>
    <div className="bcv-shelf-dots" aria-label="Personal book selection">{beyondBooks.map((item,index)=><button key={item.id} type="button" data-sound="silent" aria-label={'Select '+item.title} aria-current={index===active?'true':undefined} onClick={()=>select(index)}/>)}</div>
    <button type="button" data-sound="silent" onClick={()=>step(1)} aria-label="Next personal book">→</button>
    <small className="bcv-shelf-instruction">SWIPE · CHOOSE · OPEN ↗</small>
   </div>
  </div>
  <Suspense fallback={null}>{opened&&<BeyondBookViewer index={opened.index} getOrigin={getOrigin} onChoose={chooseBook} onClosed={closeBook} onSound={kind=>sound.current?.play(kind,0,beyondBooks[opened.index].id)}/>}</Suspense>
 </section>;
});
