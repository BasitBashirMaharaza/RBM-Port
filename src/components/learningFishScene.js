import * as THREE from 'three';

// Original, lightweight koi geometry; no downloaded portfolio artwork or model files.
function bodyGeometry(){
 const vertices=[],colors=[],indices=[],rings=44,sides=24;
 for(let i=0;i<=rings;i++){
  const t=i/rings,r=Math.sin(Math.PI*Math.pow(t,.65))*.45*(1-.6*t),bend=Math.sin(t*Math.PI)*.6;
  for(let j=0;j<=sides;j++){
   const angle=j/sides*Math.PI*2;vertices.push(t*2.3-1.15,Math.cos(angle)*r*.77+bend,Math.sin(angle)*r);
   const shade=.64+.28*Math.max(0,Math.sin(angle));colors.push(shade,shade*1.025,shade*1.035);
   if(i<rings&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}
  }
 }
 const cap=vertices.length/3;vertices.push(-1.15,0,0);colors.push(.72,.74,.75);for(let j=0;j<sides;j++)indices.push(cap,j+1,j);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function finGeometry(){
 const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(.2,.12,.64,.52);shape.quadraticCurveTo(.75,.12,.36,0);shape.quadraticCurveTo(.76,-.13,.64,-.52);shape.quadraticCurveTo(.2,-.12,0,0);return new THREE.ShapeGeometry(shape,18);
}
export function createLearningFish(host){
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return ()=>{};}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setSize(host.clientWidth,host.clientHeight);host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-10,10,6,-6,.1,40);camera.position.set(0,0,14);camera.lookAt(0,0,0);
 const body=bodyGeometry(),fin=finGeometry(),eyeGeometry=new THREE.SphereGeometry(.046,12,10),markGeometry=new THREE.SphereGeometry(.19,20,12);
 const silver=new THREE.MeshStandardMaterial({color:'#bbc2c0',vertexColors:true,roughness:.54,metalness:.16}),bronze=new THREE.MeshStandardMaterial({color:'#aa6a38',vertexColors:true,roughness:.5,metalness:.24});
 const silverFin=new THREE.MeshStandardMaterial({color:'#a4afaf',transparent:true,opacity:.48,side:THREE.DoubleSide,roughness:.65,metalness:.1,depthWrite:false}),bronzeFin=silverFin.clone();bronzeFin.color.set('#9a7d5c');
 const rayGeometry=new THREE.BufferGeometry().setFromPoints([-.42,-.21,0,.21,.42].flatMap(y=>[new THREE.Vector3(0,0,.015),new THREE.Vector3(.63,y,.015)]));
 const rayMaterial=new THREE.LineBasicMaterial({color:'#71817e',transparent:true,opacity:.28});
 const eyeMaterial=new THREE.MeshStandardMaterial({color:'#0b0c0c',roughness:.14}),markMaterial=new THREE.MeshStandardMaterial({color:'#b64e30',roughness:.55});
 const fish=[];
 [[-.36,.22,-.95,1.18],[-.37,-.24,.42,1],[.37,.23,2.8,1.3],[.34,-.29,-2.7,1.05]].forEach(([x,y,angle,scale],i)=>{
  const group=new THREE.Group(),isBronze=i===3,material=isBronze?bronze:silver,finMaterial=isBronze?bronzeFin:silverFin;
  group.add(new THREE.Mesh(body,material));
  const tail=new THREE.Mesh(fin,finMaterial);tail.position.set(1.13,.01,0);tail.add(new THREE.LineSegments(rayGeometry,rayMaterial));group.add(tail);
  const fins=[];for(const side of [-1,1]){const wing=new THREE.Mesh(fin,finMaterial);wing.position.set(-.16,.58+side*.25,-.08);wing.scale.set(.58,.6,.6);wing.rotation.z=side*1.1;group.add(wing);fins.push(wing);const eye=new THREE.Mesh(eyeGeometry,eyeMaterial);eye.position.set(-.92,.18+side*.13,.19);group.add(eye);}
  if(!isBronze){const mark=new THREE.Mesh(markGeometry,markMaterial);mark.position.set(-.78,.27,.29);mark.scale.set(.8,1.05,.12);group.add(mark);}
  group.scale.setScalar(scale);group.rotation.set(.12*(i-1),-.15,angle);scene.add(group);fish.push({group,tail,fins,x,y,angle,index:i});
 });
 const ambient=new THREE.HemisphereLight('#f2f5f4','#202729',2.1),key=new THREE.DirectionalLight('#fff5e7',3.2),edge=new THREE.DirectionalLight('#c4d8e3',1.2);key.position.set(-3,5,8);edge.position.set(5,-3,3);scene.add(ambient,key,edge);
 const preference=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last=0,time=0,visible=false,disposed=false,worldHeight=12;
 const paint=now=>{
  frame=0;if(disposed||!visible||document.hidden)return;
  if(now-last>=1000/30||preference.matches){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!preference.matches)time+=dt;
   fish.forEach(f=>{const phase=time*.2+f.index*1.8;f.group.position.set(f.x*20+Math.sin(phase)*.3,f.y*worldHeight+Math.cos(phase*.8)*.24,-1-f.index*.1);f.group.rotation.z=f.angle+Math.sin(phase)*.08;f.tail.rotation.z=-.65+Math.sin(time*2.2+f.index)*.13;f.fins.forEach((wing,i)=>wing.rotation.x=Math.sin(time*1.8+f.index+i)*.2);});renderer.render(scene,camera);}
  if(!preference.matches)frame=requestAnimationFrame(paint);
 };
 const wake=()=>{if(!frame&&!disposed&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(paint);}};
 const resize=()=>{const width=host.clientWidth,height=host.clientHeight;worldHeight=20*height/Math.max(1,width);camera.top=worldHeight/2;camera.bottom=-worldHeight/2;camera.updateProjectionMatrix();renderer.setSize(width,height);wake();};
 const sync=()=>{cancelAnimationFrame(frame);frame=0;last=0;wake();};
 const theme=()=>{const light=document.documentElement.dataset.theme==='light';silver.color.set(light?'#7c8988':'#bbc2c0');silverFin.color.set(light?'#7e9290':'#a4afaf');ambient.intensity=light?1.8:2.1;wake();};
 const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{rootMargin:'80px'});io.observe(host);const ro=new ResizeObserver(resize);ro.observe(host);const mutation=new MutationObserver(theme);mutation.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);resize();theme();
 return()=>{disposed=true;cancelAnimationFrame(frame);io.disconnect();ro.disconnect();mutation.disconnect();document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync);[body,fin,eyeGeometry,markGeometry,rayGeometry].forEach(g=>g.dispose());[silver,bronze,silverFin,bronzeFin,eyeMaterial,markMaterial,rayMaterial].forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
}
