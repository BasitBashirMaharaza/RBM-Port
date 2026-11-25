import {useEffect} from 'react';

const ease=q=>q*q*(3-2*q);
const duration={waiting:3000,spawn:650,climbing:1700,walking:700,hesitating:850,takeoff:190,jumping:590,landing:220,sittingDown:650,resting:7000,standingUp:600};

// The controller owns travel; the renderer only owns the character's pose.
// Time advances only while the hero is visible, preserving interrupted gestures.
export default function useHeroRobotMotion({ready,root,engine,audio,interaction,enteredAt}){
 useEffect(()=>{
  if(!ready)return;
  const host=root.current,hero=host.closest('#home'),word=hero.querySelector('.hero-tech-word'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,last=0,visible=false,robotVisible=false,alive=true,time=Math.min(2900,performance.now()-enteredAt.current),phase='waiting',index=0,target=0,next=0,direction=1,points=[],climbHeight=80,walkFrom=0,walkTo=0,clock=0,lastAttention=0,moodUntil=0,mood='curious',pointer=false,pokes=[],inviting=false,minX=0,maxX=Infinity,trustUntil=0,fearSide=1,mouse=null,headX=0,headY=0,parentTop=0;
  const surfaceY=(point,offset=0)=>{const column=Math.round(point.width*.53+offset);return point.y+(point.contour[Math.max(0,Math.min(point.contour.length-1,column))]-point.centerTop);};
  const contours=new Map();
  const position=(x,y)=>{
   const localX=Math.max(minX,Math.min(maxX,x));headX=localX-minX+38;headY=parentTop-window.scrollY+y+34;host.style.transform=`translate3d(${localX}px,${y}px,0)`;
   if(inviting){const absoluteX=localX-minX+2,width=innerWidth<=600?208:228,left=Math.max(12-absoluteX,Math.min((72-width)/2,innerWidth-12-width-absoluteX));host.style.setProperty('--robot-chat-left',left+'px');host.style.setProperty('--robot-chat-tail',Math.max(12,Math.min(width-20,36-left))+'px');}
  };
  const enter=value=>{phase=value;time=0;host.dataset.phase=value;host.dataset.letter=String(index);host.dataset.target=String(target);if(value==='jumping')audio.current?.play('jump',(index/6-.5)*.8);if(value==='landing')audio.current?.play('landing',(index/6-.5)*.8);};
  const chooseTarget=()=>{const choices=[0,1,2,3,4,5,6].filter(i=>i!==index);target=choices[Math.floor(Math.random()*choices.length)];direction=Math.sign(target-index);};
  const measure=()=>{
   if(!alive)return;const parent=host.parentElement.getBoundingClientRect(),letters=[...word.querySelectorAll('.text-roll-width')],baseline=word.querySelector('.hero-tech-baseline').getBoundingClientRect().top;
   parentTop=parent.top+window.scrollY;minX=2-parent.left;maxX=innerWidth-parent.left-74;
   const style=getComputedStyle(word),ctx=document.createElement('canvas').getContext('2d');ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
   // Layout can move without the type changing. Reuse the expensive glyph
   // readback in that case; retain only the current font/size measurements.
   const fontKey=ctx.font;
   if(contours.font!==fontKey){contours.clear();contours.font=fontKey;}
   climbHeight=ctx.measureText('P').actualBoundingBoxAscent||parseFloat(style.fontSize)*.7;
   points=letters.slice(0,7).map((letter,i)=>{
    const rect=letter.getBoundingClientRect(),glyph='Portfolio'[i],metrics=ctx.measureText(glyph),ascent=metrics.actualBoundingBoxAscent||parseFloat(style.fontSize)*.7;
    const key=glyph+':'+rect.width,cached=contours.get(key);
    if(cached)return{x:rect.left-parent.left+rect.width*.53-36,y:baseline-parent.top+cached.centerTop-65,width:rect.width,...cached};
    const raster=document.createElement('canvas');raster.width=Math.ceil(Math.max(rect.width,metrics.width)+16);raster.height=Math.ceil(parseFloat(style.fontSize)*1.5+16);
    const ink=raster.getContext('2d',{willReadFrequently:true});ink.font=ctx.font;ink.fillText(glyph,8,ascent+8);
    const pixels=ink.getImageData(0,0,raster.width,raster.height).data,contour=[];
    for(let x=0;x<Math.ceil(rect.width)+1;x++){let top=0;for(let y=0;y<raster.height;y++){if(pixels[(y*raster.width+x+8)*4+3]>90){top=y-ascent-8;break;}}contour.push(top||-ascent);}
    const centerTop=contour[Math.min(contour.length-1,Math.round(rect.width*.53))];
    contours.set(key,{contour,centerTop});
    return{x:rect.left-parent.left+rect.width*.53-36,y:baseline-parent.top+centerTop-65,width:rect.width,contour,centerTop};
   });
   if(motion.matches&&points.length===7){index=6;host.style.opacity='1';enter('resting');position(points[6].x,points[6].y);engine.current?.setMotion({phase:'resting',progress:1,direction:0,mood:'happy'});}
  };
  const setMood=(value,ms)=>{mood=value;moodUntil=clock+ms;host.dataset.mood=value;if(motion.matches)wake();};
  const attention=event=>{
   if(event.pointerType&&event.pointerType!=='mouse')return;pointer=true;lastAttention=clock;
   const rect=host.getBoundingClientRect();fearSide=event.clientX<rect.left+rect.width/2?1:-1;
   audio.current?.play('touch',(index/6-.5)*.8);
   if(mood!=='angry'||clock>moodUntil)setMood(phase==='resting'&&clock>=trustUntil?'afraid':'happy',2800);
  };
  const leave=()=>{pointer=false;lastAttention=clock;};
  const follow=event=>{if(event.pointerType==='mouse'||event.pointerType==='pen')mouse={x:event.clientX,y:event.clientY};};
  const forget=()=>{mouse=null;};
  const poke=event=>{
   if(!event.target.closest('.intro-poster'))return;
   lastAttention=clock;trustUntil=clock+30000;pokes=pokes.filter(t=>clock-t<1600);pokes.push(clock);
   setMood(pokes.length>=3?'angry':'happy',pokes.length>=3?2400:2600);
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
   else if(phase==='resting'){chooseTarget();enter('standingUp');}
   else if(phase==='standingUp')beginWalk();
  };
  const paint=now=>{
   frame=0;if(!visible||document.hidden||!alive)return;
   const dt=last?Math.min(now-last,50):0;last=now;clock+=dt;
   // Invitation/video interactions hold the current position and never interrupt a jump.
   const busy=inviting;
   const radius=Math.min(180,innerWidth*.28),dx=mouse?mouse.x-headX:0,dy=mouse?mouse.y-headY:0,near=Boolean(mouse)&&phase==='resting'&&!busy&&Math.hypot(dx,dy)<radius;
   if(near&&!busy&&clock>=trustUntil&&mood!=='angry'){mood='afraid';fearSide=dx<0?1:-1;host.dataset.mood=mood;}
   const hold=(pointer||busy)&&phase==='resting';if(!hold)time+=dt;
   if(clock>moodUntil){if(clock-lastAttention>18000&&!pointer&&!near&&!busy){setMood('sad',2600);lastAttention=clock;}else{mood=(pointer||near)?(clock>=trustUntil?'afraid':'happy'):'curious';host.dataset.mood=mood;}}
   if(points.length===7){
    if(motion.matches){if(phase!=='resting'||index!==6){index=6;enter('resting');}host.style.opacity='1';position(points[6].x,points[6].y);engine.current?.setMotion({phase:'resting',progress:1,direction:0,mood});return;}
    if(time>=duration[phase])transition();
    const q=Math.min(1,time/duration[phase]),p=points[index];let x=p.x,y=p.y;
    if(phase==='spawn'||phase==='climbing'){
     const progress=phase==='spawn'?0:ease(q);x=p.x-18*(1-progress);y=p.y+climbHeight*(1-progress);
     if(phase==='spawn'){x-=24*(1-ease(q));y+=14*(1-ease(q));host.style.opacity=String(ease(q));}else host.style.opacity='1';
    }else if(phase==='walking'){const offset=walkFrom+(walkTo-walkFrom)*ease(q);x+=offset;y=surfaceY(p,offset);}
    else if(phase==='hesitating'){x+=walkTo-direction*Math.sin(q*Math.PI)*2;y=surfaceY(p,walkTo);}
    else if(phase==='takeoff'){x+=walkTo;y=surfaceY(p,walkTo)+Math.sin(q*Math.PI/2)*2;}
    else if(phase==='jumping'){
     const a=points[index],b=points[next],travel=ease(q);x=a.x+walkTo+(b.x-a.x-walkTo)*travel;
     y=surfaceY(a,walkTo)+(b.y-surfaceY(a,walkTo))*q-Math.sin(q*Math.PI)*Math.min(34,Math.max(16,Math.abs(b.x-a.x)*.32));
    }else if(phase==='landing'){y+=Math.sin(q*Math.PI)*2.5;}
    position(x,y);engine.current?.setMotion({phase,progress:q,direction,mood,fearSide,cursorX:near?dx/radius:0,cursorY:near?dy/radius:0,tracking:near});
   }
   frame=requestAnimationFrame(paint);
  };
  const wake=()=>{last=0;if(!frame&&visible&&!document.hidden&&alive)frame=requestAnimationFrame(paint);};
  const sync=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;engine.current?.setVisible(false);}else{engine.current?.setVisible(visible);wake();}};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;audio.current?.setVisible(visible&&robotVisible);engine.current?.setVisible(visible);if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0});observer.observe(hero);
  const soundScope=new IntersectionObserver(([entry])=>{robotVisible=entry.isIntersecting;audio.current?.setVisible(visible&&robotVisible);});soundScope.observe(host);
  const resize=new ResizeObserver(measure);resize.observe(word);measure();document.fonts.ready.then(measure);
  const updateInvitation=()=>{inviting=Boolean(host.dataset.conversation)||Boolean(host.querySelector('.intro-robot-bubble-ask'))||Boolean(document.querySelector('.intro-video-overlay'));if(motion.matches)wake();};
  const invitationChanges=new MutationObserver(updateInvitation);invitationChanges.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['data-conversation']});invitationChanges.observe(document.body,{childList:true});updateInvitation();
  document.addEventListener('pointermove',follow,{passive:true});document.documentElement.addEventListener('pointerleave',forget);
  host.addEventListener('pointerenter',attention);host.addEventListener('pointerleave',leave);host.addEventListener('click',poke);
  const motionChange=()=>{measure();wake();};
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',motionChange);
  interaction.current={getState:()=>({phase,index,target,mood}),attention:()=>{lastAttention=clock;setMood('happy',2500);}};
  return()=>{alive=false;interaction.current=null;cancelAnimationFrame(frame);observer.disconnect();soundScope.disconnect();audio.current?.setVisible(false);resize.disconnect();invitationChanges.disconnect();document.removeEventListener('pointermove',follow);document.documentElement.removeEventListener('pointerleave',forget);host.removeEventListener('pointerenter',attention);host.removeEventListener('pointerleave',leave);host.removeEventListener('click',poke);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',motionChange);};
 },[ready,root,engine,audio,interaction,enteredAt]);
}

