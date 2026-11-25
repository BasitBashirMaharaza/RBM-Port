import * as THREE from 'three';
import {computerSound,stopLearningSound} from './learningSound.js';
import {isLearningFramed} from './learningEntranceVisibility.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const quart=t=>t<.5?8*t**4:1-(-2*t+2)**4/2;

// Procedural CRT, keyboard and mouse: no external model/download dependency.
// Reference choreography: assembly → hold → CRT power → boot → screen dolly → handoff.
export function createComputerEntrance(host,onComplete){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 host.append(renderer.domElement);host.dataset.phase='load';
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.1,200),root=new THREE.Group();scene.add(root);
 scene.add(new THREE.HemisphereLight(0xe8eef5,0x383129,2));
 const key=new THREE.DirectionalLight(0xfff2dc,3.5);key.position.set(-7,12,12);scene.add(key);
 const rim=new THREE.DirectionalLight(0xb7cbea,2);rim.position.set(8,4,-5);scene.add(rim);
 const shell=new THREE.MeshStandardMaterial({color:0xc8c6b8,roughness:.48,metalness:.08});
 const edge=new THREE.MeshStandardMaterial({color:0x8b8c81,roughness:.65});
 const bezel=new THREE.MeshStandardMaterial({color:0x343734,roughness:.4});
 const black=new THREE.MeshStandardMaterial({color:0x111917,roughness:.22});
 const keycap=new THREE.MeshStandardMaterial({color:0xd9d8cc,roughness:.52});
 const parts=[],resources=new Set([shell,edge,bezel,black,keycap]);
 function box(parent,w,h,d,r,mat,x,y,z){const geo=new RoundedBoxGeometry(w,h,d,3,r);resources.add(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function part(start,from){const group=new THREE.Group();root.add(group);parts.push({group,start,from:new THREE.Vector3(...from)});return group;}
 const housing=part(.03,[0,6,-5]);
 box(housing,4.5,4.7,2.35,.17,shell,0,2.7,0);
 box(housing,4.16,4.1,.8,.25,edge,0,2.72,-1.37);
 box(housing,4.22,.18,2.28,.06,edge,0,.3,.04);
 const face=part(.3,[0,0,7]);
 box(face,3.95,3.4,.17,.2,edge,0,3.15,1.2);
 box(face,3.56,3,.16,.25,bezel,0,3.2,1.3);
 box(face,3.16,2.54,.12,.22,black,0,3.2,1.4);
 const screenCenter=new THREE.Vector3(0,3.2,1.477);
 const textureCanvas=document.createElement('canvas');textureCanvas.width=1200;textureCanvas.height=960;
 const ctx=textureCanvas.getContext('2d');const texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE.SRGBColorSpace;resources.add(texture);
 const screenMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0,toneMapped:false});resources.add(screenMaterial);
 const screenGeo=new THREE.PlaneGeometry(3.02,2.4);resources.add(screenGeo);
 const screen=new THREE.Mesh(screenGeo,screenMaterial);screen.position.copy(screenCenter);face.add(screen);
 const beamMat=new THREE.MeshBasicMaterial({color:0xb5d7df,transparent:true,opacity:0,toneMapped:false});resources.add(beamMat);
 const beam=new THREE.Mesh(screenGeo,beamMat);beam.position.set(0,3.2,1.485);face.add(beam);
 const controls=part(.48,[-5,0,4]);
 for(let i=0;i<12;i++)box(controls,.055,.55,.05,.01,bezel,-1.75+i*.075,1,1.21);
 box(controls,.77,.14,.07,.025,bezel,.58,1.02,1.22);
 box(controls,.16,.16,.09,.025,keycap,1.55,1,1.24);
 const ledMat=new THREE.MeshBasicMaterial({color:0x93bf94});resources.add(ledMat);box(controls,.055,.055,.04,.01,ledMat,1.3,1,1.26);
 const keyboard=part(.6,[0,-3,8]);
 box(keyboard,4.65,.27,1.65,.1,shell,-.15,.19,3.08);
 for(let row=0;row<5;row++)for(let col=0;col<14;col++){
  if(row===4&&col>3&&col<10)continue;
  box(keyboard,.265,.16,.22,.025,keycap,-2.18+col*.31,.38,2.48+row*.285);
 }
 box(keyboard,1.78,.16,.22,.03,keycap,-.03,.38,3.62);
 const mouse=part(.76,[6,0,4]);box(mouse,.65,.3,1.03,.14,shell,3.02,.25,3.12);box(mouse,.49,.035,.03,.008,edge,3.02,.415,3.03);
 const cordGeo=new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3([new THREE.Vector3(3, .2,2.65),new THREE.Vector3(3.6,.12,1.7),new THREE.Vector3(2.9,.12,.3),new THREE.Vector3(1.6,.2,-.7)]).getPoints(40));resources.add(cordGeo);
 const cordMat=new THREE.LineBasicMaterial({color:0x5b5c55});resources.add(cordMat);mouse.add(new THREE.Line(cordGeo,cordMat));
 // A soft contact shadow grounds the machine without an expensive shadow pass.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'#0009');gradient.addColorStop(1,'#0000');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
 const shadowMap=new THREE.CanvasTexture(shadowCanvas),shadowGeo=new THREE.PlaneGeometry(10,8),shadowMat=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false});[shadowMap,shadowGeo,shadowMat].forEach(r=>resources.add(r));const shadow=new THREE.Mesh(shadowGeo,shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.set(0,.01,1.4);scene.add(shadow);
 // Capture the actual introduction's typography and positions, rather than a tiny,
 // separately typeset approximation. Layout is read only when the texture changes.
 const introduction=host.closest('#education').querySelector('.lg-intro');
 let screenDisposed=false;
 function drawScreen(){
  if(screenDisposed||!introduction)return;
  const section=host.closest('#education'),style=getComputedStyle(section),rect=introduction.getBoundingClientRect();
  const textElements=[...introduction.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().width);
  const bounds=textElements.map(el=>el.getBoundingClientRect());
  const left=Math.min(rect.left,...bounds.map(r=>r.left)),top=Math.min(rect.top,...bounds.map(r=>r.top));
  const right=Math.max(rect.right,...bounds.map(r=>r.right)),bottom=Math.max(rect.bottom,...bounds.map(r=>r.bottom));
  ctx.fillStyle=style.getPropertyValue('--lg-bg');
  // Canvas cannot resolve var() nested in color-mix; use the browser's resolved surface.
  ctx.fillStyle=style.backgroundColor;ctx.fillRect(0,0,1200,960);
  const scale=Math.min(1000/(right-left),800/(bottom-top));
  ctx.save();ctx.translate((1200-(right-left)*scale)/2,(960-(bottom-top)*scale)/2);ctx.scale(scale,scale);ctx.translate(-left,-top);
  const image=introduction.querySelector('img');
  if(image?.complete&&image.naturalWidth){
   const box=image.getBoundingClientRect(),ratio=Math.max(box.width/image.naturalWidth,box.height/image.naturalHeight),w=box.width/ratio,h=box.height/ratio;
   ctx.save();ctx.beginPath();ctx.roundRect(box.left,box.top,box.width,box.height,8);ctx.clip();ctx.drawImage(image,(image.naturalWidth-w)/2,(image.naturalHeight-h)/2,w,h,box.left,box.top,box.width,box.height);ctx.restore();
  }
  const walker=document.createTreeWalker(introduction,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode,parent=node.parentElement;
   if(!node.textContent.trim()||parent.closest('svg'))continue;
   const font=getComputedStyle(parent);ctx.font=`${font.fontStyle} ${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;ctx.fillStyle=font.color;ctx.textBaseline='alphabetic';
   const ascent=ctx.measureText('Hg').fontBoundingBoxAscent||parseFloat(font.fontSize)*.8;
   for(const word of node.textContent.matchAll(/\S+/g)){
    const range=document.createRange();range.setStart(node,word.index);range.setEnd(node,word.index+word[0].length);const box=range.getBoundingClientRect();
    if(box.width)ctx.fillText(word[0],box.left,box.top+ascent);
   }
  }
  ctx.restore();texture.needsUpdate=true;host.dataset.screen='live-introduction';
 }
 const photo=introduction.querySelector('img');photo?.addEventListener('load',drawScreen);
 const themeObserver=new MutationObserver(drawScreen);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 document.fonts.ready.then(()=>{if(!screenDisposed)drawScreen();});drawScreen();
 let width=1,height=1,frame=0,elapsed=0,last=0,disposed=false,visible=false,completed=false,previousPhase='load';
 const resize=()=>{width=host.clientWidth;height=host.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();drawScreen();};const ro=new ResizeObserver(resize);ro.observe(host);resize();
 const syncFraming=()=>{const nextVisible=isLearningFramed(host.closest('#education'));if(nextVisible!==visible){visible=nextVisible;last=0;}if(!visible){stopLearningSound();cancelAnimationFrame(frame);frame=0;}else wake();};
 let framingFrame=0;
 const scheduleFraming=()=>{if(!framingFrame)framingFrame=requestAnimationFrame(()=>{framingFrame=0;syncFraming();});};
 const io=new IntersectionObserver(scheduleFraming,{threshold:[0,.25,.5,.75,1]});io.observe(host);window.addEventListener('scroll',scheduleFraming,{passive:true});window.addEventListener('resize',scheduleFraming);syncFraming();
 const visibility=syncFraming;document.addEventListener('visibilitychange',visibility);
 function wake(){if(!disposed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
 function tick(now){
  frame=0;if(disposed||!visible||document.hidden)return;
  elapsed+=last?Math.min((now-last)/1000,.05):0;last=now;
  const load=clamp(elapsed/3.9),power=clamp((elapsed-4.5)/.62),boot=smooth((elapsed-5.12)/.45),zoom=quart(clamp((elapsed-5.87)/1.5));
  const phase=elapsed<3.9?'load':elapsed<4.5?'hold':elapsed<5.12?'power':elapsed<5.87?'boot':elapsed<7.37?'zoom':'fade';host.dataset.phase=phase;if(phase!==previousPhase){computerSound(phase);previousPhase=phase;}
  parts.forEach(({group,start,from})=>{const t=clamp((load-start)/.22),e=1-(1-t)**3;group.position.copy(from).multiplyScalar(1-e);group.visible=t>0;});
  const az=(.57*(1-smooth(load))+.12)*(1-zoom),elevation=(.42+.1*Math.sin(load*Math.PI))*(1-zoom);
  const target=new THREE.Vector3(0,2.2+zoom,1.1+zoom*.377);
  const distance=Math.max(21,15/camera.aspect)*(1-zoom)+(1.2/Math.tan(Math.PI/12))*zoom;
  camera.position.set(target.x+Math.sin(az)*Math.cos(elevation)*distance,target.y+Math.sin(elevation)*distance,target.z+Math.cos(az)*Math.cos(elevation)*distance);camera.lookAt(target);
  beam.visible=phase==='power';beamMat.opacity=power>0?1:0;beam.scale.set(Math.min(1,power/.22),.008+.992*smooth((power-.22)/.7),1);
  screenMaterial.opacity=boot;shadowMat.opacity=1-zoom;
  renderer.render(scene,camera);
  if(elapsed>=7.82&&!completed){completed=true;onComplete();return;}wake();
 }
 wake();
 return()=>{if(disposed)return;disposed=true;stopLearningSound();cancelAnimationFrame(frame);cancelAnimationFrame(framingFrame);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('scroll',scheduleFraming);window.removeEventListener('resize',scheduleFraming);screenDisposed=true;themeObserver.disconnect();photo?.removeEventListener('load',drawScreen);resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove();};
}

