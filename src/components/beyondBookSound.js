export function createBeyondBookSound(){
 let context,noise,disposed=false,active=[],last=-Infinity;
 const enabled=()=>!disposed&&!document.hidden&&document.documentElement.dataset.sound!=='off';
 const stop=()=>{for(const v of active){try{v.gain.gain.setTargetAtTime(0,context.currentTime,.008);v.source.stop(context.currentTime+.03);}catch{}}active=[];};
 const unlock=()=>{if(!enabled())return;try{const Engine=window.AudioContext||window.webkitAudioContext;if(!Engine)return;context||=new Engine({latencyHint:'interactive'});if(context.state==='suspended')return context.resume().catch(()=>{});}catch{}};
 function play(kind,pan=0,theme){
  if(!enabled()||context?.state!=='running')return;const now=performance.now();if(now-last<(kind==='hover'?180:kind==='tick'?110:75))return;last=now;stop();
  const settings={hover:[.07,1900,1100,.014],tick:[.09,1400,700,.02],select:[.15,1300,650,.025],open:[.44,450,1400,.035],hinge:[.36,700,1600,.03],page:[.3,1800,650,.029],cover:[.32,850,400,.03],close:[.34,1100,320,.032],powerOff:[.12,900,380,.014],socialOpen:[.16,1550,850,.013],socialClose:[.13,1100,650,.011]};
  const [duration,baseFrom,baseTo,level]=settings[kind]||settings.select;
  const textures={trails:[.76,523,'sine'],music:[1,659,'sine'],cinema:[.88,196,'triangle'],games:[1.2,392,'triangle'],instagram:[1.12,740,'sine'],youtube:[.95,587,'sine'],threads:[.85,330,'sine'],shopping:[1.06,494,'sine'],food:[.72,784,'sine'],social:[.95,620,'sine']};
  const [tint,pitch,wave]=textures[theme]||[1,440,'sine'];
  const from=baseFrom*tint,to=baseTo*tint;
  if(!noise){noise=context.createBuffer(1,context.sampleRate,context.sampleRate);const data=noise.getChannelData(0);let fibre=0;for(let i=0;i<data.length;i++){fibre=.72*fibre+.28*(Math.random()*2-1);data[i]=fibre;}}
  const gameCue=kind.startsWith('game')?kind:theme==='games'?({open:'gameOpen',hinge:'gameOpen',page:'gamePage',cover:'gamePage',close:'gameClose',powerOff:'gameClose'})[kind]:null;
  if(gameCue){
   const closing=gameCue==='gameClose',page=gameCue==='gamePage',at=context.currentTime+.004;
   const notes=page?[440]:closing?[520,350]:[350,520];
   notes.forEach((pitch,index)=>{
    const source=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter(),start=at+index*.065;
    source.type='triangle';source.frequency.setValueAtTime(pitch,start);source.frequency.exponentialRampToValueAtTime(pitch*(closing?.94:1.02),start+.08);filter.type='lowpass';filter.frequency.value=1500;
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.004,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+.11);
    source.connect(filter).connect(gain).connect(context.destination);active.push({source,gain});source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();active=active.filter(v=>v.source!==source);};source.start(start);source.stop(start+.13);
   });
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noise;filter.type='bandpass';filter.frequency.value=1300;filter.Q.value=.7;gain.gain.setValueAtTime(.012,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.035);source.connect(filter).connect(gain).connect(context.destination);active.push({source,gain});source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();active=active.filter(v=>v.source!==source);};source.start(at);source.stop(at+.045);return;
  }
  const cinemaCue=kind.startsWith('projector')?kind:theme==='cinema'?({open:'projectorOpen',hinge:'projectorOpen',page:'projectorPage',cover:'projectorPage',close:'projectorClose',powerOff:'projectorClose'})[kind]:null;
  if(cinemaCue){
   const closing=cinemaCue==='projectorClose',page=cinemaCue==='projectorPage',at=context.currentTime+.005;
   const pulses=page?[0,.036,.085]:closing?[0,.026,.065,.12,.19]:[0,.055,.098,.135,.166,.192];
   pulses.forEach((delay,index)=>{
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),start=at+delay;
    source.buffer=noise;source.playbackRate.value=closing?1.04-index*.045:.85+index*.04;
    filter.type='bandpass';filter.frequency.value=(closing?1700:1200)+index*90;filter.Q.value=.7;
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(page?.012:.017,start+.002);gain.gain.exponentialRampToValueAtTime(.0001,start+.025);
    source.connect(filter).connect(gain).connect(context.destination);active.push({source,gain});
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();active=active.filter(v=>v.source!==source);};source.start(start);source.stop(start+.04);
   });
   const motor=context.createOscillator(),gain=context.createGain(),length=page?.13:.29;
   motor.type='sine';motor.frequency.setValueAtTime(closing?132:82,at);motor.frequency.exponentialRampToValueAtTime(closing?65:126,at+length);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.003,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
   motor.connect(gain).connect(context.destination);active.push({source:motor,gain});motor.onended=()=>{motor.disconnect();gain.disconnect();active=active.filter(v=>v.source!==motor);};motor.start(at);motor.stop(at+length+.02);
   return;
  }
  const at=context.currentTime+.003,source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),stereo=context.createStereoPanner?.();source.buffer=noise;source.playbackRate.value=.97+Math.random()*.06;filter.type='bandpass';filter.Q.value=.65;filter.frequency.setValueAtTime(from,at);filter.frequency.exponentialRampToValueAtTime(to,at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(level,at+Math.min(.035,duration*.25));gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter).connect(gain);if(stereo){stereo.pan.value=Math.max(-.55,Math.min(.55,pan));gain.connect(stereo).connect(context.destination);}else gain.connect(context.destination);
  active.push({source,gain});source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();stereo?.disconnect();active=active.filter(v=>v.source!==source);};source.start(at);source.stop(at+duration+.02);
  if(theme&&kind!=='hover'&&kind!=='tick'){
   const accent=context.createOscillator(),envelope=context.createGain();
   const start=at+(kind==='page'?.07:.02),length=kind==='open'||kind==='hinge'?.22:.12;
   accent.type=wave;accent.frequency.setValueAtTime(pitch,start);accent.frequency.exponentialRampToValueAtTime(pitch*(kind==='close'||kind==='powerOff'?.75:theme==='music'?1.25:1.035),start+length);
   envelope.gain.setValueAtTime(.0001,start);envelope.gain.exponentialRampToValueAtTime(kind==='page'?.0018:.003,start+.012);envelope.gain.exponentialRampToValueAtTime(.0001,start+length);
   accent.connect(envelope).connect(context.destination);active.push({source:accent,gain:envelope});accent.onended=()=>{accent.disconnect();envelope.disconnect();active=active.filter(v=>v.source!==accent);};accent.start(start);accent.stop(start+length+.015);
  }
  if(kind!=='hover'&&kind!=='page'){
   const body=context.createOscillator(),weight=context.createGain();body.type='sine';body.frequency.setValueAtTime(kind==='close'?115:kind==='open'?170:220,at);body.frequency.exponentialRampToValueAtTime(kind==='close'?65:110,at+Math.min(.16,duration));weight.gain.setValueAtTime(.0001,at);weight.gain.exponentialRampToValueAtTime(kind==='open'||kind==='close'?.008:.004,at+.008);weight.gain.exponentialRampToValueAtTime(.0001,at+Math.min(.17,duration));body.connect(weight).connect(context.destination);active.push({source:body,gain:weight});body.onended=()=>{body.disconnect();weight.disconnect();active=active.filter(v=>v.source!==body);};body.start(at);body.stop(at+Math.min(.18,duration)+.02);
  }
 }
 const visibility=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',visibility);
 const mute=new MutationObserver(()=>{if(document.documentElement.dataset.sound==='off')stop();});mute.observe(document.documentElement,{attributes:true,attributeFilter:['data-sound']});
 return{unlock,play,stop,dispose(){disposed=true;stop();mute.disconnect();document.removeEventListener('visibilitychange',visibility);context?.close().catch(()=>{});noise=null;}};
}
