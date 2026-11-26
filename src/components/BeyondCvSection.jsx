import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createBeyondBookSound } from './beyondBookSound.js';
import { beyondBooks } from './beyondCvData.js';
import { CircularGallery } from './ui/circular-gallery.tsx';
import './beyond-cv.css';
import './beyond-circular-gallery.css';

const loadBookViewer = () => import('./BeyondBookViewer.jsx');
const BeyondBookViewer = lazy(loadBookViewer);
const count = beyondBooks.length;
const subtitles = ['Lakes, forests & open skies.', 'A little space. A little soul.', 'Worlds apart. Stories that stay.', 'One more adventure.', 'A little more of my world.'];

export default memo(function BeyondCvSection() {
  const gallery = useRef(null), section = useRef(null), stage = useRef(null), origin = useRef(null), sound = useRef(null);
  const [active, setActive] = useState(0), [opened, setOpened] = useState(null), [paused, setPaused] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const items = useMemo(() => beyondBooks.map((book, index) => ({
    common: book.title, binomial: subtitles[index],
    photo: { url: `/beyond-cv/jackets/${book.id}-${theme}.jpg`, video: book.id === 'trails' ? '/beyond-cv/trails/trail-film.mp4' : undefined, text: `${book.title} — Basit’s personal collection`, by: 'CURATED BY BASIT BASHIR' },
  })), [theme]);
  useEffect(() => {
    const effects = createBeyondBookSound(); sound.current = effects;
    return () => { sound.current = null; effects.dispose(); };
  }, []);
  useEffect(() => {
    const node = document.documentElement;
    const observer = new MutationObserver(() => setTheme(node.dataset.theme === 'light' ? 'light' : 'dark'));
    observer.observe(node, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let idle = 0, timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return; observer.disconnect();
      const prepare = () => loadBookViewer().catch(() => {});
      if (window.requestIdleCallback) idle = requestIdleCallback(prepare, { timeout: 1500 });
      else timer = setTimeout(prepare, 100);
    }, { rootMargin: '1400px' }); observer.observe(stage.current);
    return () => { observer.disconnect(); if (window.cancelIdleCallback) cancelIdleCallback(idle); clearTimeout(timer); };
  }, []);
  const select = index => { sound.current?.unlock(); sound.current?.play('select'); gallery.current?.select(index); };
  const step = amount => { sound.current?.unlock(); sound.current?.play('select'); gallery.current?.step(amount); };
  const open = (index, node) => {
    if (opened) return;
    gallery.current?.hold(); sound.current?.unlock(); sound.current?.play('open', 0, beyondBooks[index].id);
    const rect = node.getBoundingClientRect();
    origin.current = { index, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height } };
    setActive(index); setOpened({ index });
  };
  const chooseBook = index => {
    const next = ((index % count) + count) % count;
    gallery.current?.select(next, true); setOpened({ index: next });
  };
  const closeBook = () => { const index = opened.index; setOpened(null); requestAnimationFrame(() => gallery.current?.focusBook(index)); };
  const getOrigin = () => origin.current?.index === opened?.index ? origin.current.rect : gallery.current?.getOrigin(opened?.index) || origin.current?.rect;

  return <section ref={section} className="beyond-cv-section bcv-circular-section" id="beyond-cv" aria-labelledby="beyond-cv-title">
    <div className="bcv-circular-sticky" ref={stage}>
      <header className="bcv-circular-heading">
        <span>THE PERSONAL COLLECTION</span>
        <h2 id="beyond-cv-title">Beyond the <em>CV</em></h2>
        <p>A glimpse into what drives me — beyond work, beyond code.</p>
      </header>
      <CircularGallery ref={gallery} items={items} radius={300} autoRotateSpeed={.18} scrollRoot={section}
        paused={paused || opened !== null} onActiveChange={setActive} onActivate={open}
        onHover={index => sound.current?.play('hover', (index / (count - 1) - .5) * .8)}/>
      <footer className="bcv-circular-controls">
        <div className="bcv-circular-index"><span>{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span><strong>{beyondBooks[active].title}</strong></div>
        <nav aria-label="Personal collection controls">
          <button type="button" data-sound="silent" aria-label="Previous personal book" onClick={() => step(-1)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m13 6-6 6 6 6M7 12h12"/></svg></button>
          <div className="bcv-circular-dots">{beyondBooks.map((book, index) => <button type="button" data-sound="silent" key={book.id} aria-label={`Select ${book.title}`} aria-current={index === active ? 'true' : undefined} onClick={() => select(index)}><i/></button>)}</div>
          <button type="button" data-sound="silent" aria-label="Next personal book" onClick={() => step(1)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 6 6 6-6 6M17 12H5"/></svg></button>
          <button type="button" data-sound="silent" aria-label={paused ? 'Resume gallery motion' : 'Pause gallery motion'} onClick={() => setPaused(value => !value)}><svg viewBox="0 0 24 24" aria-hidden="true" className="bcv-play-glyph">{paused?<path d="m9 5 10 7-10 7Z"/>:<path d="M7 5h3v14H7Zm7 0h3v14h-3Z"/>}</svg></button>
        </nav>
        <p>SCROLL TO ROTATE <span>↓</span><small>Drag to explore · select to open</small></p>
      </footer>
    </div>
    <Suspense fallback={null}>{opened && <BeyondBookViewer index={opened.index} getOrigin={getOrigin} onChoose={chooseBook} onClosed={closeBook} onSound={kind => sound.current?.play(kind, 0, beyondBooks[opened.index].id)}/>}</Suspense>
  </section>;
});
