// The reference slider uses synthesized friction and mechanical detents, not an audio file.
// Keep its filter/envelope values, with a quiet master bus for this portfolio.
let context,bus,sliderPan,noise,transientNoise,friction,frictionLevel,frictionBand,tail,lastPosition=0,lastTick=0;
const sources=new Set();
function allowed(){return !document.hidden&&document.documentElement.dataset.sound!=='off';}
export function unlockLearningSound(){
 if(!allowed())return;
 try{
  const Engine=window.AudioContext||window.webkitAudioContext;if(!Engine)return;
  if(!context){context=new Engine({latencyHint:'interactive'});bus=context.createGain();bus.gain.value=.32;const compressor=context.createDynamicsCompressor();compressor.threshold.value=-10;bus.connect(compressor).connect(context.destination);sliderPan=context.createStereoPanner();sliderPan.pan.value=-.85;sliderPan.connect(bus);
   noise=context.createBuffer(1,Math.ceil(context.sampleRate*2.5),context.sampleRate);const samples=noise.getChannelData(0);let a=0,b=0,c=0,d=0,e=0,f=0,g=0;
   for(let i=0;i<samples.length;i++){const n=2*Math.random()-1;a=.99886*a+.0555179*n;b=.99332*b+.0750759*n;c=.969*c+.153852*n;d=.8665*d+.3104856*n;e=.55*e+.5329522*n;f=-.7616*f-.016898*n;samples[i]=(a+b+c+d+e+f+g+.5362*n)*.11;g=.115926*n;}
   transientNoise=context.createBuffer(1,Math.ceil(context.sampleRate*.05),context.sampleRate);const transientSamples=transientNoise.getChannelData(0);for(let i=0;i<transientSamples.length;i++)transientSamples[i]=Math.random()*2-1;
   friction=context.createBufferSource();friction.buffer=noise;friction.loop=true;frictionBand=context.createBiquadFilter();frictionBand.type='bandpass';frictionBand.frequency.value=900;frictionBand.Q.value=.8;frictionLevel=context.createGain();frictionLevel.gain.value=0;friction.connect(frictionBand).connect(frictionLevel).connect(sliderPan);friction.start();
  }
  if(context.state==='suspended')context.resume().catch(()=>{});
 }catch{/* Audio support must never gate the gallery. */}
}
function ready(){return allowed()&&context?.state==='running';}
function burst({gain=.2,decay=.02,band,hp,lp,q=1.5,delay=0,spatial=false}){
 if(!ready())return;const source=context.createBufferSource();source.buffer=transientNoise;source.playbackRate.value=.9+Math.random()*.2;let node=source;const nodes=[source];
 for(const [type,value] of [['bandpass',band],['highpass',hp],['lowpass',lp]])if(value){const filter=context.createBiquadFilter();filter.type=type;filter.frequency.value=value;filter.Q.value=q;node.connect(filter);node=filter;nodes.push(filter);}
 const envelope=context.createGain(),at=context.currentTime+delay;envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),at+.0003);envelope.gain.exponentialRampToValueAtTime(.0001,at+decay);node.connect(envelope).connect(spatial?sliderPan:bus);nodes.push(envelope);sources.add(source);source.onended=()=>{nodes.forEach(n=>n.disconnect());sources.delete(source);};source.start(at);source.stop(at+decay+.02);
}
function tone(from,to,gain,duration,delay=0,spatial=false){if(!ready())return;const oscillator=context.createOscillator(),envelope=context.createGain(),at=context.currentTime+delay;oscillator.frequency.setValueAtTime(from,at);oscillator.frequency.exponentialRampToValueAtTime(to,at+duration);envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(gain,at+.003);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(envelope).connect(spatial?sliderPan:bus);sources.add(oscillator);oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();sources.delete(oscillator);};oscillator.start(at);oscillator.stop(at+duration+.02);}
export function learningSlideSound(position,velocity,maximum=7){
 if(!ready())return;const speed=Math.min(1,Math.abs(velocity)/5),now=context.currentTime;
 sliderPan.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,(position/Math.max(1,maximum)*2-1)*.85)),now,.045);
 frictionLevel.gain.setTargetAtTime(speed>.01?.26*speed**.55:0,now,.025);frictionBand.frequency.setTargetAtTime(500+2100*speed,now,.04);
 clearTimeout(tail);tail=setTimeout(()=>{if(context?.state==='running')frictionLevel.gain.setTargetAtTime(0,context.currentTime,.03);},90);
 const detent=Math.round(position*5),previous=Math.round(lastPosition*5);lastPosition=position;
 if(detent===previous||performance.now()-lastTick<22)return;lastTick=performance.now();
 if(detent%5===0){const intensity=.5+.5*speed,cutoff=3400+2400*intensity;burst({spatial:true,gain:.6*intensity,decay:.008,hp:1100,lp:cutoff});burst({spatial:true,gain:.32*intensity,decay:.02,band:640,q:2});burst({spatial:true,gain:.16*intensity,decay:.005,hp:1700,lp:cutoff,delay:.008});tone(120,62,.09*intensity,.035,0,true);}
 else burst({spatial:true,gain:.04+.08*speed,decay:.003,band:4200,q:1.8});
}
export function computerSound(phase){
 // Automatic entrance remains silent until a visitor has unlocked page audio.
 if(!ready())return;
 if(phase==='hold'){burst({gain:.16,decay:.04,band:520});tone(140,70,.045,.07);}
 if(phase==='power'){burst({gain:.08,decay:.08,hp:1800,lp:6200});tone(660,1320,.018,.36);}
 if(phase==='boot'){tone(262,262,.025,.3);tone(392,392,.018,.32,.06);tone(524,524,.012,.35,.12);}
 if(phase==='zoom')burst({gain:.07,decay:.32,band:800,q:.6});
}
export function stopLearningSound(){clearTimeout(tail);if(context?.state==='running')frictionLevel.gain.setTargetAtTime(0,context.currentTime,.015);sources.forEach(source=>{try{source.stop();}catch{}});}
export function disposeLearningSound(){
 stopLearningSound();sources.clear();
 try{friction?.stop();friction?.disconnect();frictionBand?.disconnect();frictionLevel?.disconnect();sliderPan?.disconnect();bus?.disconnect();}catch{/* Already stopped. */}
 context?.close().catch(()=>{});context=bus=sliderPan=noise=transientNoise=friction=frictionLevel=frictionBand=undefined;
}
// A quiet CRT discharge and warm restart, both tied to intentional power-button input.
export function monitorPowerSound(powerOn=false){
 unlockLearningSound();
 const play=()=>{if(!ready())return;stopLearningSound();if(powerOn){tone(370,1050,.018,.26);burst({gain:.025,decay:.06,band:1800,q:.7});}else{tone(1350,180,.018,.24);tone(150,58,.024,.12);burst({gain:.035,decay:.035,hp:1700,lp:5500,q:.6});}};
 if(context?.state==='suspended')context.resume().then(play).catch(()=>{});else play();
}
