import {useEffect,useRef} from 'react';
export default function FooterRibbons(){
 const canvas=useRef(null);
 useEffect(()=>{
  const node=canvas.current,host=node.parentElement,ctx=node.getContext('2d');if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last=0,time=0,visible=false,scrolling=false,scrollTimer=0,gradients=[],samples=[],w=0,h=0,x=.5,y=.5,tx=.5,ty=.5,kick=0,light=false;
  const cache=()=>{
   const colors=light?['#537b3e','#7064b5','#408b98']:['#c1f394','#b6a0f5','#86d4d3'];
   gradients=colors.map((_,i)=>{const g=ctx.createLinearGradient(0,0,w,0);g.addColorStop(0,colors[i]+'00');g.addColorStop(.2,colors[i]);g.addColorStop(.6,colors[(i+1)%3]);g.addColorStop(.84,colors[(i+2)%3]);g.addColorStop(1,colors[i]+'00');return g;});
   samples=Array.from({length:91},(_,j)=>{const n=j/90;return{n,envelope:Math.sin(n*Math.PI),sin:Math.sin(n*7),cos:Math.cos(n*7)};});
  };
  const paint=()=>{
   ctx.clearRect(0,0,w,h);if(!gradients.length)return;
   const ripple=samples.map(({n})=>Math.exp(-((n-x)**2)/.035)*((y-.5)*45+Math.sin(n*25-time*3)*kick*14));
   for(let i=0;i<34;i++){
    const gradient=gradients[i%3],phase=time*.32+i*.1,sine=Math.sin(phase),cosine=Math.cos(phase);ctx.beginPath();
    for(let j=0;j<samples.length;j++){
     const sample=samples[j];
     const py=h*(.08+i/33*.84)+(sample.sin*cosine+sample.cos*sine)*sample.envelope*(Math.min(13,h*.07)+i*.12)+ripple[j];
     if(j)ctx.lineTo(sample.n*w,py);else ctx.moveTo(0,py);
    }ctx.strokeStyle=gradient;ctx.globalAlpha=i%6===0?.85:.18;ctx.lineWidth=i%6===0?1.3:2.5;ctx.stroke();
   }ctx.globalAlpha=1;
  };
  const resize=()=>{w=host.clientWidth;h=node.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.5);node.width=Math.round(w*dpr);node.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);cache();paint();};
  const tick=now=>{frame=0;if(!visible||scrolling||document.hidden||reduced.matches)return;if(now-last>=32){const dt=Math.min(64,now-last||32);last=now;time+=dt/1000;x+=(tx-x)*.1;y+=(ty-y)*.1;kick*=.95;paint();}frame=requestAnimationFrame(tick);};
  const sync=()=>{host.toggleAttribute('data-ribbons-live',visible&&!scrolling&&!document.hidden&&!reduced.matches);cancelAnimationFrame(frame);last=0;if(visible&&!scrolling&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);else paint();};
  const move=e=>{const r=host.getBoundingClientRect();tx=(e.clientX-r.left)/Math.max(1,r.width);ty=(e.clientY-r.top)/Math.max(1,r.height);};
  const press=e=>{move(e);kick=1;};const leave=()=>{tx=.5;ty=.5;};
  const theme=()=>{light=document.documentElement.dataset.theme==='light';cache();paint();};
  const scroll=()=>{if(!visible)return;scrolling=true;cancelAnimationFrame(frame);frame=0;host.removeAttribute('data-ribbons-live');clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{scrolling=false;sync();},140);};
  window.addEventListener('scroll',scroll,{passive:true});
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(host);
  const size=new ResizeObserver(resize);size.observe(host);const themes=new MutationObserver(theme);themes.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerdown',press,{passive:true});host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);theme();resize();
  return()=>{clearTimeout(scrollTimer);window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame);host.removeAttribute('data-ribbons-live');observer.disconnect();size.disconnect();themes.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerdown',press);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);};
 },[]);
 return <canvas ref={canvas} className="footer-ribbon-wallpaper" aria-hidden="true"/>;
}
