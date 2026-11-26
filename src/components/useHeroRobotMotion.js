import {useEffect} from 'react';

const ease=q=>q*q*(3-2*q);
const duration={waiting:3000,spawn:650,climbing:1700,walking:700,hesitating:850,takeoff:190,jumping:590,landing:220,sittingDown:650,resting:7000,standingUp:600,stumbling:650,falling:520,scattered:850,reassembling:3000,recovering:800,grasping:260,carrying:Infinity,dropping:600,returning:900};

// The controller owns travel; the renderer only owns the character's pose.
// Time advances only while the hero is visible, preserving interrupted gestures.
export default function useHeroRobotMotion({ready,root,hand,engine,audio,interaction,enteredAt}){
 useEffect(()=>{
  if(!ready)return;
  const host=root.current,hero=host.closest('#home'),word=hero.querySelector('.hero-tech-word'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,last=0,visible=false,robotVisible=false,alive=true,time=Math.min(2900,performance.now()-enteredAt.current),phase='waiting',index=0,target=0,next=0,direction=1,points=[],climbHeight=80,walkFrom=0,walkTo=0,clock=0,lastAttention=0,moodUntil=0,mood='curious',pointer=false,pokes=[],inviting=false,minX=0,maxX=Infinity,trustUntil=0,fearSide=1,mouse=null,headX=0,headY=0,parentTop=0,robotSize=72,jumpMs=590,gesture='wave',gestureStarted=0,nextMishap=28000+Math.random()*12000,mishap=false;
  let pendingHold=false,holdStarted=0,carryData=null,carryRecovery=false,reducedRepair=false,dropMs=600,greetingBottom=0,heroBottom=0,floorY=0,currentPosition={x:0,y:0};
  const surfaceY=(point,offset=0)=>{const column=Math.round(point.width*.53+offset);return point.y+(point.contour[Math.max(0,Math.min(point.contour.length-1,column))]-point.centerTop);};
  const contours=new Map();
  const position=(x,y)=>{
   const localX=Math.max(minX,Math.min(maxX,x));headX=localX-minX+robotSize*.528;headY=parentTop-window.scrollY+y+robotSize*.472;currentPosition={x:localX,y};host.style.transform=`translate3d(${localX}px,${y}px,0)`;
   if(inviting){const absoluteX=localX-minX+2,width=innerWidth<=600?208:228,left=Math.max(12-absoluteX,Math.min((robotSize-width)/2,innerWidth-12-width-absoluteX));host.style.setProperty('--robot-chat-left',left+'px');host.style.setProperty('--robot-chat-tail',Math.max(12,Math.min(width-20,robotSize/2-left))+'px');}
  };
  const enter=value=>{if(value==='resting'){gesture=['wave','stretch','think','peek','cheer'][Math.floor(Math.random()*5)];gestureStarted=clock;}if(value==='jumping'){const a=points[index],b=points[next];jumpMs=Math.max(430,Math.min(760,420+Math.abs(b.x-a.x)*1.4+Math.max(0,b.y-a.y)*.6));}phase=value;time=0;host.dataset.phase=value;host.dataset.letter=String(index);host.dataset.target=String(target);if(value==='jumping')audio.current?.play('jump',(index/6-.5)*.8);if(value==='landing')audio.current?.play('landing',(index/6-.5)*.8);if(value==='grasping')audio.current?.play('pickup');if(value==='dropping')audio.current?.play('drop');if(value==='falling')audio.current?.play(carryRecovery?'breakdown':'stumble');if(value==='reassembling')audio.current?.play('repair');};
  const chooseTarget=()=>{const choices=[0,1,2,3,4,5,6].filter(i=>i!==index);target=choices[Math.floor(Math.random()*choices.length)];direction=Math.sign(target-index);};
  const measure=()=>{
   if(!alive)return;const parent=host.parentElement.getBoundingClientRect(),letters=[...word.querySelectorAll('.text-roll-width')],baseline=word.querySelector('.hero-tech-baseline').getBoundingClientRect().top;
   greetingBottom=(hero.querySelector('.hero-greeting-line')||hero).getBoundingClientRect().bottom+scrollY;heroBottom=hero.getBoundingClientRect().bottom+scrollY;
   robotSize=host.offsetWidth||72;floorY=baseline-parent.top-robotSize*.9;parentTop=parent.top+window.scrollY;minX=2-parent.left;maxX=innerWidth-parent.left-robotSize-2;
   const style=getComputedStyle(word),ctx=document.createElement('canvas').getContext('2d');ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
   // Layout can move without the type changing. Reuse the expensive glyph
   // readback in that case; retain only the current font/size measurements.
   const fontKey=ctx.font;
   if(contours.font!==fontKey){contours.clear();contours.font=fontKey;}
   climbHeight=ctx.measureText('P').actualBoundingBoxAscent||parseFloat(style.fontSize)*.7;
   points=letters.slice(0,7).map((letter,i)=>{
    const rect=letter.getBoundingClientRect(),glyph='Portfolio'[i],metrics=ctx.measureText(glyph),ascent=metrics.actualBoundingBoxAscent||parseFloat(style.fontSize)*.7;
    const key=glyph+':'+rect.width,cached=contours.get(key);
    if(cached)return{x:rect.left-parent.left+rect.width*.53-robotSize*.5,y:baseline-parent.top+cached.centerTop-robotSize*(65/72),width:rect.width,...cached};
    const raster=document.createElement('canvas');raster.width=Math.ceil(Math.max(rect.width,metrics.width)+16);raster.height=Math.ceil(parseFloat(style.fontSize)*1.5+16);
    const ink=raster.getContext('2d',{willReadFrequently:true});ink.font=ctx.font;ink.fillText(glyph,8,ascent+8);
    const pixels=ink.getImageData(0,0,raster.width,raster.height).data,contour=[];
    for(let x=0;x<Math.ceil(rect.width)+1;x++){let top=0;for(let y=0;y<raster.height;y++){if(pixels[(y*raster.width+x+8)*4+3]>90){top=y-ascent-8;break;}}contour.push(top||-ascent);}
    const centerTop=contour[Math.min(contour.length-1,Math.round(rect.width*.53))];
    contours.set(key,{contour,centerTop});
    return{x:rect.left-parent.left+rect.width*.53-robotSize*.5,y:baseline-parent.top+centerTop-robotSize*(65/72),width:rect.width,contour,centerTop};
   });
   if(motion.matches&&points.length===7){index=6;host.style.opacity='1';enter('resting');position(points[6].x,points[6].y);engine.current?.setMotion({phase:'resting',progress:1,direction:0,mood:'happy'});}
  };
  const setMood=(value,ms)=>{mood=value;moodUntil=clock+ms;host.dataset.mood=value;if(motion.matches)wake();};
  const cancelHold=()=>{pendingHold=false;wake();};
  const startHold=()=>{
   if(!visible||!points.length||['waiting','falling','scattered','reassembling','recovering','dropping','returning','grasping','carrying'].includes(phase))return false;
   pendingHold=true;holdStarted=clock;wake();return true;
  };
  const pickUp=point=>{
   if(!pendingHold||!visible)return false;
   pendingHold=false;carryData={point,from:{...currentPosition},velocityX:0,lean:0,at:performance.now()};
   target=index;setMood('surprised',3000);enter('grasping');host.style.opacity='1';wake();return true;
  };
  const moveCarry=point=>{
   if(!carryData||!['grasping','carrying'].includes(phase))return;
   const now=performance.now(),dt=Math.max(12,now-carryData.at);
   carryData.velocityX=(point.x-carryData.point.x)/dt*1000;
   carryData.lean=Math.max(-1,Math.min(1,carryData.velocityX/850));carryData.point=point;carryData.at=now;wake();
  };
  const dropCarry=()=>{
   if(!carryData||!['grasping','carrying'].includes(phase))return;
   pendingHold=false;carryRecovery=true;host.dataset.carryRecovery='true';
   index=points.reduce((best,point,i)=>Math.abs(point.x-currentPosition.x)<Math.abs(points[best].x-currentPosition.x)?i:best,0);target=index;
   carryData.from={...currentPosition};carryData.floorX=currentPosition.x+Math.max(-28,Math.min(28,carryData.velocityX*.07));
   carryData.floorY=Math.min(heroBottom-parentTop-robotSize-18,Math.max(currentPosition.y+robotSize*.55,floorY));
   dropMs=Math.max(420,Math.min(900,Math.sqrt(Math.max(10,carryData.floorY-currentPosition.y)*2/1300)*1000));
   nextMishap=clock+60000;trustUntil=clock+30000;setMood('afraid',5000);
   reducedRepair=motion.matches;
   if(reducedRepair){carryData.floorX=currentPosition.x;carryData.floorY=currentPosition.y;}
   enter(reducedRepair?'reassembling':'dropping');wake();
  };
  const phaseDuration=()=>phase==='jumping'?jumpMs:phase==='dropping'?dropMs:reducedRepair&&phase==='reassembling'?300:duration[phase];
  const attention=event=>{
   if(event.pointerType&&event.pointerType!=='mouse')return;pointer=true;lastAttention=clock;
   const rect=host.getBoundingClientRect();fearSide=event.clientX<rect.left+rect.width/2?1:-1;
   audio.current?.play('touch',(index/6-.5)*.8);
   if(mood!=='angry'||clock>moodUntil)setMood(phase==='resting'&&clock>=trustUntil?'bashful':'happy',2800);if(phase==='resting'){gesture='peek';gestureStarted=clock;}
  };
  const leave=()=>{pointer=false;lastAttention=clock;};
  const follow=event=>{if(event.pointerType==='mouse'||event.pointerType==='pen')mouse={x:event.clientX,y:event.clientY};};
  const forget=()=>{mouse=null;};
  const poke=event=>{
   if(!event.target.closest('.intro-poster'))return;
   lastAttention=clock;trustUntil=clock+30000;pokes=pokes.filter(t=>clock-t<1600);pokes.push(clock);
   setMood(pokes.length>=3?'angry':pokes.length===2?'surprised':'delighted',pokes.length>=3?2400:2600);gesture=pokes.length>=3?'think':'cheer';gestureStarted=clock;
  };
  const beginWalk=()=>{walkFrom=0;walkTo=direction*Math.min(points[index].width*.22,20);enter('walking');};
  const transition=()=>{
   if(phase==='waiting')enter('spawn');
   else if(phase==='spawn')enter('climbing');
   else if(phase==='climbing'){target=Math.floor(Math.random()*7);if(target===index)enter('sittingDown');else{direction=Math.sign(target-index);beginWalk();}}
   else if(phase==='walking'){const drop=points[index+direction].y-surfaceY(points[index],walkTo);if(drop>Math.max(6,climbHeight*.1)){enter('hesitating');setMood('afraid',1000);}else enter('takeoff');}
   else if(phase==='hesitating')enter('takeoff');
   else if(phase==='takeoff'){next=index+direction;enter('jumping');}
   else if(phase==='jumping'){index=next;enter('landing');}
   else if(phase==='landing'){if(inviting)target=index;if(index===target)enter('sittingDown');else beginWalk();}
   else if(phase==='sittingDown'){enter('resting');setMood('happy',1800);}
   else if(phase==='resting'){mishap=!inviting&&!pointer&&clock>nextMishap&&Math.random()<.35;if(mishap){nextMishap=clock+50000+Math.random()*30000;setMood('surprised',5000);}else chooseTarget();enter('standingUp');}
   else if(phase==='standingUp'){if(mishap)enter('stumbling');else beginWalk();}
   else if(phase==='stumbling')enter('falling');
   else if(phase==='dropping')enter('falling');
   else if(phase==='falling')enter('scattered');
   else if(phase==='scattered')enter('reassembling');
   else if(phase==='reassembling'){
    if(reducedRepair){reducedRepair=false;carryRecovery=false;carryData=null;delete host.dataset.carryRecovery;index=6;target=6;enter('resting');setMood('proud',3000);}
    else{setMood('proud',3200);enter('recovering');}
   }
   else if(phase==='recovering'){mishap=false;target=index;if(carryRecovery){carryData.returnFrom={...currentPosition};enter('returning');}else enter('sittingDown');}
   else if(phase==='returning'){carryRecovery=false;carryData=null;delete host.dataset.carryRecovery;enter('landing');}
  };
  const paint=now=>{
   frame=0;if(!visible||document.hidden||!alive)return;
   const dt=last?Math.min(now-last,50):0;last=now;clock+=dt;
   if(pendingHold){
    position(currentPosition.x,currentPosition.y);engine.current?.setMotion({phase:'holding',progress:Math.min(1,(clock-holdStarted)/2000),direction:0,mood:'curious'});
    frame=requestAnimationFrame(paint);return;
   }
   if(carryData&&['grasping','carrying'].includes(phase)){
    const point=carryData.point;
    hand.current.style.transform=`translate3d(${point.x-16}px,${point.y-14}px,0)`;
    const upper=greetingBottom-scrollY+4,lower=heroBottom-scrollY-robotSize-42;
    if(point.y<=upper||point.y>=lower||point.x<2||point.x>innerWidth-2)dropCarry();
    else{
     time+=dt;if(phase==='grasping'&&time>=duration.grasping)enter('carrying');
     const q=motion.matches?1:phase==='grasping'?ease(Math.min(1,time/duration.grasping)):1;
     const x=point.x-(2-minX)-robotSize*.5,y=point.y-(parentTop-scrollY)+12;
     position(carryData.from.x+(x-carryData.from.x)*q,carryData.from.y+(y-carryData.from.y)*q);
     engine.current?.setMotion({phase,progress:q,direction:0,mood:'surprised',carryLean:motion.matches?0:carryData.lean});
     frame=requestAnimationFrame(paint);return;
    }
   }
   // Invitation/video interactions hold the current position and never interrupt a jump.
   const busy=inviting;
   const radius=Math.min(180,innerWidth*.28),dx=mouse?mouse.x-headX:0,dy=mouse?mouse.y-headY:0,near=Boolean(mouse)&&phase==='resting'&&!busy&&Math.hypot(dx,dy)<radius;
   if(near&&!busy&&clock>=trustUntil&&mood!=='angry'){mood='bashful';fearSide=dx<0?1:-1;host.dataset.mood=mood;}
   const hold=(pointer||busy)&&phase==='resting';if(!hold)time+=dt;
   if(clock>moodUntil){if(clock-lastAttention>18000&&!pointer&&!near&&!busy){setMood('sleepy',2600);lastAttention=clock;}else{mood=(pointer||near)?(clock>=trustUntil?'afraid':'happy'):'curious';host.dataset.mood=mood;}}
   if(points.length===7){
    if(motion.matches&&!reducedRepair){if(phase!=='resting'||index!==6){index=6;enter('resting');}host.style.opacity='1';position(points[6].x,points[6].y);engine.current?.setMotion({phase:'resting',progress:1,direction:0,mood});return;}
    if(time>=phaseDuration())transition();
    const q=Math.min(1,time/phaseDuration()),p=points[index];let x=p.x,y=p.y;
    if(carryRecovery&&carryData&&['dropping','falling','scattered','reassembling','recovering','returning'].includes(phase)){
     x=carryData.floorX;y=carryData.floorY;
     if(phase==='dropping'){x=carryData.from.x+(carryData.floorX-carryData.from.x)*q;y=carryData.from.y+(carryData.floorY-carryData.from.y)*q*q;}
     else if(phase==='returning'){const a=carryData.returnFrom;x=a.x+(p.x-a.x)*q;y=a.y+(p.y-a.y)*q-4*q*(1-q)*robotSize*.7;}
    }else if(phase==='spawn'||phase==='climbing'){
     const progress=phase==='spawn'?0:ease(q);x=p.x-18*(1-progress);y=p.y+climbHeight*(1-progress);
     if(phase==='spawn'){x-=24*(1-ease(q));y+=14*(1-ease(q));host.style.opacity=String(ease(q));}else host.style.opacity='1';
    }else if(phase==='walking'){const offset=walkFrom+(walkTo-walkFrom)*ease(q);x+=offset;y=surfaceY(p,offset);}
    else if(phase==='hesitating'){x+=walkTo-direction*Math.sin(q*Math.PI)*2;y=surfaceY(p,walkTo);}
    else if(phase==='takeoff'){x+=walkTo;y=surfaceY(p,walkTo)+Math.sin(q*Math.PI/2)*2;}
    else if(phase==='jumping'){
     const a=points[index],b=points[next],travel=q;x=a.x+walkTo+(b.x-a.x-walkTo)*travel;
     const launchY=surfaceY(a,walkTo)+2;
     y=launchY+(b.y-launchY)*q-4*q*(1-q)*Math.min(robotSize*.48,Math.max(robotSize*.21,Math.abs(b.x-a.x)*.3));
    }else if(phase==='landing'){y+=Math.sin(q*Math.PI)*2;}
    else if(phase==='falling'){y+=ease(q)*robotSize*.12;}
    else if(phase==='scattered'){y+=robotSize*.12;}
    else if(phase==='reassembling'){y+=(1-ease(q))*robotSize*.12;}
    position(x,y);engine.current?.setMotion({phase,progress:q,direction,mood,fearSide,cursorX:near?dx/radius:0,cursorY:near?dy/radius:0,tracking:near,gesture:busy?'listen':gesture,gestureProgress:Math.min(1,(clock-gestureStarted)/2600)});
   }
   frame=requestAnimationFrame(paint);
  };
  const wake=()=>{last=0;if(!frame&&visible&&!document.hidden&&alive)frame=requestAnimationFrame(paint);};
  const sync=()=>{if(document.hidden){pendingHold=false;dropCarry();cancelAnimationFrame(frame);frame=0;engine.current?.setVisible(false);}else{engine.current?.setVisible(visible);wake();}};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;audio.current?.setVisible(visible&&robotVisible);engine.current?.setVisible(visible);if(visible)wake();else{pendingHold=false;dropCarry();cancelAnimationFrame(frame);frame=0;}},{threshold:0});observer.observe(hero);
  const soundScope=new IntersectionObserver(([entry])=>{robotVisible=entry.isIntersecting;audio.current?.setVisible(visible&&robotVisible);});soundScope.observe(host);
  const resize=new ResizeObserver(measure);resize.observe(word);measure();document.fonts.ready.then(measure);
  const updateInvitation=()=>{inviting=Boolean(host.dataset.conversation)||Boolean(host.querySelector('.intro-robot-bubble-ask'))||Boolean(document.querySelector('.intro-video-overlay'));if(motion.matches)wake();};
  const invitationChanges=new MutationObserver(updateInvitation);invitationChanges.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['data-conversation']});invitationChanges.observe(document.body,{childList:true});updateInvitation();
  document.addEventListener('pointermove',follow,{passive:true});document.documentElement.addEventListener('pointerleave',forget);
  host.addEventListener('pointerenter',attention);host.addEventListener('pointerleave',leave);host.addEventListener('click',poke);
  const motionChange=()=>{pendingHold=false;dropCarry();measure();wake();};
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',motionChange);
  interaction.current={startHold,cancelHold,pickUp,moveCarry,dropCarry,getState:()=>({phase,index,target,mood}),attention:()=>{lastAttention=clock;setMood('happy',2500);}};
  return()=>{alive=false;interaction.current=null;cancelAnimationFrame(frame);observer.disconnect();soundScope.disconnect();audio.current?.setVisible(false);resize.disconnect();invitationChanges.disconnect();document.removeEventListener('pointermove',follow);document.documentElement.removeEventListener('pointerleave',forget);host.removeEventListener('pointerenter',attention);host.removeEventListener('pointerleave',leave);host.removeEventListener('click',poke);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',motionChange);};
 },[ready,root,hand,engine,audio,interaction,enteredAt]);
}

