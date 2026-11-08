let context;
let active = [];
let generation = 0;

function audioContext() {
  if (context) return context;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  context = new AudioContext({ latencyHint: 'interactive' });
  return context;
}

function silenceActive() {
  active.forEach(({ oscillator, gain }) => {
    try {
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0.0001, context.currentTime, 0.016);
      oscillator.stop(context.currentTime + 0.08);
    } catch { /* The note has already finished. */ }
  });
  active = [];
}

export function stopEmailSound() {
  generation += 1;
  silenceActive();
}

export async function playEmailSound(kind) {
  if (document.hidden) return;
  const ticket = ++generation;
  const audio = audioContext();
  if (!audio) return;
  try {
    if (audio.state === 'suspended') await Promise.race([audio.resume(), new Promise((resolve) => window.setTimeout(resolve, 120))]);
  } catch { return; }
  if (audio.state !== 'running' || ticket !== generation) return;
  silenceActive();

  const notes = kind === 'reveal'
    ? [[392, 0, .24, .013, 1.2], [587.33, .085, .3, .008, 1.07]]
    : kind === 'success'
      ? [[392, 0, .2, .014, 1.03], [587.33, .11, .28, .012, 1.01], [783.99, .22, .33, .008, 1]]
      : [[246.94, 0, .3, .016, 1.3], [493.88, .12, .36, .012, 1.12], [739.99, .23, .32, .006, 1.02]];

  const start = audio.currentTime + .008;
  notes.forEach(([frequency, delay, duration, volume, glide]) => {
    const oscillator = audio.createOscillator();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start + delay);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * glide, start + delay + duration);
    filter.type = 'lowpass';
    filter.frequency.value = 1900;
    gain.gain.setValueAtTime(.0001, start + delay);
    gain.gain.exponentialRampToValueAtTime(volume, start + delay + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, start + delay + duration);
    oscillator.connect(filter).connect(gain).connect(audio.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      gain.disconnect();
      active = active.filter((entry) => entry.oscillator !== oscillator);
    };
    active.push({ oscillator, gain });
    oscillator.start(start + delay);
    oscillator.stop(start + delay + duration + .02);
  });
}
