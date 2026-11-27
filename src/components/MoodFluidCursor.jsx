import {useEffect,useRef} from 'react';

const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const simulation=`precision mediump float;
varying vec2 uv;uniform sampler2D field;uniform vec2 size;uniform vec4 stroke;uniform float dt,time,inject;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float distanceToLine(vec2 p,vec2 a,vec2 b){vec2 d=b-a;float t=clamp(dot(p-a,d)/max(dot(d,d),.00001),0.,1.);return length(p-a-d*t);}
void main(){
 float aspect=size.x/size.y;vec2 p=uv*vec2(aspect,1.);vec2 mouse=stroke.zw*vec2(aspect,1.);
 float n=noise(p*7.+vec2(time*.15,-time*.12));float n2=noise(p*15.-time*.18);
 vec2 flow=vec2(sin(p.y*13.+n*7.+time*.4),cos(p.x*12.+n*7.-time*.3))*.065;
 vec2 delta=p-mouse;flow+=vec2(-delta.y,delta.x)*.016/(dot(delta,delta)+.012);
 vec2 back=uv-flow*dt/vec2(aspect,1.);
 float dye=texture2D(field,back).r*exp(-dt*1.9);
 float speed=length((stroke.zw-stroke.xy)*vec2(aspect,1.));
 float radius=clamp(.026+speed*.2,.026,.07);
 float distance=distanceToLine(p,stroke.xy*vec2(aspect,1.),mouse);
 float ink=exp(-distance*distance/(radius*radius))*(.4+.6*n2)*inject;
 gl_FragColor=vec4(clamp(dye+ink*.8,0.,1.),0.,0.,1.);
}`;
const display=`precision mediump float;varying vec2 uv;uniform sampler2D field;uniform vec2 size;uniform vec3 color;uniform float light;
void main(){float d=texture2D(field,uv).r;vec2 pixel=1./size;
 float dx=texture2D(field,uv+vec2(pixel.x,0)).r-texture2D(field,uv-vec2(pixel.x,0)).r;
 float dy=texture2D(field,uv+vec2(0,pixel.y)).r-texture2D(field,uv-vec2(0,pixel.y)).r;
 float edge=clamp(length(vec2(dx,dy))*8.,0.,1.);
 float alpha=smoothstep(.035,.5,d)*mix(.72,.38,light);
 vec3 pigment=mix(color*.38,color,clamp(d*.65+edge*.6,0.,1.));
 pigment+=edge*vec3(.06,.055,.045);
 gl_FragColor=vec4(pigment,alpha);
}`;

/** A small, demand-driven dye field. React never renders a simulation frame. */
export default function MoodFluidCursor({active,color,containerRef}){
 const canvas=useRef(null),state=useRef({active,color}),control=useRef(null);
 state.current={active,color};
 useEffect(()=>{control.current?.()},[active]);
 useEffect(()=>{
  const surface=canvas.current,host=containerRef.current;
  const fine=matchMedia('(hover:hover) and (pointer:fine)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let gl=null,buffer=null,programs=[],textures=[],targets=[],frame=0,last=0,lastInput=0,previous=null,point=null,pending=false,bounds=null,failed=false,w=0,h=0;
  const shaders=[];
  const enabled=()=>state.current.active&&fine.matches&&!reduce.matches&&!document.hidden&&!failed;
  const compile=(source,type)=>{const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Cursor shader unavailable');return shader};
  const program=source=>{const p=gl.createProgram();gl.attachShader(p,compile(vertex,gl.VERTEX_SHADER));gl.attachShader(p,compile(source,gl.FRAGMENT_SHADER));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Cursor program unavailable');const names=['field','size','stroke','dt','time','inject','color','light'];return{p,position:gl.getAttribLocation(p,'position'),u:Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(p,name)]))}};
  const resize=()=>{
   bounds=null;if(!gl)return;
   const r=host.getBoundingClientRect(),scale=Math.min(.6,900/r.width,600/r.height),nw=Math.max(2,Math.round(r.width*scale)),nh=Math.max(2,Math.round(r.height*scale));
   if(nw===w&&nh===h)return;w=nw;h=nh;surface.width=w;surface.height=h;gl.viewport(0,0,w,h);
   textures.forEach((texture,i)=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,targets[i]);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);gl.clear(gl.COLOR_BUFFER_BIT)});gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  };
  const init=()=>{
   try{
    gl=surface.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});if(!gl){failed=true;return false;}
    programs=[program(simulation),program(display)];buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    for(let i=0;i<2;i++){const texture=gl.createTexture();textures.push(texture);targets.push(gl.createFramebuffer());gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
    gl.clearColor(0,0,0,0);resize();return true;
   }catch{failed=true;return false;}
  };
  const clear=()=>{cancelAnimationFrame(frame);frame=0;surface.style.opacity='0';previous=null;point=null;pending=false;last=0;if(gl&&!failed){for(const target of [...targets,null]){gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.clear(gl.COLOR_BUFFER_BIT)}}};
  const sync=()=>{if(!enabled())clear()};control.current=sync;
  const draw=(shader,texture,target)=>{gl.useProgram(shader.p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(shader.position);gl.vertexAttribPointer(shader.position,2,gl.FLOAT,false,0,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(shader.u.field,0);gl.uniform2f(shader.u.size,w,h);gl.bindFramebuffer(gl.FRAMEBUFFER,target)};
  const tick=now=>{
   frame=0;if(!enabled()||now-lastInput>2600){clear();return;}
   frame=requestAnimationFrame(tick);if(now-last<32)return;
   const dt=last?Math.min((now-last)/1000,.05):.032;last=now;
   draw(programs[0],textures[0],targets[1]);const u=programs[0].u;
   gl.uniform4f(u.stroke,previous.x,previous.y,point.x,point.y);gl.uniform1f(u.dt,dt);gl.uniform1f(u.time,now*.001);gl.uniform1f(u.inject,pending?1:0);gl.drawArrays(gl.TRIANGLES,0,6);
   draw(programs[1],textures[1],null);const rgb=(state.current.color||'#b6c4a8').replace('#','').match(/../g).map(x=>parseInt(x,16)/255);
   gl.uniform3fv(programs[1].u.color,rgb);gl.uniform1f(programs[1].u.light,document.documentElement.dataset.theme==='light'?1:0);gl.drawArrays(gl.TRIANGLES,0,6);
   textures.reverse();targets.reverse();previous=point;pending=false;
  };
  const move=event=>{if(event.pointerType!=='mouse'||!enabled())return;if(!gl&&!init())return;bounds||=host.getBoundingClientRect();const next={x:(event.clientX-bounds.left)/bounds.width,y:1-(event.clientY-bounds.top)/bounds.height};previous||=next;point=next;pending=true;lastInput=performance.now();surface.style.opacity='1';if(!frame)frame=requestAnimationFrame(tick)};
  const leave=()=>{pending=false};
  const scroll=()=>{bounds=null;clear()};
  const lost=event=>{event.preventDefault();failed=true;clear()};
  const observer=new ResizeObserver(resize);observer.observe(host);host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('visibilitychange',sync);fine.addEventListener('change',sync);reduce.addEventListener('change',sync);surface.addEventListener('webglcontextlost',lost);
  return()=>{clear();control.current=null;observer.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',scroll);document.removeEventListener('visibilitychange',sync);fine.removeEventListener('change',sync);reduce.removeEventListener('change',sync);surface.removeEventListener('webglcontextlost',lost);if(gl){programs.forEach(({p})=>gl.deleteProgram(p));shaders.forEach(s=>gl.deleteShader(s));textures.forEach(t=>gl.deleteTexture(t));targets.forEach(t=>gl.deleteFramebuffer(t));gl.deleteBuffer(buffer);gl.getExtension('WEBGL_lose_context')?.loseContext()}};
 },[containerRef]);
 return <canvas ref={canvas} className='mood-fluid-cursor' aria-hidden='true'/>;
}
