import { useEffect, useRef } from 'react';

const MAX_PARTICLES = 3600;
const TWO_PI = Math.PI * 2;
const easeOutCubic = (value) => 1 - (1 - value) ** 3;

export default function CanvasText({ text, className = '', fontSize = 31, fontWeight = 500, density = 1.35, particleSize = 1.3, loadDuration = 0.24, morphDuration = 1.08, scatter = 26, magnetic = 0.28 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const context = canvas.getContext('2d', { alpha: true });
    const offscreen = document.createElement('canvas');
    const offscreenContext = offscreen.getContext('2d', { willReadFrequently: true });
    if (!context || !offscreenContext) return undefined;

    let frame = 0;
    let resizeTimer = 0;
    let particles = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let color = '#f2f2f4';
    let startTime = performance.now();
    let introComplete = false;
    let pointerActive = false;
    let pointerX = 0;
    let pointerY = 0;
    let running = false;
    let originsCaptured = false;

    const paint = () => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      context.beginPath();
      particles.forEach((particle) => {
        context.moveTo(particle.x + particleSize / 2, particle.y);
        context.arc(particle.x, particle.y, particleSize / 2, 0, TWO_PI);
      });
      context.fill();
    };

    const step = (now) => {
      const elapsed = now - startTime;
      const loadMs = loadDuration * 1000;
      const morphMs = morphDuration * 1000;
      if (elapsed < loadMs) {
        const progress = elapsed / loadMs;
        particles.forEach((particle) => {
          const inward = particle.direction * progress * scatter * .75;
          const flutter = Math.sin(elapsed * .018 + particle.seed) * (2.4 + (particle.seed % 7) * .22);
          particle.x = particle.startX + inward + flutter * .32;
          particle.y = particle.startY + flutter + Math.sin(elapsed * .01 + particle.seed * .4) * 2;
        });
      } else if (elapsed < loadMs + morphMs) {
        if (!originsCaptured) {
          particles.forEach((particle) => { particle.originX = particle.x; particle.originY = particle.y; });
          originsCaptured = true;
        }
        const raw = Math.min(1, (elapsed - loadMs) / morphMs);
        particles.forEach((particle) => {
          const delay = (particle.seed % 100) / 900;
          const progress = easeOutCubic(Math.max(0, Math.min(1, (raw - delay) / (1 - delay))));
          particle.x = particle.originX + (particle.homeX - particle.originX) * progress;
          particle.y = particle.originY + (particle.homeY - particle.originY) * progress;
        });
      } else {
        introComplete = true;
        particles.forEach((particle) => {
          let targetX = particle.homeX;
          let targetY = particle.homeY;
          if (pointerActive) {
            const dx = particle.homeX - pointerX;
            const dy = particle.homeY - pointerY;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < 72) {
              const force = magnetic * (1 - distance / 72) ** 2 * 19;
              targetX += (dx / distance) * force;
              targetY += (dy / distance) * force;
            }
          }
          particle.x += (targetX - particle.x) * 0.22;
          particle.y += (targetY - particle.y) * 0.22;
        });
      }
      paint();
      if (!introComplete || pointerActive) frame = requestAnimationFrame(step);
      else running = false;
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };

    const rebuild = () => {
      cancelAnimationFrame(frame);
      running = false;
      width = Math.max(1, wrap.clientWidth);
      height = Math.max(1, wrap.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      color = getComputedStyle(wrap).color;
      offscreenContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      offscreenContext.clearRect(0, 0, width, height);
      offscreenContext.fillStyle = '#fff';
      let fittedFontSize = fontSize;
      const setRasterFont = () => {
        offscreenContext.font = `${fontWeight} ${fittedFontSize}px Cinzel, Georgia, "Times New Roman", serif`;
      };
      setRasterFont();
      offscreenContext.textAlign = 'left';
      offscreenContext.textBaseline = 'middle';
      const initialWidth = offscreenContext.measureText(text).width;
      if (initialWidth > width - 4) {
        fittedFontSize = Math.max(18, fontSize * ((width - 4) / initialWidth));
        setRasterFont();
      }
      const startX = 2;
      offscreenContext.fillText(text, startX, height / 2);
      const splitX = startX + offscreenContext.measureText('Basit ').width;
      const pixels = offscreenContext.getImageData(0, 0, offscreen.width, offscreen.height);
      const stride = Math.max(2, Math.round(density * dpr));
      const sampled = [];
      for (let y = 0; y < pixels.height; y += stride) {
        for (let x = 0; x < pixels.width; x += stride) {
          if (pixels.data[(y * pixels.width + x) * 4 + 3] < 86) continue;
          sampled.push({ x: x / dpr, y: y / dpr });
          if (sampled.length >= MAX_PARTICLES) break;
        }
        if (sampled.length >= MAX_PARTICLES) break;
      }
      particles = sampled.map((home, index) => {
        const seed = (index * 47.37) % 997;
        const fromLeft = home.x < splitX;
        const direction = fromLeft ? 1 : -1;
        const startX = fromLeft ? -scatter - (seed % 38) : width + scatter + (seed % 38);
        const startY = height * .5 + ((seed % 101) / 100 - .5) * height * .9;
        return { homeX: home.x, homeY: home.y, originX: startX, originY: startY, x: startX, y: startY, startX, startY, direction, seed };
      });
      startTime = performance.now();
      introComplete = false;
      originsCaptured = false;
      startLoop();
    };

    const move = (event) => {
      if (!introComplete) return;
      const rect = wrap.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      pointerActive = true;
      startLoop();
    };
    const leave = () => {
      pointerActive = false;
      particles.forEach((particle) => { particle.x = particle.homeX; particle.y = particle.homeY; });
      paint();
    };
    const resize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 80);
    };
    const themeObserver = new MutationObserver(() => {
      color = getComputedStyle(wrap).color;
      paint();
    });
    wrap.addEventListener('pointermove', move, { passive: true });
    wrap.addEventListener('pointerleave', leave);
    window.addEventListener('resize', resize);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    rebuild();
    document.fonts?.load(`${fontWeight} ${fontSize}px Cinzel`).then(rebuild).catch(() => {});
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      themeObserver.disconnect();
      wrap.removeEventListener('pointermove', move);
      wrap.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize);
    };
  }, [text, fontSize, fontWeight, density, particleSize, loadDuration, morphDuration, scatter, magnetic]);

  return <span className={`canvas-text ${className}`} ref={wrapRef} role="img" aria-label={text}><span className="sr-only">{text}</span><canvas ref={canvasRef} aria-hidden="true" /></span>;
}
