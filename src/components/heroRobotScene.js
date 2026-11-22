import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Lightweight procedural skin: the supplied mesh has no authored skeleton.
// Soft weights keep the original connected surface intact at every joint.
export async function createHeroRobot(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(128,128,false);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.01,20);
 camera.position.set(0,.59,2.4);camera.lookAt(0,.5,0);
 scene.add(new THREE.HemisphereLight(0xf0f5ff,0x777583,2.5));
 const light=new THREE.DirectionalLight(0xffffff,3.4);light.position.set(-2,3,4);scene.add(light);
 const rim=new THREE.DirectionalLight(0xb4caff,2);rim.position.set(2,1,-2);scene.add(rim);
 let model;try{model=await new GLTFLoader().loadAsync('/robot/companion.glb');}catch(error){renderer.dispose();throw error;}
 model.scene.updateMatrixWorld(true);
 const source=model.scene.children.find(node=>node.isMesh),geometry=source.geometry.clone().applyMatrix4(source.matrixWorld);
 geometry.computeBoundingBox();const box=geometry.boundingBox,center=box.getCenter(new THREE.Vector3()),height=box.max.y-box.min.y;
 geometry.translate(-center.x,-box.min.y,-center.z);geometry.scale(1/height,1/height,1/height);
 const body=new THREE.Bone(),head=new THREE.Bone(),leftArm=new THREE.Bone(),rightArm=new THREE.Bone(),leftLeg=new THREE.Bone(),rightLeg=new THREE.Bone(),leftKnee=new THREE.Bone(),rightKnee=new THREE.Bone();
 head.position.y=.75;leftArm.position.set(-.21,.64,0);rightArm.position.set(.21,.64,0);leftLeg.position.set(-.11,.37,0);rightLeg.position.set(.11,.37,0);leftKnee.position.y=rightKnee.position.y=-.19;
 body.add(head,leftArm,rightArm,leftLeg,rightLeg);leftLeg.add(leftKnee);rightLeg.add(rightKnee);
 const bones=[body,head,leftArm,rightArm,leftLeg,rightLeg,leftKnee,rightKnee],positions=geometry.attributes.position;
 const indices=new Uint16Array(positions.count*4),weights=new Float32Array(positions.count*4),smooth=(a,b,v)=>THREE.MathUtils.smoothstep(v,a,b);
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),y=positions.getY(i),arm=smooth(.17,.25,Math.abs(x))*(1-smooth(.66,.74,y))*smooth(.25,.35,y),leg=(1-smooth(.31,.41,y))*(1-arm),headWeight=smooth(.74,.82,y),knee=1-smooth(.12,.23,y);
  indices.set([0,1,arm>leg?(x<0?2:3):(x<0?4:5),x<0?6:7],i*4);
  const limb=Math.max(arm,leg);weights.set([Math.max(0,1-headWeight-limb),headWeight,limb*(leg>arm?1-knee:1),leg>arm?limb*knee:0],i*4);
 }
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
 const mesh=new THREE.SkinnedMesh(geometry,source.material);mesh.add(body);mesh.bind(new THREE.Skeleton(bones));mesh.normalizeSkinWeights();mesh.frustumCulled=false;
 const group=new THREE.Group();group.add(mesh);scene.add(group);group.rotation.y=-.14;
 let frame=0,last=0,visible=true,disposed=false,phase='waiting',progress=0,direction=1,mood='curious',gait=0,fearSide=1,projecting=false,cursorX=0,cursorY=0,tracking=false,projectionSurface=null,projectionContext=null;
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
 const glowContext=glowCanvas.getContext('2d'),glowGradient=glowContext.createRadialGradient(32,32,1,32,32,32);glowGradient.addColorStop(0,'#ffffff');glowGradient.addColorStop(.16,'#ffffffcc');glowGradient.addColorStop(1,'#ffffff00');glowContext.fillStyle=glowGradient;glowContext.fillRect(0,0,64,64);
 const glowTexture=new THREE.CanvasTexture(glowCanvas),glowMaterial=new THREE.SpriteMaterial({map:glowTexture,color:0xffdda0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
 const glowGroup=new THREE.Group();for(const x of [-.052,.052]){const eye=new THREE.Sprite(glowMaterial);eye.position.set(x,.065,.25);eye.scale.set(.105,.105,.105);glowGroup.add(eye);}head.add(glowGroup);glowGroup.visible=false;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const pose=(object,key,target,blend)=>{object.rotation[key]=THREE.MathUtils.lerp(object.rotation[key],target,blend);};
 const easePose=q=>q*q*(3-2*q),smoothSpawn=easePose;
 const paint=now=>{
  frame=0;if(disposed||!visible||document.hidden)return;
  if(motion.matches||now-last>=32){
   const dt=Math.min(.06,(now-last)/1000||.033);last=now;gait+=dt;
   const t=now/1000,q=progress,quiet=motion.matches,blend=quiet?1:1-Math.exp(-dt*13);
   const rest=phase==='resting',sit=rest?1:phase==='sittingDown'?easePose(q):phase==='standingUp'?1-easePose(q):0;
   const walk=phase==='walking',climb=phase==='climbing',jump=phase==='jumping',launch=phase==='takeoff',land=phase==='landing';
   const hesitating=phase==='hesitating',afraid=mood==='afraid'||hesitating;
   const travel=walk||jump||launch||land||hesitating||phase==='standingUp';
   const step=Math.sin(gait*(climb?12:walk?15:2)),stride=walk?.5:climb?.65:0;
   const compression=phase==='spawn'?(1-smoothSpawn(q))*.7:launch?Math.sin(q*Math.PI/2):land?Math.sin(q*Math.PI):0;
   const happy=mood==='happy',sad=mood==='sad',angry=mood==='angry';
   const wave=rest&&happy&&q<.55&&!quiet;
   const turn=projecting?0:climb?-.9:travel?direction*1.2:-.15;
   pose(group,'y',quiet?-.15:turn,blend*.7);
   group.position.y=THREE.MathUtils.lerp(group.position.y,-.34*sit-compression*.035+(walk?Math.abs(step)*.018:0),blend);
   pose(group,'z',quiet?0:walk?-direction*.045:rest?(afraid?fearSide*.07:Math.sin(t*1.2)*.018):0,blend);
   pose(group,'x',quiet?0:walk?.08:launch?.13:0,blend);
   head.position.y=THREE.MathUtils.lerp(head.position.y,.75+(happy?.006:0),blend);
   pose(head,'x',quiet?0:tracking?cursorY*.28:hesitating?.52:afraid?.2:sad?.32:angry?-.12:rest?Math.sin(t*1.5)*.055:climb?-.12:phase==='spawn'?-.16:-.025,blend);
   pose(head,'y',quiet?0:projecting?0:tracking?cursorX*.48:afraid?fearSide*.28:angry?Math.sin(t*12)*.13:rest?Math.sin(t*.9)*.1:0,blend);
   pose(head,'z',quiet?0:afraid?-fearSide*.09:sad?-.13:happy?.1:rest?Math.sin(t*.8)*.05:0,blend);
   const swing=quiet?0:step*stride,fold=jump?Math.sin(q*Math.PI)*.5:compression*.3;
   pose(leftLeg,'x',-1.48*sit+swing*(1-sit)-fold,blend);
   pose(rightLeg,'x',-1.48*sit-swing*(1-sit)-fold,blend);
   const dangle=quiet?0:Math.sin(t*2.9)*.12*sit;
   pose(leftKnee,'x',1.58*sit+dangle+Math.max(0,-swing)*1.35+fold*1.5,blend);
   pose(rightKnee,'x',1.58*sit-dangle+Math.max(0,swing)*1.35+fold*1.5,blend);
   const armSwing=quiet?0:step*(walk?.32:climb?.75:0);
   pose(leftArm,'x',afraid?-.35:angry?.65:climb?-1.35+armSwing:jump?-.65:walk?-armSwing:sad?.25:0,blend);
   pose(rightArm,'x',afraid?-.35:angry?.65:climb?-1.35-armSwing:jump?-.65:walk?armSwing:sad?.25:0,blend);
   pose(leftArm,'z',quiet?.1:afraid?-.25+Math.sin(t*13)*.018:angry?-.35:jump?.4:rest?.15:0,blend);
   pose(rightArm,'z',quiet?-.1:afraid?.25-Math.sin(t*13)*.018:wave?-1.9+Math.sin(t*10)*.28:angry?.35:jump?-.4:rest?-.15:0,blend);
   pose(leftArm,'y',angry?-.7:0,blend);pose(rightArm,'y',angry?.7:0,blend);
   glowMaterial.opacity=THREE.MathUtils.lerp(glowMaterial.opacity,projecting?.85:0,quiet?1:blend);glowGroup.visible=glowMaterial.opacity>.01;
   renderer.render(scene,camera);
   if(projectionContext){projectionContext.clearRect(0,0,projectionSurface.width,projectionSurface.height);projectionContext.drawImage(canvas,0,0,projectionSurface.width,projectionSurface.height);}
  }
  if(!motion.matches)frame=requestAnimationFrame(paint);
 };
 const wake=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(paint);};
 const sync=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
 document.addEventListener('visibilitychange',sync);motion.addEventListener('change',wake);wake();
 return {
  setMotion(state){phase=state.phase;progress=state.progress;direction=state.direction||direction;mood=state.mood;fearSide=state.fearSide||fearSide;cursorX=state.cursorX||0;cursorY=state.cursorY||0;tracking=Boolean(state.tracking);wake();},
  getEyeOrigin(){const point=glowGroup.localToWorld(new THREE.Vector3(0,.065,.25)).project(camera),rect=canvas.getBoundingClientRect();return{x:rect.left+(point.x+1)*rect.width/2,y:rect.top+(1-point.y)*rect.height/2};},
  getProjectionFrame(){const rect=canvas.getBoundingClientRect(),eyes=glowGroup.children.map(eye=>{const point=eye.getWorldPosition(new THREE.Vector3()).project(camera);return{x:rect.left+(point.x+1)*rect.width/2,y:rect.top+(1-point.y)*rect.height/2};});return{rect:{x:rect.left,y:rect.top,width:rect.width,height:rect.height},eyes};},
  setProjection(value,surface){projecting=value;projectionSurface=value?surface:null;projectionContext=projectionSurface?.getContext('2d')||null;if(projectionSurface){projectionSurface.width=canvas.width;projectionSurface.height=canvas.height;}wake();},
  setVisible(value){visible=value;if(value)wake();else{cancelAnimationFrame(frame);frame=0;}},
  dispose(){disposed=true;projectionSurface=null;projectionContext=null;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',wake);glowTexture.dispose();glowMaterial.dispose();geometry.dispose();source.geometry.dispose();mesh.skeleton.dispose();const textures=new Set();Object.values(source.material).forEach(v=>{if(v?.isTexture)textures.add(v)});textures.forEach(texture=>texture.dispose());source.material.dispose();renderer.dispose();}
 };
}

