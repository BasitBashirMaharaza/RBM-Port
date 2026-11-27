import {useEffect,useRef,useState} from 'react';
import LearningComputerIntro from './LearningComputerIntro.jsx';
import LearningDesktop from './LearningDesktop.jsx';
import {unlockLearningSound,disposeLearningSound} from './learningSound.js';
import './learning-desktop.css';

export default function LearningGallery(props){
 const root=useRef(null),readyRef=useRef(false),[ready,setReady]=useState(false),[visible,setVisible]=useState(false);
 readyRef.current=ready;
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{setVisible(entry.isIntersecting);if(!entry.isIntersecting&&readyRef.current)setReady(false)},{threshold:[0,.1]});observer.observe(root.current);return()=>{observer.disconnect();disposeLearningSound()}},[]);
 return <section id='education' ref={root} className='learning-gallery-section learning-desktop-section' data-entrance={ready?'done':'booting'} data-in-view={visible?true:undefined} aria-labelledby='learning-gallery-title' onPointerDownCapture={unlockLearningSound} onKeyDownCapture={unlockLearningSound}>
  <h2 id='learning-gallery-title' className='sr-only'>Education & capabilities</h2><span id='toolkit' className='ld-deep-link' aria-hidden='true'/>
  {!ready&&<LearningComputerIntro sectionRef={root} onComplete={()=>setReady(true)}/>}
  <div className='ld-section-header'><span>EDUCATION & CAPABILITIES</span><div><span>A desktop of things learned.</span><button type='button' className='ld-replay-intro' onClick={()=>setReady(false)} aria-label='Replay computer opening'>↺ <span>Replay opening</span></button></div></div>
  <div className='ld-computer-stage' inert={!ready}><LearningDesktop {...props} ready={ready} visible={visible}/></div>
  <p className='ld-section-hint'><span className='ld-mouse-hint'>Double-click a file to open · Enter works too</span><span className='ld-touch-hint'>Tap a file to open</span></p>
 </section>;
}
