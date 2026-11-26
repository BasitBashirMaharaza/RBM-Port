// Soft mechanical transients: no downloaded effects, loops or autoplay retries.
export function createArchiveSound(){
 const lidBuffers=new Map();
 let context,noise,disposed=false,last=-Infinity,lastKind='',active=[];
 const enabled=()=>!disposed&&!document.hidden&&document.documentElement.dataset.sound!=='off';
 function unlock(){if(!enabled())return;try{const Engine=window.AudioContext||window.webkitAudioContext;if(!Engine)return;context||=new Engine({latencyHint:'interactive'});if(context.state==='suspended')context.resume().catch(()=>{});}catch{}}
 function stop(){for(const {source,gain} of active){try{gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(0,context.currentTime,.009);source.stop(context.currentTime+.045);}catch{}}active=[];}
 // A quiet electronic latch: fixed resonances, no noise wash or sweeping pitch.
 function playLid(kind){
  const opening=kind==='open',duration=opening?.42:.34;
  let buffer=lidBuffers.get(kind);
  if(!buffer){
   buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
   const samples=buffer.getChannelData(0),fundamental=opening?420:350;
   const resonance=(t,hz,decay)=>t<0?0:(1-Math.exp(-t/.012))*Math.exp(-t/decay)*Math.sin(2*Math.PI*hz*t);
   for(let i=0;i<samples.length;i++){
    const t=i/context.sampleRate,tail=Math.min(1,(duration-t)/.05);
    const body=resonance(t,fundamental,.095)*.16;
    const overtone=resonance(t-.024,fundamental*1.5,.075)*.055;
    const latch=resonance(t-(opening?.055:.11),fundamental*3,.028)*.022;
    samples[i]=(body+overtone+latch)*tail;
   }
   lidBuffers.set(kind,buffer);
  }
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  source.buffer=buffer;filter.type='lowpass';filter.Q.value=.5;filter.frequency.value=1900;
  const at=context.currentTime+.003;
  gain.gain.setValueAtTime(.065,at);
  source.connect(filter).connect(gain).connect(context.destination);active.push({source,gain});
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();active=active.filter(voice=>voice.source!==source);};source.start(at);source.stop(at+duration+.02);
 }
 function play(kind,index=0){
  if(!enabled()||context?.state!=='running')return;
  const now=performance.now(),interval=kind==='hover'?100:(kind==='open'||kind==='close'?350:65);
  if(now-last<interval&&(kind==='hover'||kind===lastKind))return;
  last=now;lastKind=kind;stop();
  if(kind==='open'||kind==='close'){playLid(kind);return;}
  const duration=kind==='hover'?.075:kind==='click'?.16:kind==='open'?.52:kind==='close'?.4:.23;
  if(!noise){noise=context.createBuffer(1,context.sampleRate,context.sampleRate);const data=noise.getChannelData(0);let fibre=0;for(let i=0;i<data.length;i++){fibre=.72*fibre+.28*(Math.random()*2-1);data[i]=fibre;}}
  const at=context.currentTime+.003,source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),pan=context.createStereoPanner();source.buffer=noise;source.playbackRate.value=.96+index*.014;
  filter.type='bandpass';filter.Q.value=kind==='hover'?1.5:.65;
  filter.frequency.setValueAtTime(kind==='hover'?2300:kind==='click'?1100:kind==='open'?430:950,at);
  filter.frequency.exponentialRampToValueAtTime(kind==='open'?1400:kind==='close'?260:700,at+duration);
  const volume=kind==='hover'?.045:kind==='click'?.095:.085;
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.007);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  pan.pan.value=kind==='hover'||kind==='click'?Math.max(-.55,Math.min(.55,(index-2)*.22)):0;
  source.connect(filter).connect(gain).connect(pan).connect(context.destination);active.push({source,gain});
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();active=active.filter(voice=>voice.source!==source);};source.start(at);source.stop(at+duration+.02);
  if(kind!=='hover'){
   const body=context.createOscillator(),level=context.createGain(),start=kind==='close'?at+duration*.65:at;const length=kind==='open'?.12:.075;
   body.frequency.setValueAtTime(kind==='click'?165:kind==='open'?110:85,start);body.frequency.exponentialRampToValueAtTime(kind==='open'?155:48,start+length);level.gain.setValueAtTime(.0001,start);level.gain.exponentialRampToValueAtTime(.022,start+.004);level.gain.exponentialRampToValueAtTime(.0001,start+length);body.connect(level).connect(context.destination);active.push({source:body,gain:level});body.onended=()=>{body.disconnect();level.disconnect();active=active.filter(voice=>voice.source!==body);};body.start(start);body.stop(start+length+.02);
  }
 }
 return{unlock,play,stop,dispose(){disposed=true;stop();context?.close().catch(()=>{});noise=null;lidBuffers.clear();}};
}

