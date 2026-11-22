// Quiet wing-air and a soft landing chirp; audio is unlocked only by user input.
export function createContactBirdSound() {
  let context;
  const voices = new Set();
  const allowed = () => !document.hidden && document.documentElement.dataset.sound !== 'off';
  const unlock = () => {
    if (!allowed()) return;
    try {
      const Engine = window.AudioContext || window.webkitAudioContext;
      if (!Engine) return;
      context ||= new Engine({ latencyHint: 'interactive' });
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch { /* Decoration must never block navigation. */ }
  };
  const stop = () => {
    for (const source of voices) { try { source.stop(); } catch { /* Already ended. */ } }
    voices.clear();
  };
  const play = () => {
    stop();
    if (!allowed() || context?.state !== 'running') return;
    const at = context.currentTime + .01;
    const track = (source, nodes) => {
      voices.add(source);
      source.onended = () => { voices.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
    };
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 2.25), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const air = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    air.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 1700; filter.Q.value = .65;
    gain.gain.setValueAtTime(.0001, at);
    for (let i = 0; i < 5; i++) {
      const beat = at + .12 + i * .32;
      gain.gain.linearRampToValueAtTime(.009 - i * .001, beat + .08);
      gain.gain.linearRampToValueAtTime(.0001, beat + .25);
    }
    air.connect(filter).connect(gain).connect(context.destination);
    track(air, [filter, gain]); air.start(at); air.stop(at + 2.25);
    for (const [offset, from, to] of [[1.82, 880, 1174], [1.98, 1174, 990]]) {
      const tone = context.createOscillator(), envelope = context.createGain(), start = at + offset;
      tone.type = 'sine'; tone.frequency.setValueAtTime(from, start); tone.frequency.exponentialRampToValueAtTime(to, start + .17);
      envelope.gain.setValueAtTime(.0001, start); envelope.gain.exponentialRampToValueAtTime(.007, start + .025); envelope.gain.exponentialRampToValueAtTime(.0001, start + .23);
      tone.connect(envelope).connect(context.destination); track(tone, [envelope]); tone.start(start); tone.stop(start + .25);
    }
  };
  return { unlock, play, stop, dispose() { stop(); context?.close().catch(() => {}); context = undefined; } };
}
