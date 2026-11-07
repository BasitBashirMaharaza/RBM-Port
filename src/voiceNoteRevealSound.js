export function playVoiceNoteRevealSound() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  try {
    const context = new AudioEngine({ latencyHint: 'interactive' });
    if (context.state === 'suspended') context.resume().catch(() => {});
    const start = context.currentTime + .01;

    const noise = context.createBuffer(1, Math.ceil(context.sampleRate * 1.05), context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;
    const whoosh = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const whooshGain = context.createGain();
    whoosh.buffer = noise;
    filter.type = 'bandpass';
    filter.Q.value = .5;
    filter.frequency.setValueAtTime(280, start);
    filter.frequency.exponentialRampToValueAtTime(1500, start + .47);
    filter.frequency.exponentialRampToValueAtTime(450, start + 1.05);
    whooshGain.gain.setValueAtTime(.0001, start);
    whooshGain.gain.exponentialRampToValueAtTime(.045, start + .4);
    whooshGain.gain.exponentialRampToValueAtTime(.0001, start + 1.05);
    whoosh.connect(filter).connect(whooshGain).connect(context.destination);
    whoosh.start(start);
    whoosh.stop(start + 1.05);

    const tone = context.createOscillator();
    const toneGain = context.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(370, start + .07);
    tone.frequency.exponentialRampToValueAtTime(620, start + .48);
    toneGain.gain.setValueAtTime(.0001, start + .07);
    toneGain.gain.exponentialRampToValueAtTime(.023, start + .31);
    toneGain.gain.exponentialRampToValueAtTime(.0001, start + 1.12);
    tone.connect(toneGain).connect(context.destination);
    tone.start(start + .07);
    tone.stop(start + 1.12);
    tone.onended = () => { context.close().catch(() => {}); };
  } catch { /* The visual reveal works without audio. */ }
}
