import {useEffect,useRef} from 'react';
import './trekking-book.css';
export function TrailContours(){return <svg className="bcv-trail-contours" viewBox="0 0 300 440" fill="none" aria-hidden="true">{[0,1,2,3,4,5,6].map(n=><path key={n} d="M-40 210C40 110 110 260 195 140S330 60 360 135M-35 375c110-155 145 40 245-95s130-30 160-80" transform={`translate(${n*4} ${n*12})`}/>)}</svg>;}
export function TrailCamp(){return <div className="bcv-trail-camp" aria-label="Illustrated riverside campsite"><svg viewBox="0 0 360 230" fill="none" aria-hidden="true"><path d="M0 150 77 53l54 59 64-83 62 91 42-41 61 72v79H0Z" fill="#a6b1a0"/><path d="m166 68 29-39 26 39-25-11-15 18Z" fill="#e5e5d5"/><path d="M0 182 91 116l74 67 74-66 121 63v50H0Z" fill="#566f5e"/><path d="M163 169c80 11-60 23-10 36s4 27-32 40" stroke="#c8dfe0" strokeWidth="18"/><g stroke="#2b4d3d" strokeWidth="3">{[22,48,310,335].map((x,i)=><path key={x} d={`M${x} ${137+i%2*13}v60m-15-13 15-32 16 32m-13-15 8 12`}/>)}</g><path d="m206 197 30-46 34 46Z" fill="#cfad70"/><path d="m236 151 10 46h-28Z" fill="#6e593b"/><path d="M236 151v46m-36 5h76" stroke="#ede3bc"/><circle className="bcv-trail-camp-sun" cx="292" cy="44" r="17" fill="#ead7a3"/><path className="bcv-trail-camp-cloud" d="M19 48h43c1-9-8-12-14-7-1-14-21-15-23-2-8-4-15 3-6 9ZM228 85h44c0-11-10-13-17-7-7-16-24-9-27 7Z" fill="#e8e6d9"/></svg><span>ARU → LIDDERWAT</span></div>;}
export function TrekkingCover({live=true}){
 const root=useRef(null),video=useRef(null);
 useEffect(()=>{
  const node=video.current,motion=matchMedia('(prefers-reduced-motion: reduce)'),shelf=root.current.closest('.bcv-shelf');let visible=false;
  const sync=()=>{const running=live&&visible&&!document.hidden&&!motion.matches&&!shelf?.hasAttribute('data-motion');root.current?.toggleAttribute('data-running',running);if(running)node.play().catch(()=>{});else node.pause();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(root.current);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);shelf?.addEventListener('portfolio:shelf-motion',sync);
  return()=>{shelf?.removeEventListener('portfolio:shelf-motion',sync);observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);node.pause();};
 },[live]);
 return <div ref={root} className="bcv-trail-jacket"><video ref={video} src="/beyond-cv/trails/trail-film.mp4" poster="/beyond-cv/trails/tulian-forest.jpg" muted loop playsInline preload="metadata" tabIndex={-1} aria-hidden="true"/><div className="bcv-trail-jacket-shade"/><TrailContours/><div className="bcv-trail-jacket-top"><span>BASIT BASHIR</span><i>↟</i></div><div className="bcv-trail-jacket-copy"><span>A KASHMIR FIELD JOURNAL</span><h3>Out on<br/><em>the trail.</em></h3><p>Lakes. Forests. Open skies.</p></div><div className="bcv-trail-jacket-foot"><svg viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="21"/><path d="m25 9 5 16-5 16-5-16Zm-16 16h32"/></svg><span>TREKKING & CAMPING<br/><b>MEMORIES FROM THE MOUNTAINS</b></span></div></div>;
}
export default function TrekkingPage({item,spread,side,interactive=true,onTrailSelect}){
 const index=spread*2+(side==='left'?0:1),entry=item.entries[index];
 const page=useRef(null),photo=useRef(null);
 useEffect(()=>{
  const node=page.current,motion=matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>node.toggleAttribute('data-running',interactive&&!document.hidden&&!motion.matches);
  sync();
  const entrance=interactive&&!motion.matches?photo.current?.animate([{opacity:.65,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:500,easing:'cubic-bezier(.23,1,.32,1)'}):null;
  const visibility=()=>{sync();if(document.hidden)entrance?.finish();};
  const preference=()=>{sync();if(motion.matches)entrance?.cancel();};
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',preference);
  return()=>{entrance?.cancel();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',preference);node.removeAttribute('data-running');};
 },[interactive,index]);
 return <div ref={page} className="bcv-paper-page bcv-trail-page" style={{'--trail-accent':entry.accent}}>
  <div className="bcv-trail-page-top"><span>KASHMIR FIELD NOTES</span><b>{String(index+1).padStart(2,'0')} / 04</b></div>
  <button type="button" className="bcv-trail-photo" disabled={!interactive} aria-label={'Explore '+entry.title} aria-haspopup="dialog" data-sound="silent" onClick={event=>{event.stopPropagation();onTrailSelect?.(entry,index,event.currentTarget);}}><span ref={photo} className="bcv-trail-photo-image">{entry.cover?<img src={entry.cover} alt={entry.alt} decoding="async" draggable="false"/>:<TrailCamp/>}</span><span className="bcv-trail-photo-open">EXPLORE TRAIL ↗</span><i>{entry.tag}</i></button>
  <header className="bcv-trail-heading"><span>{entry.region}</span><h3>{entry.title}</h3><p>{entry.subtitle}</p></header>
  <div className="bcv-trail-stats"><span><small>LANDSCAPE</small>{entry.terrain}</span><span><small>SETTING</small>{entry.altitude}</span></div>
  <p className="bcv-trail-description">{entry.description}</p><p className="bcv-trail-description bcv-trail-summary">{entry.teaser}</p>
  <div className="bcv-trail-route"><span>THE APPROACH</span><p>{entry.route.map((stop,i)=><span key={stop}>{i>0&&<i>→</i>}{stop}</span>)}</p></div>
  <div className="bcv-trail-page-foot"><span>PERSONAL TRAIL JOURNAL</span><a href={entry.source} target="_blank" rel="noopener noreferrer" data-sound="silent" tabIndex={interactive?0:-1}>Trail reference ↗</a></div>
 </div>;
}
