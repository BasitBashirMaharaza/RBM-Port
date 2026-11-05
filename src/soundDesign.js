let context;
let output;
let welcomePending = false;
let welcomeStarting = false;
let welcomeAudio;
let welcomeReady;

const WELCOME_SOUND_URL = '/sounds/welcome-chime.mp3';

const AudioEngine = () => window.AudioContext || window.webkitAudioContext;

function engine() {
  if (context) return context;
  const Context = AudioEngine();
  if (!Context) return null;
  context = new Context({ latencyHint: 'interactive' });
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -22;
  compressor.knee.value = 18;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.18;
  output = context.createGain();
  output.gain.value = 0.72;
  output.connect(compressor).connect(context.destination);
  return context;
}
function hash(value) {
  return [...value].reduce((total, character, index) => (total + character.charCodeAt(0) * (index + 3)) % 997, 0);
}

function voice(frequency, { at = 0, duration = 0.12, volume = 0.018, type = 'sine', glide = 1, cutoff = 1800 } = {}) {
  const audio = engine();
  if (!audio || !output) return;
  const start = Math.max(audio.currentTime + 0.003, at || 0);
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * glide), start + duration);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(filter).connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function welcomeTrack() {
  if (welcomeAudio) return welcomeAudio;
  welcomeAudio = new Audio();
  welcomeAudio.preload = 'auto';
  welcomeAudio.playsInline = true;
  welcomeAudio.volume = 0.18;
  welcomeAudio.src = WELCOME_SOUND_URL;
  return welcomeAudio;
}

export function prepareWelcomeSound() {
  const track = welcomeTrack();
  if (welcomeReady) return welcomeReady;
  welcomeReady = new Promise((resolve) => {
    const finish = () => {
      track.removeEventListener('canplay', finish);
      track.removeEventListener('error', finish);
      resolve();
    };
    if (track.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      finish();
      return;
    }
    track.addEventListener('canplay', finish, { once: true });
    track.addEventListener('error', finish, { once: true });
    track.load();
  });
  return welcomeReady;
}

function playWelcomeTrack() {
  if (!welcomePending || welcomeStarting) return;
  const track = welcomeTrack();
  welcomeStarting = true;
  track.pause();
  track.currentTime = 0;
  const started = track.play();
  if (!started?.then) {
    welcomePending = false;
    welcomeStarting = false;
    return;
  }
  started.then(() => {
    welcomePending = false;
    welcomeStarting = false;
  }).catch(() => {
    welcomeStarting = false;
    // Autoplay may be blocked until a visitor taps or presses a key. Keep this
    // queued so the exact supplied MP3 plays from that first trusted gesture.
  });
}

function flushWelcome() {
  if (!welcomePending) return;
  playWelcomeTrack();
}

export function unlockSound() {
  const audio = engine();
  if (!audio) {
    flushWelcome();
    return;
  }
  // Calling media playback directly inside the input event avoids a delayed
  // retry and satisfies browsers that require a user activation for audio.
  flushWelcome();
  if (audio.state === 'suspended') {
    audio.resume().then(flushWelcome).catch(() => {});
  } else {
    flushWelcome();
  }
}

export function requestWelcomeSound() {
  prepareWelcomeSound();
  welcomePending = true;
  playWelcomeTrack();
}

function soundIdentity(control) {
  return (control.dataset.sound || control.getAttribute('aria-label') || control.textContent || control.getAttribute('href') || 'interface').trim();
}

function soundFamily(control, identity) {
  const value = identity.toLowerCase();
  if (value.includes('theme-switch')) return 'theme';
  if (value.includes('experience-next')) return 'next';
  if (value.includes('experience-previous')) return 'previous';
  if (value.includes('close')) return 'close';
  if (value.includes('profile')) return 'profile';
  if (value.startsWith('orbit-')) return 'orbit';
  if (value.startsWith('explore-') || control.classList.contains('primary-button') || control.classList.contains('nav-cta')) return 'cta';
  if (value.startsWith('nav-') || control.classList.contains('expandable-tab') || control.closest('nav')) return 'nav';
  if (control.matches('a[target="_blank"]')) return 'external';
  if (control.classList.contains('menu-button')) return 'menu';
  return 'tap';
}

export function playControlSound(control) {
  if (!control || control.matches('[disabled], .skip-link') || control.dataset.sound === 'silent') return;
  const audio = engine();
  if (!audio) return;
  if (audio.state === 'suspended') audio.resume().then(flushWelcome).catch(() => {});

  const identity = soundIdentity(control);
  const family = soundFamily(control, identity);
  const variation = 2 ** ((((hash(identity) % 9) - 4) * 0.32) / 12);
  const now = audio.currentTime + 0.004;

  if (family === 'theme') {
    const switchingToDark = control.matches('input') ? !control.checked : !control.querySelector('input')?.checked;
    const base = switchingToDark ? 196 : 392;
    voice(base, { at: now, duration: 0.14, volume: 0.017, type: 'triangle', glide: switchingToDark ? 0.78 : 1.28, cutoff: 1200 });
    voice(base * 1.5, { at: now + 0.045, duration: 0.19, volume: 0.01, glide: switchingToDark ? 0.86 : 1.12, cutoff: 1500 });
  } else if (family === 'next' || family === 'previous') {
    const direction = family === 'next' ? 1.18 : 0.84;
    voice(330 * variation, { at: now, duration: 0.13, volume: 0.016, type: 'triangle', glide: direction, cutoff: 1450 });
    voice(440 * variation, { at: now + 0.038, duration: 0.12, volume: 0.009, glide: direction, cutoff: 1800 });
  } else if (family === 'profile') {
    voice(293.66 * variation, { at: now, duration: 0.28, volume: 0.016, type: 'sine', glide: 1.015, cutoff: 1300 });
    voice(440 * variation, { at: now + 0.055, duration: 0.31, volume: 0.009, type: 'sine', cutoff: 1700 });
  } else if (family === 'orbit') {
    voice(370 * variation, { at: now, duration: 0.2, volume: 0.014, type: 'sine', glide: 1.06, cutoff: 1900 });
    voice(740 * variation, { at: now + 0.035, duration: 0.15, volume: 0.006, type: 'sine', glide: 0.97, cutoff: 2300 });
  } else if (family === 'cta') {
    voice(277.18 * variation, { at: now, duration: 0.14, volume: 0.016, type: 'triangle', glide: 1.04, cutoff: 1500 });
    voice(415.3 * variation, { at: now + 0.052, duration: 0.18, volume: 0.012, type: 'sine', glide: 1.02, cutoff: 1900 });
  } else if (family === 'external') {
    voice(523.25 * variation, { at: now, duration: 0.12, volume: 0.012, type: 'sine', glide: 1.08, cutoff: 2300 });
    voice(783.99 * variation, { at: now + 0.04, duration: 0.16, volume: 0.007, type: 'sine', glide: 1.03, cutoff: 2600 });
  } else if (family === 'close') {
    voice(246.94 * variation, { at: now, duration: 0.1, volume: 0.014, type: 'triangle', glide: 0.72, cutoff: 1100 });
  } else if (family === 'menu') {
    voice(311.13 * variation, { at: now, duration: 0.11, volume: 0.015, type: 'triangle', glide: 1.16, cutoff: 1350 });
  } else if (family === 'nav') {
    voice(349.23 * variation, { at: now, duration: 0.105, volume: 0.013, type: 'sine', glide: 1.055, cutoff: 1750 });
  } else {
    voice(320 * variation, { at: now, duration: 0.1, volume: 0.013, type: 'sine', glide: 1.025, cutoff: 1600 });
  }
}

