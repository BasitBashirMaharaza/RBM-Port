// Identical aura geometry, colors, cadence and pointer easing, rendered away
// from React, scrolling and input on browsers supporting OffscreenCanvas.
let canvas,ctx,frame=0,last=0,time=0,light=false,paused=false,visible=true;
const pointer={x:.5,y:.5},target={x:.5,y:.5};
const schedule=callback=>typeof requestAnimationFrame==='function'?requestAnimationFrame(callback):setTimeout(()=>callback(performance.now()),16);
const cancel=id=>typeof cancelAnimationFrame==='function'?cancelAnimationFrame(id):clearTimeout(id);
function paint(now){
 frame=0;if(!visible||!ctx)return;
 frame=schedule(paint);
 if(now-last<33)return;
 const dt=Math.min((now-last)/1000,.05);last=now;
 if(!paused)time+=dt;
 pointer.x+=(target.x-pointer.x)*.018;pointer.y+=(target.y-pointer.y)*.018;
 const w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);
 const colors=light?['71,153,124','127,117,188','183,157,91']:['65,163,137','126,116,199','164,181,95'];
 colors.forEach((color,i)=>{
  const x=w*(.5+Math.sin(time*.23+i*2)*.38)+(pointer.x-.5)*w*(i===1?.13:.07),y=h*(.5+Math.cos(time*.27+i*2.5)*.34)+(pointer.y-.5)*h*.08;
  const gradient=ctx.createRadialGradient(x,y,0,x,y,Math.max(w,h)*(i===1?.53:.47));
  gradient.addColorStop(0,'rgba('+color+','+(light?[.33,.29,.25][i]:[.31,.28,.23][i])+')');
  gradient.addColorStop(.42,'rgba('+color+','+(light?.13:.12)+')');gradient.addColorStop(1,'rgba('+color+',0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 });
 const x=w*pointer.x,y=h*pointer.y,glow=ctx.createRadialGradient(x,y,0,x,y,Math.max(w,h)*.22);
 glow.addColorStop(0,light?'rgba(88,139,92,.13)':'rgba(179,228,153,.1)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
}
self.onmessage=({data})=>{
 if(data.canvas){canvas=data.canvas;ctx=canvas.getContext('2d');}
 if(data.size&&canvas){canvas.width=data.size[0];canvas.height=data.size[1];}
 if(data.pointer)Object.assign(target,data.pointer);
 if(data.light!==undefined)light=data.light;
 if(data.paused!==undefined)paused=data.paused;
 if(data.visible!==undefined){visible=data.visible;if(!visible){cancel(frame);frame=0;last=0;}}
 if(visible&&ctx&&!frame)frame=schedule(paint);
};
