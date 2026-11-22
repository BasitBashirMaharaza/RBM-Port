import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { archiveColors,archiveLightColors,archiveMarks } from './workArchiveMarks.js';

const ease=t=>t*t*(3-2*t);
const mixColor=(a,b,amount)=>'#'+new THREE.Color(a).lerp(new THREE.Color(b),amount).getHexString();
function cardTexture(project,index,light,selected,palette){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=840;
 const ctx=canvas.getContext('2d'),ink=light?archiveLightColors[index]:selected?archiveColors[index]:'#e0ebbc';
 ctx.fillStyle=light?mixColor(palette.surface,archiveColors[index],selected?.16:.1):(selected?'#100e18':'#0a1007');ctx.fillRect(0,0,1200,840);
 const glow=ctx.createRadialGradient(900,70,0,900,70,650);glow.addColorStop(0,selected?ink+'32':ink+'1a');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,1200,840);
 ctx.strokeStyle=ink+'0a';ctx.lineWidth=1;for(let x=32;x<1200;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,840);ctx.stroke();}
 ctx.strokeStyle=ink+'65';ctx.lineWidth=1;ctx.strokeRect(18,18,1164,804);if(light){ctx.fillStyle=ink;ctx.fillRect(18,18,5,804);}
 const textInk=light?palette.text:selected?archiveColors[index]:'#a5c562';
 ctx.fillStyle=textInk;ctx.font=selected?'500 28px monospace':'500 22px monospace';ctx.fillText(project.number,56,63);ctx.font=selected?'500 32px sans-serif':'500 25px sans-serif';
 let line='',textY=63;for(const word of project.title.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>850){ctx.fillText(line,115,textY);line=word;textY+=selected?43:34;}else line=next;}ctx.fillText(line,115,textY);ctx.fillText('↗',1125,63);
 // Keep the mark placement independent of the restored, smaller lettering.
 ctx.font='650 90px sans-serif';let markLine='',markY=196;for(const word of project.title.split(' ')){const next=markLine?markLine+' '+word:word;if(ctx.measureText(next).width>1040){markLine=word;markY+=104;}else markLine=next;}
 ctx.save();ctx.translate(72,Math.max(256,markY-19));ctx.scale(4.6,4.6);ctx.strokeStyle=ink;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.lineJoin='round';archiveMarks[index].forEach(path=>ctx.stroke(new Path2D(path)));ctx.restore();
 ctx.font=selected?'400 23px monospace':'400 18px monospace';ctx.fillStyle=textInk+'ba';ctx.fillText(project.eyebrow.toUpperCase(),70,675);ctx.font=selected?'400 18px monospace':'400 14px monospace';ctx.fillText('BASIT BASHIR / PROJECT ARCHIVE',70,760);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function inscription(text,light,palette){
 const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=180;const ctx=canvas.getContext('2d');ctx.font='500 48px monospace';ctx.fillStyle=light?palette.text:'#e2edc1';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,900,90);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

export function createArchiveScene(host,projects,{onHover,onOpen,onReady,onError,onLidMotion}){
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{onError();return null;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0,0);renderer.shadowMap.enabled=innerWidth>760;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-8,8,6,-6,.1,100);camera.position.set(10,9.5,13);camera.lookAt(0,2.4,0);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.55;room.dispose();pmrem.dispose();
 const world=new THREE.Group();scene.add(world);const textures=[],cards=[];
 const outer=new THREE.MeshPhysicalMaterial({color:'#20231e',metalness:.82,roughness:.32,clearcoat:.45,clearcoatRoughness:.22});
 const inner=new THREE.MeshStandardMaterial({color:'#0a1007',metalness:.2,roughness:.7});
 const trim=new THREE.MeshPhysicalMaterial({color:'#849269',metalness:.8,roughness:.22,emissive:'#a5c562',emissiveIntensity:.1});
 const box=(parent,w,h,d,x,y,z,material,r=.035)=>{const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 box(world,8.2,.27,4.6,0,.135,0,outer);box(world,8.2,1.45,.13,0,.91,2.24,outer);box(world,8.2,1.45,.13,0,.91,-2.24,outer);box(world,.13,1.45,4.45,-4.035,.91,0,outer);box(world,.13,1.45,4.45,4.035,.91,0,outer);box(world,7.92,.12,4.27,0,.33,0,inner);
 for(const z of [-2.24,2.24])box(world,8.18,.018,.025,0,1.645,z,trim,.003);for(const x of [-4.035,4.035])box(world,.025,.018,4.45,x,1.645,0,trim,.003);
 const labelMaterial=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false});const label=new THREE.Mesh(new THREE.PlaneGeometry(6.7,.67),labelMaterial);label.position.set(0,.96,2.313);world.add(label);
 const lid=new THREE.Group();lid.position.set(0,1.69,-2.26);world.add(lid);box(lid,8.2,.16,4.6,0,.02,2.26,outer);box(lid,7.98,.045,4.33,0,-.081,2.26,inner);for(const x of [-4.04,4.04])box(lid,.012,.012,4.48,x,-.11,2.26,trim,.002);for(const z of [.045,4.48])box(lid,8.08,.012,.012,0,-.11,z,trim,.002);
 for(const x of [-2.9,2.9]){const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.55,16),trim);hinge.rotation.z=Math.PI/2;hinge.position.set(x,1.65,-2.24);world.add(hinge);}
 const shape=new THREE.Shape(),w=3.62,h=2.55,r=.15;shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const cardGeometry=new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,steps:1,curveSegments:12});
 const faceGeometry=new THREE.ShapeGeometry(shape,16);const uv=faceGeometry.attributes.uv,pos=faceGeometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/w+.5,pos.getY(i)/h+.5);
 projects.forEach((project,index)=>{
  const group=new THREE.Group(),bodyMaterial=new THREE.MeshPhysicalMaterial({color:'#7a8f4f',metalness:.65,roughness:.26,clearcoat:.7,emissive:'#89a845',emissiveIntensity:.09});
  const body=new THREE.Mesh(cardGeometry,bodyMaterial);body.castShadow=true;group.add(body);
  const faceMaterial=new THREE.MeshBasicMaterial({toneMapped:false}),activeMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,toneMapped:false});
  const face=new THREE.Mesh(faceGeometry,faceMaterial);face.position.z=.086;const activeFace=new THREE.Mesh(faceGeometry,activeMaterial);activeFace.position.z=.089;group.add(face,activeFace);group.rotation.y=Math.PI/2;group.position.set(-2.8+index*(5.6/(projects.length-1)),1.52,0);world.add(group);
  cards.push({group,bodyMaterial,faceMaterial,activeMaterial,hover:0,hidden:false,index});
 });
 const hemisphere=new THREE.HemisphereLight('#e5e9d8','#111808',1.1);scene.add(hemisphere);
 const key=new THREE.DirectionalLight('#f6f5e8',3.3);key.position.set(-3,9,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:35});key.shadow.normalBias=.02;key.shadow.bias=-.0002;scene.add(key);
 const rim=new THREE.DirectionalLight('#c9e0b6',2.4);rim.position.set(5,5,-6);scene.add(rim);
 const glow=new THREE.PointLight('#c3f56b',7,12,2);glow.position.set(0,2,-1.8);world.add(glow);
 const floorMaterial=new THREE.MeshBasicMaterial({color:'#080b07',toneMapped:false});const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-.02;floor.visible=false;scene.add(floor);
 // A transparent contact shadow lets the portfolio's ambient background continue through.
 const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=256;
 const contactContext=contactCanvas.getContext('2d'),contactGradient=contactContext.createRadialGradient(128,128,12,128,128,126);
 contactGradient.addColorStop(0,'#0000005c');contactGradient.addColorStop(.45,'#00000032');contactGradient.addColorStop(1,'#00000000');contactContext.fillStyle=contactGradient;contactContext.fillRect(0,0,256,256);
 const contactMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(contactCanvas),transparent:true,depthWrite:false,toneMapped:false,opacity:.4});
 const contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(12,7.5),contactMaterial);contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=-.025;scene.add(contactShadow);
 const reflector=null;
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(25,25),new THREE.ShadowMaterial({opacity:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.008;shadow.receiveShadow=true;scene.add(shadow);
 let frame=0,previous=0,elapsed=0,startTime=null,scrollDirty=true,scrollTarget=0,openness=0,visible=false,disposed=false,active=-1,opening=false,light=false,width=1,height=1,interactive=false,rotationTime=0,rotationRate=0,scrollTurn=0,scrollTurnTarget=0,hovering=false,lastRender=0,lastShadow=0,lidCueState='closed';
 const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster(),projected=new THREE.Vector3(),press={x:0,y:0,time:0};
 const tick=now=>{
  frame=0;if(disposed||!visible||document.hidden)return;
  const dt=previous?Math.min(.12,(now-previous)/1000):1/60;previous=now;if(startTime===null)startTime=now;elapsed=(now-startTime)/1000;
  if(scrollDirty&&!opening){const bounds=host.getBoundingClientRect(),vh=window.innerHeight;const arrival=THREE.MathUtils.clamp((vh-bounds.top)/(vh*.65),0,1),departure=THREE.MathUtils.clamp((bounds.bottom-vh*.18)/(bounds.height*.72),0,1);scrollTarget=Math.min(arrival,departure);scrollTurnTarget=THREE.MathUtils.clamp((vh*.5-(bounds.top+bounds.height*.5))/(vh*.8),-1,1)*THREE.MathUtils.degToRad(14);scrollDirty=false;}
  const intro=reduced.matches?1:ease(Math.min(1,elapsed/1.1));
  const targetOpen=opening?openness:scrollTarget*intro;
  openness+= (targetOpen-openness)*(reduced.matches?1:1-Math.exp(-dt*11));
  if(Math.abs(targetOpen-openness)<.0006)openness=targetOpen;
  // Schmitt thresholds: each cue fires once per physical opening/closing cycle.
  // Small scroll reversals midway through the lid travel cannot retrigger it.
  if(!opening&&lidCueState==='closed'&&openness>=.22){lidCueState='open';onLidMotion?.('open');}
  else if(!opening&&lidCueState==='open'&&openness<=.08){lidCueState='closed';onLidMotion?.('close');}

  const lift=ease(THREE.MathUtils.clamp((openness-.46)/.5,0,1));
  lid.rotation.x=-THREE.MathUtils.degToRad(102)*ease(openness);let moving=intro<1||Math.abs(targetOpen-openness)>.0005;
  const state=openness>.95?'open':openness<.05?'closed':'moving';if(host.dataset.archiveState!==state)host.dataset.archiveState=state;
  const response=reduced.matches?1:1-Math.exp(-dt*14);
  cards.forEach(card=>{const target=active===card.index&&!opening?1:0;card.hover+=(target-card.hover)*response;if(Math.abs(target-card.hover)>.001)moving=true;else card.hover=target;card.group.position.y=.82+.7*lift+card.hover*.32;card.group.scale.y=.35+.65*lift;card.group.visible=!card.hidden;card.activeMaterial.opacity=card.hover;card.bodyMaterial.emissive.set(card.hover>.02?archiveColors[card.index]:light?'#526735':'#89a845');card.bodyMaterial.emissiveIntensity=(light?0:.09)+card.hover*(light?.08:.48);});
  // A restrained turntable sway; freeze the archive while a file is being read.
  let rotating=false;
  if(reduced.matches){world.rotation.y=0;rotationRate=0;scrollTurn=0;}
  else if(!opening){
   const targetRate=hovering?0:1;
   rotationRate+=(targetRate-rotationRate)*(1-Math.exp(-dt*5));
   if(rotationRate<.001&&targetRate===0)rotationRate=0;
   rotationTime+=dt*rotationRate;
   scrollTurn+=(scrollTurnTarget-scrollTurn)*(1-Math.exp(-dt*9));
   if(Math.abs(scrollTurnTarget-scrollTurn)>.0002)moving=true;else scrollTurn=scrollTurnTarget;
   world.rotation.y=Math.sin(rotationTime*Math.PI*2/18)*THREE.MathUtils.degToRad(8)+scrollTurn;
   rotating=rotationRate>0||targetRate>0;
  }
  // Keep continuous idle motion to 30fps; interactive file/lid motion stays uncapped.
  if(moving||!rotating||now-lastRender>=1000/30){
   world.updateMatrixWorld();camera.updateMatrixWorld();
   if(moving||(rotating&&now-lastShadow>=100)){renderer.shadowMap.needsUpdate=true;lastShadow=now;}
   renderer.render(scene,camera);lastRender=now;
  }
  interactive=openness>.72;
  if(moving||rotating)frame=requestAnimationFrame(tick);else previous=0;
 };
 const wake=()=>{if(!frame&&!disposed&&visible&&!document.hidden){previous=0;frame=requestAnimationFrame(tick);}};
 const resize=()=>{scrollDirty=true;width=host.clientWidth;height=host.clientHeight;renderer.setSize(width,height);const aspect=width/Math.max(1,height);const span=aspect<.85?13.8/aspect:12.2;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.zoom=1.1;camera.updateProjectionMatrix();wake();};
 const setTheme=()=>{
  light=document.documentElement.dataset.theme==='light';
  const styles=getComputedStyle(host),read=name=>styles.getPropertyValue(name).trim();
  const palette={bg:read('--bg'),soft:read('--bg-soft'),surface:read('--surface'),surface2:read('--surface-2'),text:read('--text'),muted:read('--muted'),accent:read('--accent')};
  outer.color.set(light?mixColor(palette.surface2,palette.text,.06):'#20231e');outer.metalness=light?.3:.82;outer.roughness=light?.38:.32;outer.clearcoat=light?.28:.45;
  inner.color.set(light?mixColor(palette.soft,palette.muted,.13):'#0a1007');inner.metalness=light?.08:.2;
  trim.color.set(light?mixColor(palette.surface2,palette.muted,.5):'#849269');trim.emissive.set(light?palette.accent:'#a5c562');trim.emissiveIntensity=light?0:.1;trim.roughness=light?.3:.22;
  floorMaterial.color.set(palette.bg);scene.environmentIntensity=light?.8:.55;renderer.toneMappingExposure=light?1:1.05;
  hemisphere.color.set(light?palette.surface:'#e5e9d8');hemisphere.groundColor.set(light?palette.muted:'#111808');hemisphere.intensity=light?1.25:1.1;
  key.color.set(light?'#ffffff':'#f6f5e8');key.intensity=light?2:3.3;rim.color.set(light?palette.surface:'#c9e0b6');rim.intensity=light?1.2:2.4;
  glow.color.set(light?palette.accent:'#c3f56b');glow.intensity=light?.3:7;shadow.material.opacity=light?.075:.12;contactMaterial.opacity=light?.4:.55;
  cards.forEach(card=>{
   card.bodyMaterial.color.set(light?mixColor(palette.surface2,archiveColors[card.index],.55):'#7a8f4f');card.bodyMaterial.metalness=light?.35:.65;card.bodyMaterial.roughness=light?.34:.26;card.bodyMaterial.clearcoat=light?.4:.7;
   card.faceMaterial.map?.dispose();card.activeMaterial.map?.dispose();card.faceMaterial.map=cardTexture(projects[card.index],card.index,light,false,palette);card.activeMaterial.map=cardTexture(projects[card.index],card.index,light,true,palette);card.faceMaterial.needsUpdate=true;card.activeMaterial.needsUpdate=true;
  });
  labelMaterial.map?.dispose();labelMaterial.map=inscription('BASIT BASHIR / SELECTED WORK',light,palette);labelMaterial.needsUpdate=true;renderer.shadowMap.needsUpdate=true;wake();
 };
 const setHover=index=>{if(active===index)return;active=index;onHover(index);wake();};
 const pick=event=>{const bounds=host.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(cards.map(c=>c.group),true);return hits.length?cards.findIndex(c=>c.group===hits[0].object.parent):-1;};
 const move=event=>{if(!fine.matches||!interactive||opening)return;const index=pick(event);hovering=index>=0;setHover(index);renderer.domElement.style.cursor=index>=0?'pointer':'';};
 const down=event=>{press.x=event.clientX;press.y=event.clientY;press.time=performance.now();};
 const up=event=>{if(!interactive||opening||event.button!==0||Math.hypot(event.clientX-press.x,event.clientY-press.y)>9||performance.now()-press.time>600)return;const index=pick(event);if(index>=0)onOpen(index);};
 const leave=()=>{hovering=false;renderer.domElement.style.cursor='';if(fine.matches)setHover(-1);};
 const contextLost=event=>{event.preventDefault();onError();};
 renderer.domElement.addEventListener('pointermove',move,{passive:true});renderer.domElement.addEventListener('pointerdown',down,{passive:true});renderer.domElement.addEventListener('pointerup',up,{passive:true});renderer.domElement.addEventListener('pointerleave',leave);renderer.domElement.addEventListener('webglcontextlost',contextLost);
 const scroll=()=>{if(opening)return;scrollDirty=true;wake();};window.addEventListener('scroll',scroll,{passive:true});
 const visibility=()=>{cancelAnimationFrame(frame);frame=0;previous=0;scrollDirty=true;wake();};document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',wake);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visibility();},{rootMargin:'80px'});observer.observe(host);const ro=new ResizeObserver(resize);ro.observe(host);const theme=new MutationObserver(setTheme);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 setTheme();resize();onReady();
 const corners=index=>{const card=cards[index];if(!card)return null;card.group.updateWorldMatrix(true,false);const rect=host.getBoundingClientRect();return [[-w/2,h/2],[w/2,h/2],[w/2,-h/2],[-w/2,-h/2]].map(([x,y])=>{projected.set(x,y,.09).applyMatrix4(card.group.matrixWorld).project(camera);return {x:rect.left+(projected.x+1)*rect.width/2,y:rect.top+(1-projected.y)*rect.height/2};});};
 return {setHover,getCorners:corners,setOpening:value=>{opening=value;if(!value)scrollDirty=true;wake();},hideCard:(index,value)=>{cards[index].hidden=value;wake();},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();theme.disconnect();window.removeEventListener('scroll',scroll);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',wake);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});textures.forEach(t=>t.dispose());reflector?.getRenderTarget().dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();}};
}
