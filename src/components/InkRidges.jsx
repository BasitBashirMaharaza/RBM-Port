import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function random(seed) {
  const x = Math.sin(seed * 9283.17) * 43758.5453;
  return x - Math.floor(x);
}

function ridgePoints(width, height, layer, seed, shiftX) {
  const points = [];
  const count = Math.max(90, Math.floor(width / 9));
  const base = height * (0.56 + layer * 0.105);
  const amplitude = height * (0.055 + layer * 0.018);

  for (let index = 0; index <= count; index += 1) {
    const x = (index / count) * width;
    const phase = (x / width) * (5.2 + layer * 1.25) + seed;
    const primary = Math.sin(phase * Math.PI) * 0.55;
    const secondary = Math.sin(phase * 2.37 + layer) * 0.25;
    const texture = (random(index * 1.73 + layer * 41 + seed) - 0.5) * 0.24;
    points.push([x, base - (primary + secondary + texture) * amplitude + shiftX * (layer + 1)]);
  }
  return points;
}

export default function InkRidges() {
  const canvasRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !root || !context) return undefined;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let time = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      const light = document.documentElement.dataset.theme === 'light';
      const ink = light ? '20, 29, 21' : '220, 220, 226';
      const accent = light ? '71, 120, 39' : '164, 166, 174';
      const scroll = window.scrollY / Math.max(1, document.documentElement.scrollHeight - height);

      pointerX += (targetX - pointerX) * 0.045;
      pointerY += (targetY - pointerY) * 0.045;
      // The landscape is a core identity element, so it keeps a calm ambient
      // drift even when the browser requests reduced motion. Pointer and scroll
      // depth remain restrained; only the slow paint breathing continues.
      time += reduced ? 0.0032 : 0.009;
      context.clearRect(0, 0, width, height);

      const sunX = width * 0.79 + pointerX * 18;
      const sunY = height * (0.2 + scroll * 0.07) + pointerY * 12;
      const sunRadius = clamp(Math.min(width, height) * 0.055, 34, 72);
      const glow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2.8);
      glow.addColorStop(0, `rgba(${accent}, ${light ? 0.13 : 0.12})`);
      glow.addColorStop(1, `rgba(${accent}, 0)`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(sunX, sunY, sunRadius * 2.8, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = `rgba(${accent}, ${light ? 0.16 : 0.2})`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      context.stroke();

      for (let layer = 0; layer < 5; layer += 1) {
        const depth = layer / 4;
        const drift = Math.sin(time * (0.58 + depth * 0.34) + layer) * (8 + depth * 6);
        const points = ridgePoints(width, height, layer, 7.13, pointerY * (2 + depth * 4) + scroll * 28 * (1 - depth));
        const gradient = context.createLinearGradient(0, height * 0.38, 0, height);
        gradient.addColorStop(0, `rgba(${ink}, ${0.045 + depth * 0.04})`);
        gradient.addColorStop(1, `rgba(${ink}, ${0.014 + depth * 0.022})`);
        context.beginPath();
        context.moveTo(-10, height + 10);
        points.forEach(([x, y], index) => {
          if (index === 0) context.lineTo(x + drift, y);
          else context.lineTo(x + drift, y);
        });
        context.lineTo(width + 10, height + 10);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
        context.beginPath();
        points.forEach(([x, y], index) => {
          if (index === 0) context.moveTo(x + drift, y);
          else context.lineTo(x + drift, y);
        });
        context.strokeStyle = `rgba(${ink}, ${0.085 + depth * 0.062})`;
        context.lineWidth = 0.85 + depth * 0.55;
        context.stroke();
      }

      for (let mist = 0; mist < 3; mist += 1) {
        const y = height * (0.58 + mist * 0.1) + Math.sin(time * 1.4 + mist) * 12;
        const mistGradient = context.createLinearGradient(0, y - 30, 0, y + 34);
        mistGradient.addColorStop(0, 'rgba(255,255,255,0)');
        mistGradient.addColorStop(0.5, `rgba(${light ? '255,255,250' : '196,196,204'}, ${light ? 0.13 : 0.052})`);
        mistGradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = mistGradient;
        context.fillRect(0, y - 30, width, 64);
      }

      frame = requestAnimationFrame(draw);
    };

    const pointerMove = (event) => {
      targetX = (event.clientX / width - 0.5) * 2;
      targetY = (event.clientY / height - 0.5) * 2;
    };

    const scrollHandler = () => {};
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', pointerMove, { passive: true });
    window.addEventListener('scroll', scrollHandler, { passive: true });
    resize();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('scroll', scrollHandler);
    };
  }, []);

  return <div className="ink-ridges" ref={rootRef} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
