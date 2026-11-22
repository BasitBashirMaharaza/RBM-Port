import {useEffect,useState} from 'react';
import {monitorPowerSound} from './learningSound.js';
import LearningScreensaver from './LearningScreensaver.jsx';
import './retro-learning-frame.css';

export default function RetroLearningFrame({children,active,label='Learning',logo,kind}){
 const [mode,setMode]=useState('content');
 useEffect(()=>{
  if(mode!=='powering-off'&&mode!=='powering-on')return;
  const timer=setTimeout(()=>setMode(mode==='powering-off'?'screensaver':'content'),matchMedia('(prefers-reduced-motion: reduce)').matches?0:mode==='powering-off'?280:420);
  return()=>clearTimeout(timer);
 },[mode]);
 const standby=mode==='powering-off'||mode==='screensaver';
 const toggle=event=>{event.stopPropagation();const powerOn=standby;monitorPowerSound(powerOn);setMode(powerOn?'powering-on':'powering-off');};
 return <div className="lg-monitor" data-active={active} data-mode={mode}>
  <div className="lg-monitor-casing" aria-hidden="true"><span className="lg-monitor-vents"/><span className="lg-monitor-name">LEARN / BUILD</span><span className="lg-monitor-power"/></div>
  <div className="lg-monitor-screen">
   <div className="lg-monitor-content" inert={mode!=='content'} aria-hidden={mode!=='content'}>{children}</div>
   <span className="lg-monitor-standby" aria-hidden="true"/>
   {mode==='screensaver'&&<LearningScreensaver active={active} label={label} logo={logo} kind={kind}/>}
   <span className="lg-monitor-glass" aria-hidden="true"/><span className="lg-monitor-startup" aria-hidden="true"><span className="lg-monitor-sync">SIGNAL LOCK<i/></span></span>
  </div>
  <button type="button" className="lg-monitor-button" data-monitor-power data-sound="silent" disabled={!active} tabIndex={active?0:-1} aria-pressed={standby} aria-label={standby?`Restore ${label} screen`:`Start ${label} screensaver`} title={standby?'Power on':'Screensaver'} onPointerDown={event=>event.stopPropagation()} onClick={toggle}><span className="sr-only">Power</span></button>
  <span className="lg-monitor-foot" aria-hidden="true"/>
 </div>;
}
