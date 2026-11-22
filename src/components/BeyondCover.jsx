import TrekkingPage,{TrekkingCover} from './TrekkingBook.jsx';
import CinemaPage from './CinemaPage.jsx';
import {CinemaCover} from './CinemaReels.jsx';
import { memo, useEffect, useRef } from 'react';
import MusicPage from './MusicBookPage.jsx';
import GamingPage from './GamingPage.jsx';
import {GameCover} from './GameHardware.jsx';
import MusicMosaicCover from './MusicMosaicCover.jsx';
import SocialBookPage,{SocialCover} from './SocialBook.jsx';

function LivingCover({ item, live }) {
 const video=useRef(null);
 useEffect(()=>{
  const node=video.current;if(!node)return undefined;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
  const sync=()=>{if(visible&&!document.hidden&&!motion.matches)node.play().catch(()=>{});else node.pause();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(node);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);node.pause();};
 },[live]);
 return <div className="bcv-living-cover" aria-hidden="true">{live?<video ref={video} src={item.video} poster={item.videoPoster} muted loop playsInline preload="metadata" tabIndex={-1}/>:<img src={item.videoPoster} alt="" draggable="false"/>}</div>;
}


function CategoryDrawing({ id }) {
 if(id==='instagram'||id==='youtube') return <div className="bcv-polaroid"><span className="bcv-tape" /><img src="/portfolio_photo.webp" alt="" draggable="false" /><span>{id==='instagram'?'life, in frames.':'a little more of my world.'}</span>{id==='youtube'&&<i className="bcv-video-mark" aria-hidden="true">▶</i>}</div>;
 if(id==='music') return <div className="bcv-record"><div className="bcv-record-label"><span>SIDE A</span><b>bb.</b><small>ON REPEAT</small></div><span className="bcv-tonearm" /></div>;
 if(id==='threads') return <div className="bcv-thought"><span>“</span><p>A thought,<br /><em>then another.</em></p><i>keep the conversation going ↗</i></div>;
 return <svg className={'bcv-drawing drawing-'+id} viewBox="0 0 300 270" fill="none" aria-hidden="true">
  {id==='trails'?<><path className="bcv-mountain-far" d="M0 180 84 54l69 101 54-70 93 103v82H0Z"/><path className="bcv-mountain-near" d="m-10 225 88-105 59 75 51-40 122 99v32H-10Z"/><path className="bcv-snow" d="m56 96 28-42 30 44-25-10-12 13-8-11Z"/><path className="bcv-trail" d="M153 265c-60-41 61-54 9-87"/><path className="bcv-tent" d="m183 228 27-42 31 42Zm27-42v42m-16 0 16-27 20 27"/><circle cx="228" cy="55" r="17"/><path d="m32 59 6-8 7 8m-4-6 7-5 6 6"/></>
   :id==='cinema'?<><g transform="rotate(-9 150 135)"><rect className="bcv-film" x="36" y="29" width="228" height="210" rx="3"/>{[0,1,2,3,4,5,6].map(n=><g key={n}><rect x="43" y={38+n*28} width="8" height="13" rx="1"/><rect x="249" y={38+n*28} width="8" height="13" rx="1"/></g>)}<rect className="bcv-film-still still-one" x="62" y="43" width="176" height="84"/><rect className="bcv-film-still still-two" x="62" y="141" width="176" height="84"/><path d="m62 127 63-69 32 35 32-26 49 60m-176 98 47-53 43 30 36-39 50 62"/></g><path d="M101 25h113m-102-9h77"/></>
   :id==='games'?<><path className="bcv-console-shadow" d="M71 80c-32 1-46 29-54 83-5 35 13 48 36 25l27-28h140l27 28c23 23 41 10 36-25-8-54-22-82-54-83Z"/><path className="bcv-console" d="M72 72c-32 1-45 29-53 83-5 35 13 48 36 25l26-28h138l26 28c23 23 41 10 36-25-8-54-21-82-53-83Z"/><path d="M69 91v34m-17-17h34"/><circle cx="112" cy="132" r="15"/><circle cx="188" cy="132" r="15"/><circle cx="232" cy="96" r="4"/><circle cx="245" cy="109" r="4"/><circle cx="219" cy="109" r="4"/><circle cx="232" cy="122" r="4"/><path d="M135 92h30"/><rect x="128" y="212" width="44" height="28" rx="5"/><path d="m146 220 7 6-7 6"/></>
   :id==='shopping'?<><path className="bcv-bag-shadow" d="m69 81 151-2 17 166H56Z"/><path className="bcv-bag" d="M62 70h151l17 166H49Z"/><path d="M96 83V57c0-54 84-54 84 0v26"/><rect className="bcv-shopping-label" x="82" y="116" width="111" height="64"/><path d="M98 135h76m-76 12h57m-57 13h76M62 70l17 166m134-166-17 166"/><path d="M225 73c40 18 14 51-13 44"/></>
   :<><ellipse className="bcv-plate-shadow" cx="151" cy="153" rx="94" ry="83"/><ellipse className="bcv-plate" cx="145" cy="140" rx="92" ry="84"/><ellipse cx="145" cy="140" rx="69" ry="63"/><path className="bcv-food-leaf" d="M123 151c-47-43-8-69 24-34 16-49 61-26 28 18 48 12 26 50-13 25-18 44-61 15-39-9Z"/><path d="M33 59v150m-12-150v43c0 16 24 16 24 0V59m-12 53v18m236-71v150m0-150c-32 21-32 76 0 76M91 237h107"/></>}
 </svg>;
}

export const BeyondCover = memo(function BeyondCover({ item, back=false, live=true }) {
 return <div className={'bcv-cover-art cover-'+item.id+(back?' is-back-cover':'')+(!back&&item.video?' has-live-cover':'')} style={{'--jacket':item.color,'--jacket-ink':item.ink}}>
   {!back&&item.video&&<LivingCover item={item} live={live}/>}
   {!back&&item.id==='trails'&&<TrekkingCover live={live}/>}
   {!back&&item.id==='music'&&<MusicMosaicCover entries={item.entries} live={live}/>}
   {!back&&item.id==='cinema'&&<CinemaCover entries={item.entries} live={live}/>}
   {!back&&item.id==='games'&&<GameCover entries={item.entries} live={live}/>}
   {!back&&item.id==='social'&&<SocialCover entries={item.entries} live={live}/>}
   <div className="bcv-cover-grain" />
   {(back||(item.id!=='music'&&item.id!=='cinema'&&item.id!=='games'&&item.id!=='social'&&item.id!=='trails'))&&<span className="bcv-cover-catalogue">BASIT BASHIR <i>·</i> OFF THE CLOCK</span>}
   {back?<div className="bcv-back-inscription"><span>Beyond the CV</span><h3>{item.note}</h3><svg viewBox="0 0 140 24"><path d="M4 18C42 3 78 22 134 9" fill="none" stroke="currentColor" /></svg><small>THE STORY CONTINUES.</small></div>:item.id==='music'||item.id==='cinema'||item.id==='games'||item.id==='social'||item.id==='trails'?null:<>
    <span className="bcv-cover-kicker">{item.kicker}</span>
    {!item.video&&item.id!=='music'&&<CategoryDrawing id={item.id}/>}
    <div className="bcv-cover-title"><h3>{item.coverTitle}</h3><span>{item.title}</span></div>
    <span className="bcv-cover-stamp">a personal<br/>collection.</span>
   </>}
 </div>;
});

export function BeyondPage({ item, spread, side, onSongSelect, onMovieSelect, onGameSelect, onSocialSelect, onTrailSelect, player, interactive=true }) {
 if(item.id==='trails')return <TrekkingPage item={item} spread={spread} side={side} interactive={interactive} onTrailSelect={onTrailSelect}/>;
 if(item.id==='social')return <SocialBookPage item={item} spread={spread} side={side} interactive={interactive} onSocialSelect={onSocialSelect}/>;
 if(item.id==='cinema'&&item.entries.length)return <CinemaPage item={item} spread={spread} side={side} interactive={interactive} onMovieSelect={onMovieSelect}/>;
 if(item.id==='games'&&item.entries.length)return <GamingPage item={item} spread={spread} side={side} interactive={interactive} onGameSelect={onGameSelect}/>;
 if(item.id==='music'&&item.entries.length)return <MusicPage item={item} spread={spread} side={side} onSongSelect={onSongSelect} player={player} interactive={interactive}/>;
 const decorated=(spread===0&&side==='left')||(spread===1&&side==='right');
 return <div className={'bcv-paper-page'+(decorated?' is-decorated':'')} style={{'--jacket':item.color,'--jacket-ink':item.ink}}>
  <span className="bcv-page-folio">{String(spread*2+(side==='left'?1:2)).padStart(2,'0')}</span>
  {decorated?<><div className="bcv-keepsake-frame"><div className="bcv-keepsake-inner">{spread===0?<CategoryDrawing id={item.id}/>:<blockquote>{item.note}</blockquote>}</div><span className="bcv-paper-caption">{spread===0?item.caption:'little things, lasting impressions.'}</span></div><svg className="bcv-page-doodle" viewBox="0 0 100 60"><path d="M5 48c12-29 37 7 50-20S88 2 91 17m-9-8 9 8 5-13" fill="none" stroke="currentColor" /></svg></>:<>
   <span className="bcv-page-eyebrow">{item.kicker}</span>
   <h3>{spread===0?item.title:'A little more of me.'}</h3>
   <p className="bcv-page-lead">{spread===0?item.caption:item.note}</p>
   {item.entries.length>0?<ul className="bcv-favourites">{item.entries.map(entry=><li key={typeof entry==='string'?entry:entry.title}>{typeof entry==='string'?entry:entry.title}</li>)}</ul>:<div className="bcv-personal-note"><span className="bcv-tape"/><p>{spread===0?item.note:'The things that never fit on a CV.'}</p></div>}
   {item.url&&<a href={item.url} target="_blank" rel="noreferrer" data-sound="silent" onClick={event=>event.stopPropagation()}>Visit my {item.title} ↗</a>}
   <div className="bcv-page-miniature"><CategoryDrawing id={item.id}/></div>
   <span className="bcv-handwritten-foot">beyond work, beyond code.</span>
  </>}
 </div>;
}


