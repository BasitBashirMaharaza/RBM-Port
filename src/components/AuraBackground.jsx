import { useEffect, useRef } from 'react';
import './aura-background.css';

export default function AuraBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext('2d');
    let frame, last = 0, time = 0, pointer = { x: .5, y: .5 }, target = { x: .5, y: .5 };
    const resize = () => { canvas.width = Math.min(1100, Math.max(640, innerWidth)); canvas.height = Math.max(480, canvas.width*innerHeight/innerWidth); };
    const move = event => { target.x = event.clientX / innerWidth; target.y = event.clientY / innerHeight; };
    resize(); window.addEventListener('resize',resize);
    window.addEventListener('pointermove', move, { passive: true });
    const paint = now => {
      frame = requestAnimationFrame(paint);
      if(now-last<33) return;
      const dt=Math.min((now-last)/1000,.05); last=now;
      if(document.hidden) return;
      if(document.documentElement.dataset.auraPaused!=='true') time+=dt;
      pointer.x += (target.x-pointer.x)*.018; pointer.y += (target.y-pointer.y)*.018;
      const w=canvas.width,h=canvas.height,light=document.documentElement.dataset.theme==='light';
      ctx.clearRect(0,0,w,h);
      const colors = light ? ['71,153,124','127,117,188','183,157,91'] : ['65,163,137','126,116,199','164,181,95'];
      colors.forEach((color,i)=>{
        const x=w*(.5+Math.sin(time*.23+i*2)*.38)+(pointer.x-.5)*w*(i===1?.13:.07),y=h*(.5+Math.cos(time*.27+i*2.5)*.34)+(pointer.y-.5)*h*.08;
        const radius=Math.max(w,h)*(i===1?.53:.47);
        const gradient=ctx.createRadialGradient(x,y,0,x,y,radius);
        gradient.addColorStop(0,'rgba('+color+','+(light?[.33,.29,.25][i]:[.31,.28,.23][i])+')');
        gradient.addColorStop(.42,'rgba('+color+','+(light?.13:.12)+')');
        gradient.addColorStop(1,'rgba('+color+',0)');
        ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
      });
      const glowX=w*pointer.x,glowY=h*pointer.y;
      const cursorGlow=ctx.createRadialGradient(glowX,glowY,0,glowX,glowY,Math.max(w,h)*.22);
      cursorGlow.addColorStop(0,light?'rgba(88,139,92,.13)':'rgba(179,228,153,.1)');cursorGlow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=cursorGlow;ctx.fillRect(0,0,w,h);
    };
    frame=requestAnimationFrame(paint);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);};
  },[]);
  return <div className="aura-background" aria-hidden="true"><canvas ref={ref} style={{width:'100%',height:'100%',display:'block'}} /></div>;
}
