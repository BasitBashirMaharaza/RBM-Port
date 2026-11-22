// Small synthesized foley; one reusable audio engine, unlocked only by a gesture.
export function createHeroRobotSound(){
 let context,noise,disposed=false,visible=false,last=-Infinity,lastKind='',active=[];
 const allowed=()=>!disposed&&visible&&!document.hidden&&document.documentElement.dataset.sound!=='off';
 const stop=()=>{for(const voice of active){try{voice.gain.gain.cancelScheduledValues(context.currentTime);voice.gain.gain.setTargetAtTime(0,context.currentTime,.006);voice.source.stop(context.currentTime+.025);}catch{}}active=[];};
 const unlock=()=>{if(!allowed())return;try{const Engine=window.AudioContext||window.webkitAudioContext;if(!Engine)return;context||=new Engine({latencyHint:'interactive'});if(context.state==='suspended')return context.resume().catch(()=>{});}catch{}};
 function output(source,filter,duration,volume,pan=0){
  const at=context.currentTime+.003,gain=context.createGain(),stereo=context.createStereoPanner?.();
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter||gain);if(filter)filter.connect(gain);
  if(stereo){stereo.pan.value=Math.max(-.5,Math.min(.5,pan));gain.connect(stereo).connect(context.destination);}else gain.connect(context.destination);
  const voice={source,gain};active.push(voice);source.onended=()=>{source.disconnect();filter?.disconnect();gain.disconnect();stereo?.disconnect();active=active.filter(v=>v!==voice);};source.start(at);source.stop(at+duration+.015);return at;
 }
 function tone(notes,duration,volume,pan){const source=context.createOscillator();source.type='sine';const at=context.currentTime+.003;source.frequency.setValueAtTime(notes[0],at);source.frequency.exponentialRampToValueAtTime(notes[1],at+duration*.48);source.frequency.exponentialRampToValueAtTime(notes[2],at+duration*.9);output(source,null,duration,volume,pan);}
 function foley(from,to,duration,volume,pan){
  if(!noise){noise=context.createBuffer(1,context.sampleRate,context.sampleRate);const samples=noise.getChannelData(0);let soft=0;for(let i=0;i<samples.length;i++){soft=.78*soft+.22*(Math.random()*2-1);samples[i]=soft;}}
  const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=noise;filter.type='bandpass';filter.Q.value=.65;const at=context.currentTime+.003;filter.frequency.setValueAtTime(from,at);filter.frequency.exponentialRampToValueAtTime(to,at+duration);output(source,filter,duration,volume,pan);
 }
 function play(kind,pan=0){
  if(!allowed()||context?.state!=='running'||document.querySelector('.intro-video-overlay,.robot-quote-dialog[open]'))return;
  const now=performance.now(),interval=kind==='touch'?450:80;if(now-last<interval&&!(kind==='click'&&lastKind!=='click'))return;last=now;lastKind=kind;stop();
  if(kind==='jump'){foley(650,1550,.24,.009,pan);tone([190,310,365],.22,.003,pan);}
  else if(kind==='landing'){foley(850,330,.115,.011,pan);tone([155,100,76],.14,.004,pan);}
  else if(kind==='touch'){tone([610,840,720],.15,.007,pan);foley(2100,1500,.06,.006,pan);}
  else if(kind==='click'){
   const pick=Math.floor(Math.random()*3),notes=[[580,790,960],[450,390,540],[540,830,680]][pick],duration=[.32,.28,.43][pick];tone(notes,duration,.011,pan);foley(1900,900,.055,.008,pan);
  }
 }
 const visibility=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',visibility);
 return {unlock,play,setVisible(value){visible=value;if(!value)stop();},dispose(){disposed=true;stop();document.removeEventListener('visibilitychange',visibility);context?.close().catch(()=>{});noise=null;}};
}
