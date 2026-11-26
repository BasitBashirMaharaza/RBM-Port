import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, PointerEvent as ReactPointerEvent, RefObject } from 'react';
import './circular-gallery.css';

export interface GalleryItem {
  common: string;
  binomial: string;
  photo: { url: string; text: string; pos?: string; by: string; video?: string };
}
export interface CircularGalleryHandle {
  select: (index: number, immediate?: boolean) => void;
  step: (amount: number) => void;
  hold: () => void;
  getOrigin: (index: number) => DOMRect | undefined;
  focusBook: (index: number) => void;
}
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
  paused?: boolean;
  scrollRoot?: RefObject<HTMLElement | null>;
  onActiveChange?: (index: number) => void;
  onActivate?: (index: number, node: HTMLButtonElement) => void;
  onHover?: (index: number) => void;
}
const wrap = (value: number, count: number) => ((value % count) + count) % count;

/** Reference geometry, with frame updates isolated from React reconciliation. */
export const CircularGallery = forwardRef<CircularGalleryHandle, CircularGalleryProps>(
  function CircularGallery({ items, className = '', radius = 600, autoRotateSpeed = .02,
    paused = false, scrollRoot, onActiveChange, onActivate, onHover, ...props }, api) {
    const root = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null);
    const cards = useRef<(HTMLButtonElement | null)[]>([]);
    const videos = useRef<(HTMLVideoElement | null)[]>([]);
    const callbacks = useRef({ onActiveChange, onActivate, onHover });
    callbacks.current = { onActiveChange, onActivate, onHover };
    const controls = useRef<{ select?: (index: number, immediate?: boolean) => void; wake?: () => void }>({});
    const state = useRef({ rotation: 0, target: 0, active: 0, paused, dragging: false, hold: false });
    const gesture = useRef<{ id: number; x: number; y: number; rotation: number; dragged: boolean } | null>(null);
    const suppress = useRef(false);

    useEffect(() => { state.current.paused = paused; state.current.hold = false; controls.current.wake?.(); }, [paused]);
    useEffect(() => {
      const node = root.current!, rotor = ring.current!, section = scrollRoot?.current || node;
      const s = state.current, count = items.length;
      if (!count) return;
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0, previous = 0, visible = false, focused = false;
      let scrollTop = 0, scrollDistance = 1, lastScroll = window.scrollY, scrollingUntil = 0;
      let idle = 0, resumeTimer = 0, disposed = false;
      const mediaRunning = new Map<HTMLVideoElement, boolean>();
      const syncMedia = () => {
        videos.current.forEach((video, index) => {
          if (!video) return;
          const angle = Math.abs(wrap(index * 360 / count + s.rotation + 180, 360) - 180);
          const play = visible && !document.hidden && !motion.matches && !s.paused && !s.hold && angle < 60;
          if (mediaRunning.get(video) === play) return;
          mediaRunning.set(video, play);
          if (play) {
            if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src;
            video.play().catch(() => {});
          } else video.pause();
        });
      };
      const measure = () => {
        const box = section.getBoundingClientRect();
        scrollTop = box.top + window.scrollY;
        scrollDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      };
      const paint = () => {
        rotor.style.transform = `rotateY(${s.rotation}deg)`;
        syncMedia();
        const next = wrap(Math.round(-s.rotation / (360 / count)), count);
        if (next !== s.active || node.dataset.active === undefined) {
          s.active = next; node.dataset.active = String(next);
          cards.current.forEach((card, i) => { if (card) card.tabIndex = i === next ? 0 : -1; });
          callbacks.current.onActiveChange?.(next);
        }
      };
      const tick = (now: number) => {
        frame = 0;
        if (!visible || document.hidden) { previous = 0; return; }
        const dt = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
        previous = now;
        const idleMotion = !motion.matches && !s.paused && !s.hold && !s.dragging && !focused && now > scrollingUntil;
        if (idleMotion) s.target += autoRotateSpeed * 60 * dt;
        s.rotation = motion.matches || s.dragging ? s.target : s.rotation + (s.target - s.rotation) * (1 - Math.exp(-dt * 18));
        if (Math.abs(s.target - s.rotation) < .0005) s.rotation = s.target;
        paint();
        if (idleMotion || Math.abs(s.target - s.rotation) > .0005) frame = requestAnimationFrame(tick);
        else {
          previous = 0;
          if (!s.paused && !s.hold && !focused && !motion.matches && now <= scrollingUntil) {
            clearTimeout(resumeTimer); resumeTimer = window.setTimeout(wake, Math.max(1, scrollingUntil - now + 1));
          }
        }
      };
      const wake = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick); };
      const select = (index: number, immediate = false) => {
        const wanted = -wrap(index, count) * 360 / count;
        s.target = s.rotation + wrap(wanted - s.rotation + 180, 360) - 180;
        scrollingUntil = performance.now() + 1500;
        if (immediate || motion.matches) { s.rotation = s.target; paint(); }
        wake();
      };
      controls.current = { select, wake };
      const scroll = () => {
        const next = window.scrollY;
        const from = Math.max(0, Math.min(1, (lastScroll - scrollTop) / scrollDistance));
        const to = Math.max(0, Math.min(1, (next - scrollTop) / scrollDistance));
        lastScroll = next;
        if (s.paused || s.hold || s.dragging || motion.matches) return;
        s.target += (to - from) * 540;
        scrollingUntil = performance.now() + 150;
        wake();
      };
      const focus = () => { focused = node.querySelector(':focus-visible') !== null; wake(); };
      const blur = (event: FocusEvent) => { if (!node.contains(event.relatedTarget as Node)) { focused = false; wake(); } };
      const visibility = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; syncMedia(); wake(); };
      const resize = new ResizeObserver(measure); resize.observe(section);
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; previous = 0; syncMedia(); }
      }, { rootMargin: '150px' }); observer.observe(node);
      const prepare = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return; prepare.disconnect();
        videos.current.forEach(video => { if (video && !video.getAttribute('src') && video.dataset.src) { video.preload = 'auto'; video.src = video.dataset.src; } });
        const images = [...node.querySelectorAll('img')]; let next = 0;
        const batch = () => {
          if (disposed) return;
          const image = images[next++]; if (!image) return;
          image.loading = 'eager';
          Promise.resolve(image.decode?.()).catch(() => {}).then(() => {
            if (disposed) return;
            if (window.requestIdleCallback) idle = requestIdleCallback(batch, { timeout: 800 });
            else idle = window.setTimeout(batch, 16);
          });
        }; batch();
      }, { rootMargin: '1800px' }); prepare.observe(node);
      measure(); paint();
      window.addEventListener('scroll', scroll, { passive: true });
      window.addEventListener('resize', measure, { passive: true });
      document.addEventListener('visibilitychange', visibility); motion.addEventListener('change', wake);
      node.addEventListener('focusin', focus); node.addEventListener('focusout', blur);
      return () => {
        disposed = true; cancelAnimationFrame(frame); clearTimeout(resumeTimer);
        videos.current.forEach(video => video?.pause());
        if (window.cancelIdleCallback) cancelIdleCallback(idle); clearTimeout(idle);
        observer.disconnect(); prepare.disconnect(); resize.disconnect(); controls.current = {};
        window.removeEventListener('scroll', scroll); window.removeEventListener('resize', measure);
        document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', wake);
        node.removeEventListener('focusin', focus); node.removeEventListener('focusout', blur);
      };
    }, [items.length, autoRotateSpeed, scrollRoot]);

    useImperativeHandle(api, () => ({
      select: (index, immediate) => controls.current.select?.(index, immediate),
      step: amount => controls.current.select?.(state.current.active + amount),
      hold: () => { state.current.hold = true; state.current.target = state.current.rotation; },
      getOrigin: index => cards.current[index]?.getBoundingClientRect(),
      focusBook: index => { controls.current.select?.(index, true); cards.current[index]?.focus({ preventScroll: true }); },
    }));
    const end = (event: ReactPointerEvent<HTMLDivElement>) => {
      const held = gesture.current; if (!held || held.id !== event.pointerId) return;
      if (held.dragged) { suppress.current = true; controls.current.select?.(wrap(Math.round(-state.current.target / (360 / items.length)), items.length)); }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      gesture.current = null; state.current.dragging = false; controls.current.wake?.();
    };
    return <div ref={root} role="region" aria-label="Circular 3D personal gallery" className={`circular-gallery ${className}`} {...props}
      style={{ '--cg-radius': `${radius}px`, ...props.style } as CSSProperties}
      onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; suppress.current = false; gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, rotation: state.current.rotation, dragged: false }; }}
      onPointerMove={event => {
        const held = gesture.current; if (!held || held.id !== event.pointerId) return;
        const dx = event.clientX - held.x, dy = event.clientY - held.y;
        if (!held.dragged && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { gesture.current = null; return; }
        if (Math.abs(dx) < 8 && !held.dragged) return;
        held.dragged = true; state.current.dragging = true;
        event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
        state.current.target = held.rotation + dx * .22; controls.current.wake?.();
      }}
      onPointerUp={end} onPointerCancel={end}
      onClickCapture={event => { if (suppress.current) { suppress.current = false; event.preventDefault(); event.stopPropagation(); } }}
      onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); controls.current.select?.(state.current.active + (event.key === 'ArrowRight' ? 1 : -1), true); } }}>
      <div ref={ring} className="circular-gallery-ring">
        {items.map((item, index) => <button key={item.common} type="button" ref={node => { cards.current[index] = node; }}
          className="circular-gallery-card" data-sound="silent" aria-label={`Open ${item.common}`} tabIndex={index === 0 ? 0 : -1}
          style={{ transform: `rotateY(${index * 360 / Math.max(1, items.length)}deg) translateZ(var(--cg-radius))` }}
          onPointerEnter={event => { if (event.pointerType === 'mouse') callbacks.current.onHover?.(index); }}
          onClick={event => callbacks.current.onActivate?.(index, event.currentTarget)}>
          <span className="circular-gallery-back" aria-hidden="true"><span>BEYOND THE CV</span><strong>{item.common}</strong><small>BB / {String(index + 1).padStart(2, '0')}</small></span>
          <span className="circular-gallery-edge edge-left" aria-hidden="true"/><span className="circular-gallery-edge edge-right" aria-hidden="true"/><span className="circular-gallery-edge edge-top" aria-hidden="true"/><span className="circular-gallery-edge edge-bottom" aria-hidden="true"/>
          <span className="circular-gallery-front">
            <img src={item.photo.url} alt={item.photo.text} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: item.photo.pos || 'center' }}/>
            {item.photo.video && <video ref={node => { videos.current[index] = node; }} data-src={item.photo.video} poster={item.photo.url} muted loop playsInline preload="none" tabIndex={-1} aria-hidden="true"/>}
            <span className="circular-gallery-caption"><strong className="cg-title">{item.common}</strong><em>{item.binomial}</em><small>{item.photo.by}</small><span aria-hidden="true">↗</span></span>
          </span>
        </button>)}
      </div>
    </div>;
  });
