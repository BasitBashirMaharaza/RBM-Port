// Filtered friction and soft binding transients, rather than notification tones.
// One voice at a time; audio is unlocked only by an intentional page interaction.
export function createJournalSound() {
  let context;
  let active;
  let ticket = 0;
  let disposed = false;
  function stop() {
    if (!active || !context) return;
    const { source, gain } = active;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setTargetAtTime(0, context.currentTime, .012);
    try { source.stop(context.currentTime + .06); } catch { /* Already ended. */ }
    active = null;
  }
  return {
    async play(kind) {
      if (disposed || document.hidden || kind === 'note' && !navigator.userActivation?.hasBeenActive) return;
      const generation = ++ticket;
      try {
        const Engine = window.AudioContext || window.webkitAudioContext;
        if (!Engine) return;
        context ||= new Engine({ latencyHint: 'interactive' });
        if (context.state === 'suspended') await context.resume();
        if (disposed || generation !== ticket || context.state !== 'running') return;
        stop();
        // Layered, irregular paper fibres with a soft binding contact.
        // No oscillators, chimes, repeated flutter loops, or sharp clicks.
        const duration = kind === 'note' ? .16 : kind === 'turn' ? .72 : kind === 'open' ? .86 : .76;
        const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
        const samples = buffer.getChannelData(0);
        const gestures = kind === 'note' ? [[.35,.2,.4],[.65,.16,.18]] : kind === 'turn' ? [[.22,.13,.55],[.47,.2,.9],[.73,.12,.3]]
          : kind === 'open' ? [[.15,.11,.5],[.4,.23,.7],[.7,.16,.3]]
          : [[.18,.16,.4],[.43,.2,.5],[.73,.09,.65]];
        let fibre = 0;
        let body = 0;
        let fleck = 0;
        for (let i = 0; i < samples.length; i++) {
          const progress = i / samples.length;
          const noise = Math.random() * 2 - 1;
          fibre = .82 * fibre + .18 * noise;
          body = .985 * body + .015 * noise;
          fleck *= .992;
          if (Math.random() < .0007) fleck += (Math.random() - .5) * .035;
          const friction = gestures.reduce((sum,[at,width,level]) => sum + level * Math.exp(-Math.pow((progress-at)/width,2)),0);
          const taper = Math.pow(Math.sin(Math.PI * progress),1.5);
          const binding = kind === 'turn' || kind === 'note' ? 0 : Math.exp(-Math.pow((progress-(kind === 'close' ? .77 : .17))/.065,2));
          samples[i] = ((fibre-body)*friction*.65 + noise*friction*.025 + fleck + body*binding*1.4) * taper;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        const start = context.currentTime;
        filter.frequency.setValueAtTime(kind === 'turn' ? 1400 : 850, start);
        filter.frequency.linearRampToValueAtTime(kind === 'close' ? 700 : 1800, start + duration * .5);
        filter.frequency.linearRampToValueAtTime(650, start + duration);
        const gain = context.createGain();
        gain.gain.setValueAtTime(0, start);
        const volume = kind === 'note' ? .028 : .075;
        gain.gain.linearRampToValueAtTime(volume, start + Math.min(.06,duration*.2));
        gain.gain.setValueAtTime(volume, start + duration - Math.min(.1,duration*.25));
        gain.gain.linearRampToValueAtTime(0, start + duration);
        source.connect(filter).connect(gain).connect(context.destination);
        active = { source, gain };
        source.onended = () => {
          source.disconnect(); filter.disconnect(); gain.disconnect();
          if (active?.source === source) active = null;
        };
        source.start(start);
      } catch { /* Page interactions remain functional when browser audio is blocked. */ }
    },
    dispose() {
      disposed = true;
      ticket++;
      stop();
      if (context && context.state !== 'closed') context.close().catch(() => {});
    },
  };
}
