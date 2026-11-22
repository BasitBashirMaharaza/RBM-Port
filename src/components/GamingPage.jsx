import {useRef} from 'react';
import {GameCartridge,useGameMotion} from './GameHardware.jsx';
import './gaming-book.css';
const leaves=[
 {start:0,end:4,label:'UBISOFT / FIELD COLLECTION',title:'Far from ordinary.',note:'Far Cry 3 · Blood Dragon · Far Cry 4 · Primal'},
 {start:4,end:7,label:'UBISOFT / COLLECTION CONTINUED',title:'The next frontier.',note:'Far Cry 5 · New Dawn · Far Cry 6'},
 {start:7,end:11,label:'THE PERSONAL SAVE FILE',title:'Other worlds.',note:'Battlegrounds, magic, samurai and Norse mythology.'},
 {start:11,end:14,label:'THE PERSONAL SAVE FILE / CONTINUED',title:'One more chapter.',note:'Ragnarök, Los Santos and a connected Chicago.'},
];
export default function GamingPage({item,spread,side,interactive=true,onGameSelect}){
 const root=useRef(null),leaf=spread*2+(side==='left'?0:1),page=leaves[leaf];useGameMotion(root,interactive);
 return <div ref={root} className={'bcv-paper-page bcv-gaming-page gaming-leaf-'+leaf}>
  <span className="bcv-page-folio">{String(leaf+1).padStart(2,'0')}</span>
  <header className="bcv-gaming-header"><span className="bcv-page-eyebrow">{page.label}</span><h3>{page.title}</h3><p>{page.note}</p></header>
  <div className="bcv-game-inventory" data-count={page.end-page.start} aria-label={'Game collection: '+page.title}>
   {item.entries.slice(page.start,page.end).map((game,index)=><GameCartridge key={game.id} game={game} index={page.start+index} interactive={interactive} onSelect={onGameSelect}/>)}
  </div>
  <div className="bcv-gaming-footer"><span>{String(page.start+1).padStart(2,'0')}—{String(page.end).padStart(2,'0')} / 14 GAMES</span><span>SELECT A CARTRIDGE ↗</span></div>
 </div>;
}
