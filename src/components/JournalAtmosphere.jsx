import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// One low-resolution, section-scoped canvas. Decorative marks never receive input.
export default function JournalAtmosphere({ journalRef, bookRef }) {
  const [host,setHost]=useState(null);
  const canvas=useRef(null);
  useEffect(()=>{setHost(journalRef.current?.closest('#experience')||null);},[journalRef]);
  useEffect(()=>{
    const node=canvas.current;
    if(!host||!node) return undefined;
    const ctx=node.getContext('2d');
    if(!ctx) return undefined;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,last=0,time=0,visible=false,dirty=true,seeded=false;
    let width=0,height=0,scale=1,stars=[],sprites=[],accent='',ink='';
    let goal={x:0,y:0,width:0,height:0},book={...goal};
    const random=seed=>{const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n);};
    const updatePalette=()=>{
      const styles=getComputedStyle(host);
      accent=styles.getPropertyValue('--accent').trim();
      ink=styles.getPropertyValue('--muted').trim();
      const dark=document.documentElement.dataset.theme==='dark';
      sprites=[accent,ink,dark?'#d9d5bc':'#9c8761'].map(color=>{
        const sprite=document.createElement('canvas');sprite.width=sprite.height=28;
        const brush=sprite.getContext('2d');
        const glow=brush.createRadialGradient(14,14,0,14,14,14);
        glow.addColorStop(0,color);glow.addColorStop(.12,color);glow.addColorStop(1,'transparent');
        brush.fillStyle=glow;brush.fillRect(0,0,28,28);return sprite;
      });
    };
    const measure=()=>{
      dirty=false;
      const bounds=host.getBoundingClientRect();width=bounds.width;height=bounds.height;
      scale=Math.min(devicePixelRatio||1,1.25,1440/Math.max(1,width));
      const w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
      if(node.width!==w||node.height!==h){node.width=w;node.height=h;}
      ctx.setTransform(scale,0,0,scale,0,0);
      const element=bookRef.current;
      const board=element?.classList.contains('is-closed')?element.querySelector('.journal-base-right')
        :element?.classList.contains('is-back-closed')?element.querySelector('.journal-base-left'):element;
      const rect=board?.getBoundingClientRect();
      goal=rect?{x:rect.left-bounds.left,y:rect.top-bounds.top,width:rect.width,height:rect.height}
        :{x:width*.2,y:height*.3,width:width*.6,height:height*.5};
      if(!seeded||preference.matches) book={...goal};
      const count=width<600?22:34;
      if(stars.length!==count) stars=Array.from({length:count},(_,i)=>({
        edge:i%4,along:random(i+1),distance:16+random(i+13)*110,
        phase:random(i+18)*Math.PI*2,radius:i%5===0?3.3:1.15+random(i+56)*1.1,
      }));
      seeded=true;
    };
    const draw=()=>{
      if(dirty) measure();
      ctx.clearRect(0,0,width,height);
      const reduced=preference.matches,dark=document.documentElement.dataset.theme==='dark';
      if(!reduced) ['x','y','width','height'].forEach(key=>{book[key]+=(goal[key]-book[key])*.08;});
      // Four-point stars and sharp little glints replace the old dust particles.
      stars.forEach((star,index)=>{
        const distance=star.distance;
        let x,y;
        if(star.edge===0){x=book.x+star.along*book.width;y=book.y-distance;}
        else if(star.edge===1){x=book.x+book.width+distance;y=book.y+star.along*book.height;}
        else if(star.edge===2){x=book.x+star.along*book.width;y=book.y+book.height+distance;}
        else{x=book.x-distance;y=book.y+star.along*book.height;}
        if(x<7||x>width-7||y<12||y>height-12)return;
        const twinkle=reduced ? .7 : .48+.42*Math.pow((1+Math.sin(time*.75+star.phase))*.5,3);
        const radius=star.radius*(reduced?1:.85+.15*Math.sin(time*.55+star.phase));
        ctx.globalAlpha=(dark ? .72 : .36)*twinkle;ctx.strokeStyle=index%3?ink:accent;ctx.lineWidth=.65;
        ctx.beginPath();ctx.moveTo(x,y-radius);ctx.quadraticCurveTo(x+.3,y-.3,x+radius,y);
        ctx.quadraticCurveTo(x+.3,y+.3,x,y+radius);ctx.quadraticCurveTo(x-.3,y+.3,x-radius,y);
        ctx.quadraticCurveTo(x-.3,y-.3,x,y-radius);ctx.stroke();
      });
      const mx=Math.min(width-31,book.x+book.width+37),my=Math.max(38,book.y-70);
      if(dark){
        ctx.globalAlpha=.08;ctx.drawImage(sprites[2],mx-30,my-30,60,60);
        ctx.save();ctx.translate(mx,my);ctx.globalAlpha=.7;ctx.fillStyle='#d2cbb1';
        ctx.beginPath();ctx.moveTo(0,-13);ctx.bezierCurveTo(-12,-13,-16,-1,-10,8);
        ctx.bezierCurveTo(-4,17,10,15,13,4);ctx.bezierCurveTo(3,9,-6,0,0,-13);ctx.fill();ctx.restore();
      }else{
        ctx.globalAlpha=.6;ctx.fillStyle='#b69a5a';ctx.strokeStyle='#a78f56';ctx.lineWidth=.85;
        ctx.beginPath();ctx.arc(mx,my,9,0,Math.PI*2);ctx.fill();
        for(let ray=0;ray<8;ray++){
          const angle=ray*Math.PI/4+(reduced?0:time*.018);
          ctx.beginPath();ctx.moveTo(mx+Math.cos(angle)*13,my+Math.sin(angle)*13);
          ctx.lineTo(mx+Math.cos(angle)*17,my+Math.sin(angle)*17);ctx.stroke();
        }
        [0,1].forEach(index=>{
          const x=mx-26-index*27+(reduced?0:Math.sin(time*.08+index)*5),y=my+14-index*21;
          ctx.save();ctx.translate(x,y);ctx.scale(index ? .7 : 1,index ? .7 : 1);
          ctx.globalAlpha=.55;ctx.fillStyle='#f5f4eb';ctx.strokeStyle=ink;ctx.lineWidth=.65;
          ctx.beginPath();ctx.moveTo(-19,4);ctx.bezierCurveTo(-27,-4,-16,-14,-8,-7);
          ctx.bezierCurveTo(-4,-18,11,-15,12,-5);ctx.bezierCurveTo(24,-9,28,6,17,7);
          ctx.lineTo(-15,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
        });
      }
      // A staggered flock follows a curved flight path toward the celestial mark.
      const birdCount=width<600?5:8;
      for(let i=0;i<birdCount;i++){
        const progress=reduced?(i+1)/(birdCount+1):(time/(20+i*.7)+i/birdCount)%1;
        const startX=Math.max(18,book.x-70),startY=book.y-18-random(i+90)*85;
        const x=startX+(mx-startX-18)*progress;
        const y=startY+(my+12-startY)*progress-Math.sin(progress*Math.PI)*(18+random(i+42)*18);
        const size=3.8+random(i+30)*1.8,wing=reduced?2:1.5+Math.sin(time*4.4+i*1.7)*1.65;
        const fade=reduced?1:Math.min(1,progress/.12,(1-progress)/.12);
        ctx.save();ctx.translate(x,y);ctx.rotate(-.1);
        ctx.globalAlpha=(dark ? .5 : .4)*Math.max(0,fade);ctx.strokeStyle=ink;ctx.lineWidth=.9;
        ctx.beginPath();ctx.moveTo(-size,-wing*.35);ctx.quadraticCurveTo(-size*.45,-wing,0,1);
        ctx.quadraticCurveTo(size*.45,-wing,size,-wing*.35);ctx.stroke();ctx.restore();
      }
      ctx.globalAlpha=1;
    };
    const tick=now=>{
      frame=0;if(!visible||document.hidden||bookRef.current?.classList.contains('is-turning'))return;
      if(now-last>=33){time+=last?Math.min(.08,(now-last)/1000):0;last=now;draw();}
      frame=requestAnimationFrame(tick);
    };
    const schedule=()=>{
      if(!visible||document.hidden||bookRef.current?.classList.contains('is-turning'))return;
      if(preference.matches){draw();return;}
      if(!frame){last=0;frame=requestAnimationFrame(tick);}
    };
    const markDirty=()=>{dirty=true;schedule();};
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;last=0;schedule();};
    const motion=()=>{cancelAnimationFrame(frame);frame=0;last=0;dirty=true;schedule();};
    updatePalette();
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visibility();},{rootMargin:'100px'});
    intersection.observe(host);
    const resize=new ResizeObserver(markDirty);resize.observe(host);if(bookRef.current)resize.observe(bookRef.current);
    const bookChanges=new MutationObserver(markDirty);
    if(bookRef.current)bookChanges.observe(bookRef.current,{attributes:true,attributeFilter:['class']});
    const theme=new MutationObserver(()=>{updatePalette();schedule();});
    theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    document.addEventListener('visibilitychange',visibility);preference.addEventListener('change',motion);
    return()=>{
      cancelAnimationFrame(frame);intersection.disconnect();resize.disconnect();bookChanges.disconnect();theme.disconnect();
      document.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',motion);
    };
  },[host,bookRef]);
  return host?createPortal(<canvas ref={canvas} className="journal-particle-atmosphere" aria-hidden="true" />,host):null;
}
