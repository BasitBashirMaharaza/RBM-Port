import {useEffect} from 'react';

// Long-press ownership stays separate from ordinary robot clicks and chat.
export default function useRobotCarry({ready,root,hand,interaction,onPickUp}){
 useEffect(()=>{
  if(!ready)return;
  const host=root.current,button=host.querySelector('.intro-poster');
  let grip=null,timer=0,suppressUntil=0;
  const clear=(drop=false)=>{
   clearTimeout(timer);timer=0;
   const current=grip;grip=null;
   delete host.dataset.holding;
   document.documentElement.classList.remove('robot-carry-active');
   if(current?.picked){suppressUntil=performance.now()+800;if(drop)interaction.current?.dropCarry();}
   else interaction.current?.cancelHold();
   if(current&&button.hasPointerCapture(current.id)){try{button.releasePointerCapture(current.id);}catch{}}
  };
  const down=event=>{
   if(!event.isPrimary||event.button!==0||!event.target.closest('.intro-poster')||grip)return;
   if(document.querySelector('.intro-video-overlay,.robot-quote-dialog[open]')||!interaction.current?.startHold())return;
   grip={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,picked:false};
   host.dataset.holding='pending';
   try{button.setPointerCapture(event.pointerId);}catch{}
   timer=setTimeout(()=>{
    timer=0;if(!grip||document.hidden){clear();return;}
    if(!interaction.current?.pickUp({x:grip.x,y:grip.y})){clear();return;}
    grip.picked=true;suppressUntil=performance.now()+800;
    delete host.dataset.holding;document.documentElement.classList.add('robot-carry-active');
    hand.current.style.transform=`translate3d(${grip.x-16}px,${grip.y-14}px,0)`;
    onPickUp();
   },2000);
  };
  const move=event=>{
   if(!grip||event.pointerId!==grip.id)return;
   grip.x=event.clientX;grip.y=event.clientY;
   if(grip.picked)interaction.current?.moveCarry({x:grip.x,y:grip.y});
   else if(Math.hypot(grip.x-grip.startX,grip.y-grip.startY)>20)clear();
  };
  const up=event=>{if(grip&&event.pointerId===grip.id)clear(grip.picked);};
  const abort=()=>clear(Boolean(grip?.picked));
  const hidden=()=>{if(document.hidden)abort();};
  const keys=event=>{if(grip&&(event.key==='Escape'||event.key==='Tab')){if(event.key==='Escape')event.preventDefault();abort();}};
  const click=event=>{if(grip?.picked||performance.now()<suppressUntil||host.dataset.carryRecovery==='true'){event.preventDefault();event.stopPropagation();}};
  const context=event=>{if(grip)event.preventDefault();};
  const phase=new MutationObserver(()=>{if(grip?.picked&&!['grasping','carrying'].includes(host.dataset.phase))clear();});phase.observe(host,{attributes:true,attributeFilter:['data-phase']});
  host.addEventListener('pointerdown',down,true);host.addEventListener('click',click,true);host.addEventListener('contextmenu',context);
  document.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);button.addEventListener('lostpointercapture',up);
  window.addEventListener('blur',abort);window.addEventListener('resize',abort);document.addEventListener('visibilitychange',hidden);document.addEventListener('keydown',keys);
  return()=>{clear();phase.disconnect();host.removeEventListener('pointerdown',down,true);host.removeEventListener('click',click,true);host.removeEventListener('contextmenu',context);document.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);button.removeEventListener('lostpointercapture',up);window.removeEventListener('blur',abort);window.removeEventListener('resize',abort);document.removeEventListener('visibilitychange',hidden);document.removeEventListener('keydown',keys);};
 },[ready,root,hand,interaction,onPickUp]);
}
