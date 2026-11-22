import { useLayoutEffect, useRef } from 'react';
import './record-loading.css';

export default function RecordFlight({ flight, targetRoot, onArrive }) {
  const disc = useRef(null), done = useRef(onArrive); done.current = onArrive;
  useLayoutEffect(() => {
    const node = disc.current;
    const target = targetRoot.current?.querySelector('.bcv-book-paper .bcv-turntable-platter');
    if (!target) { done.current(flight.token); return; }
    const from = flight.from, bounds = target.getBoundingClientRect(), style = getComputedStyle(target);
    const left = parseFloat(style.paddingLeft) || 0, right = parseFloat(style.paddingRight) || 0;
    const top = parseFloat(style.paddingTop) || 0, bottom = parseFloat(style.paddingBottom) || 0;
    // Measure the stationary platter; a spinning record's bounding box changes with rotation.
    const to = { left: bounds.left + left, top: bounds.top + top, width: bounds.width - left - right, height: bounds.height - top - bottom };
    const x0 = from.left + from.width / 2 - 48, y0 = from.top + from.height / 2 - 48;
    const x1 = to.left + to.width / 2 - 48, y1 = to.top + to.height / 2 - 48;
    const transform = (x,y,scale,angle) => `translate3d(${x}px,${y}px,0) scale(${scale}) rotate(${angle}deg)`;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = node.animate(reduced ? [
      { transform: transform(x1,y1,to.width/96,0), opacity: 0 },
      { transform: transform(x1,y1,to.width/96,0), opacity: 1 },
    ] : [
      { offset: 0, transform: transform(x0,y0,from.width/96,-20), opacity: 1 },
      { offset: .2, transform: transform(x0+18,y0-10,from.width/96,-45), opacity: 1 },
      { offset: .62, transform: transform((x0+x1)/2,(y0+y1)/2-32,(from.width+to.width)/192,80), opacity: 1 },
      { offset: 1, transform: transform(x1,y1,to.width/96,180), opacity: 1 },
    ], { duration: reduced ? 90 : 1050, easing: 'cubic-bezier(.45,0,.22,1)', fill: 'both' });
    animation.finished.then(() => done.current(flight.token)).catch(() => {});
    const resize = () => { animation.finish(); };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); animation.cancel(); };
  }, [flight, targetRoot]);
  return <div ref={disc} className="bcv-record-flight" aria-hidden="true" style={{ '--record-accent': flight.song.accent }}>
    <span><img src={flight.song.cover} alt="" /><i /></span>
  </div>;
}

