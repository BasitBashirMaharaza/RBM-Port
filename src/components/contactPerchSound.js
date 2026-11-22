// Small naturalistic chirps and feather rustles. Never unlock audio without user input.
export function createContactPerchSound(){
 let context,last=-Infinity;const voices=new Set();
 const allowed=()=>!document.hidden&&document.documentElement.dataset.sound!=='off';
 const stop=()=>{for(const voice of voices){try{voice.stop();}catch{}}voices.clear();};
 const unlock=()=>{if(!allowed())return;try{const Engine=window.AudioContext||window.webkitAudioContext;if(!Engine)return;context||=new Engine({latencyHint:'interactive'});if(context.state==='suspended')context.resume().catch(()=>{});}catch{}};
 const track=(voice,nodes)=>{voices.add(voice);voice.onended=()=>{voices.delete(voice);voice.disconnect();nodes.forEach(n=>n.disconnect());};};
 const play=kind=>{
  if(!allowed()||context?.state!=='running'||performance.now()-last<1200)return;last=performance.now();stop();const at=context.currentTime+.01;
  if(kind==='stretch'||kind==='preen'){
   const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.15),context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1200;filter.Q.value=.7;gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.006,at+.035);gain.gain.exponentialRampToValueAtTime(.0001,at+.15);source.connect(filter).connect(gain).connect(context.destination);track(source,[filter,gain]);source.start(at);source.stop(at+.16);return;
  }
  for(let n=0;n<2;n++){
   const tone=context.createOscillator(),gain=context.createGain(),t=at+n*.13,variation=Math.random()*160;
   tone.type='sine';tone.frequency.setValueAtTime(1750+variation,t);tone.frequency.exponentialRampToValueAtTime(2550+variation,t+.035);tone.frequency.exponentialRampToValueAtTime(1900+variation,t+.1);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.005,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,t+.115);tone.connect(gain).connect(context.destination);track(tone,[gain]);tone.start(t);tone.stop(t+.12);
  }
 };
 return{unlock,play,stop,dispose(){stop();context?.close().catch(()=>{});context=undefined;}};
}
