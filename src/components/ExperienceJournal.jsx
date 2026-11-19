import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import './experience-journal.css';
import contributions from './journal-contributions.json';
import { createJournalSound } from './journalSound.js';
import JournalContributionOverlay from './JournalContributionOverlay.jsx';

function PerspectiveScene() {
  return (
    <div className="journal-weather-study" role="img" aria-label="Hand-drawn architectural study with drifting clouds and a slowly turning sun, based on the supplied reference">
      <p className="weather-study-caption">A little sunshine. A wider perspective.</p>
      <svg className="weather-study-sky" viewBox="0 0 526 300" fill="none" aria-hidden="true">
        <g className="weather-sun" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="380" cy="137" r="35" />
          <g className="weather-sun-rays">
            <path d="M380 90v-13m33 27 9-10m7 41 13-3m-18 36 15 6m-59 14v15m-46-70-11-4m24-21-9-13" />
          </g>
        </g>
        <path className="weather-cloud weather-cloud-near" d="M278 177c-13-13-1-38 16-40 14-3 25 3 31 16 8-13 20-10 24 0 7-16 20-17 25-2 9-16 29-15 37 1 10 20-1 32-18 32h-91c-10 3-19 1-24-7Z" />
        <path className="weather-cloud weather-cloud-far" d="M35 220c-3-17 15-33 29-22l8 9c6-10 16-9 22-1 11-16 29-11 30 6 3 13-4 17-13 17H48c-7 3-11-2-13-9Z" />
        <path className="weather-cloud weather-cloud-middle" d="M172 87c-8-13 1-29 14-29 9 0 15 4 18 11 7-8 16-6 20 1 8-11 21-7 23 5 3 10-3 16-14 16h-43c-8 2-14 1-18-4Z" />
        <path className="weather-cloud weather-cloud-low" d="M345 251c-7-11 2-24 12-24 8 0 14 4 17 10 6-7 14-6 18 0 8-9 20-5 21 5 2 9-4 13-12 13h-41c-7 1-12 0-15-4Z" />
        <path className="weather-cloud weather-cloud-wisp" d="M66 125c-5-8 1-19 10-18 6 0 10 3 12 7 5-5 11-4 14 1 6-8 15-5 17 3 1 7-3 11-10 11H79c-6 1-10 0-13-4Z" />
      </svg>
      <div className="weather-study-building" aria-hidden="true">
        <svg viewBox="0 300 526 288" fill="none">
          <image href="/journal/architectural-reference.png" width="526" height="619" />
        </svg>
        <svg className="weather-building-light" viewBox="0 0 526 288" fill="none">
          <path className="building-ink-trace" d="M27 242h471M150 230l44-25h131l48 25M235 135v-53q27-37 53 0v53M45 231v-91h74m291 91v-91h72" />
          <g className="building-window-light"><path d="M248 162v16m14-16v16m14-16v16M139 182v11m13-11v11m221-11v11m13-11v11" /></g>
        </svg>
      </div>
      <span className="weather-study-footnote">A pause between the pages.</span>
    </div>
  );
}

function JournalSignature() {
  const [replay, setReplay] = useState(0);
  return (
    <button data-sound="silent" type="button" className="journal-signature" aria-label="Replay Basit signature" onClick={() => setReplay((value) => value + 1)}>
      <svg key={replay} viewBox="0 0 150 62" fill="none" aria-hidden="true">
        <path pathLength="1" d="M12 51 C18 35 25 17 31 8 C35 2 47 3 49 10 C52 18 41 23 29 27 C41 22 56 24 54 34 C52 43 37 49 17 49 C32 50 47 46 57 40" />
        <path pathLength="1" d="M57 40 C61 35 66 32 69 35 C72 38 68 45 62 46 C57 46 58 40 62 36 M69 36 C66 43 68 47 75 42 C79 38 83 34 87 35 C91 37 85 41 79 43 C76 46 83 47 90 41" />
        <path pathLength="1" d="M90 41 C93 37 96 33 98 32 C96 37 93 43 97 44 C101 44 104 40 107 37 C111 32 115 20 118 14 C120 10 121 15 118 22 C115 31 109 40 111 43 C114 47 121 41 129 35 C133 32 137 33 140 35" />
        <path pathLength="1" d="M107 29 C115 27 122 26 128 27" />
        <path pathLength="1" d="M100 26 L100.5 25" />
        <path pathLength="1" d="M29 55 C63 56 100 53 137 52" />
      </svg>
      <span>A personal field note.</span>
    </button>
  );
}

function ContributionNote({ onOpen }) {
  const Tag = onOpen ? 'button' : 'div';
  return (
    <Tag className={'journal-contribution-note' + (onOpen ? ' journal-contribution-trigger' : '')}
      type={onOpen ? 'button' : undefined} onClick={onOpen} aria-haspopup={onOpen ? 'dialog' : undefined}
      role={onOpen ? undefined : 'img'}
      aria-label={onOpen ? 'View GitHub contributions' : contributions.total + ' public GitHub contributions from ' + contributions.days[0].date + ' to ' + contributions.updated}>
      <span className="journal-tape" aria-hidden="true" />
      <div className="journal-contribution-heading"><strong>Building in public</strong><span>GitHub ↗</span></div>
      <div className="journal-contribution-grid" aria-hidden="true">
        {contributions.days.map((day) => <i key={day.date} data-level={day.level} title={day.date + ': ' + day.count + ' contributions'} />)}
      </div>
      <div className="journal-contribution-footer"><span>{contributions.total} contributions</span><small>Updated {contributions.updated}</small></div>
    </Tag>
  );
}

function JournalLogo({ item, index }) {
  return (
    <span className={'journal-logo-scene journal-logo-' + index}>
      <span className="journal-logo-ambient" aria-hidden="true"><i /><i /><i /></span>
      <img src={index === 0 ? '/logos/dar-pharma.png' : item.logo} alt={item.company + ' logo'} draggable="false" />
      <span className="journal-logo-trace" aria-hidden="true" />
      <span className="journal-logo-veil veil-top" aria-hidden="true" />
      <span className="journal-logo-veil veil-bottom" aria-hidden="true" />
    </span>
  );
}

function BackCoverScene() {
  return (
    <div className="journal-care-cover">
      <div className="care-cover-texture" aria-hidden="true" />
      <div className="care-cover-art" aria-hidden="true">
        <div className="care-silk silk-one" />
        <div className="care-silk silk-two" />
        <div className="care-silk silk-three" />
        <div className="care-cover-light" />
      </div>
      <span className="care-cover-owner">BASIT BASHIR</span>
      <div className="care-cover-copy">
        <span>Healthcare · Data · AI</span>
        <h3>Care,<br /><em>carried forward.</em></h3>
      </div>
      <div className="care-cover-reflection"><ReflectionNote /></div>
      <div className="care-cover-signoff"><span>Learning through doing.</span><small>KASHMIR · INDIA</small></div>
    </div>
  );
}

function ReflectionNote() {
  return (
    <div className="journal-reflection-note">
      <span className="journal-reflection-portrait">
        <img src="/portfolio_photo.webp" alt="Basit Bashir" draggable="false" />
        <span aria-hidden="true" />
      </span>
      <div>
        <span className="journal-eyebrow">What I carry forward</span>
        <p><span className="reflection-line">Care taught me to listen.</span><span className="reflection-line">Data taught me to question.</span><span className="reflection-line"><em>Experience taught me to connect them.</em></span></p>
      </div>
    </div>
  );
}

function Cover({ items, back = false, onOpen, onContributions }) {
  if (back) {
    return (
      <div className="journal-cover-art journal-back-art">
        <BackCoverScene />
      </div>
    );
  }
  return (
    <div className={'journal-cover-art' + (onOpen ? ' journal-cover-interactive' : '')}
      onClick={onOpen ? (event) => { if (!event.target.closest('button')) onOpen(); } : undefined}>
      {onOpen && <button data-sound="silent" type="button" className="journal-cover-hitarea" aria-label="Open the experience journal" onClick={onOpen} />}
      <span className="journal-cover-name">BASIT BASHIR</span>
      <span className="journal-note journal-note-main">From operations<br />to <em>intelligence.</em></span>
      <span className="journal-note journal-note-small">Experience<br />& field notes</span>
      <span className="journal-cover-stamp">AI · DATA<br />HEALTHCARE</span>
      <span className="journal-note journal-note-list">{items.map((item) => <span key={item.role}>{item.label}</span>)}</span>
      <ContributionNote onOpen={onContributions} />
    </div>
  );
}

const chapterNotes = [
  'Community pharmacy and medical supply operations, grounded in real care workflows.',
  'Production-focused data science, guided by technical mentors at NIELIT.',
  'Search visibility, campaign performance, and organic engagement at Google.',
];

const chapterWorkflows = [
  null,
  { title: 'From raw data to evaluated models', steps: ['Explore & cleanse', 'Engineer features', 'Model & evaluate'], note: 'Python pipelines. Model benchmarking. Mentor-guided problem solving.' },
  { title: 'Visibility, measured', steps: ['Search visibility', 'Organic reach', 'Campaign signals'], note: 'SEO and multi-channel web analytics, connected through performance measurement.' },
];

function Page({ item, index, side }) {
  if (!item) {
    return (
      <div className={'journal-page-content journal-finale journal-' + side} data-chapter="closing">
        {side === 'left' ? <>
          <span className="journal-eyebrow">The story continues</span>
          <div className="journal-final-note">
            <span className="journal-tape" aria-hidden="true" />
            <h3>Care.<br /><em>Curiosity.</em><br />Possibility.</h3>
            <p>Healthcare · Data · AI</p>
          </div>
          <JournalSignature />
        </> : <>
          <span className="journal-eyebrow">A moment of perspective</span>
          <PerspectiveScene />
          <div className="journal-mobile-signature"><JournalSignature /></div>
          <span className="journal-handwriting">Kashmir, India</span>
        </>}
      </div>
    );
  }
  if (side === 'left') {
    return (
      <div className="journal-page-content journal-left" data-chapter={index}>
        <span className="journal-eyebrow">{item.label}</span>
        <div className="journal-id">
          <span className="journal-tape" aria-hidden="true" />
          <div className="journal-logo-mount"><JournalLogo key={item.company} item={item} index={index} /></div>
          <p>{item.company}</p>
          <span>{item.location}</span>
        </div>
        <h3>{item.role}</h3>
        <div className="journal-date-stamp"><span>FIELD NOTES</span><strong>{item.period}</strong></div>
        {chapterWorkflows[index] && <div className="journal-workflow-card">
          <span className="journal-eyebrow">In practice</span>
          <h4>{chapterWorkflows[index].title}</h4>
          <ol>{chapterWorkflows[index].steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </div>}
        <span className="journal-handwriting">Experience, put into practice.</span>
      </div>
    );
  }
  return (
    <div className="journal-page-content journal-right" data-chapter={index}>
      <div className="journal-mobile-heading">
        <JournalLogo key={item.company} item={item} index={index} />
        <h3>{item.role}</h3><p>{item.company}</p>
        <span>{item.period} · {item.location}</span>
      </div>
      <div className="journal-details">
        <div className="journal-summary-note">
          <span className="journal-tape" aria-hidden="true" />
          <p className="journal-summary">{chapterNotes[index] || item.summary}</p>
        </div>
        <ul>{item.points.map((point, pointIndex) => (
          <li key={point} className={'journal-impact-note note-tone-' + pointIndex}>{point}</li>
        ))}</ul>
        {chapterWorkflows[index] && <aside className="journal-method-note">
          <span className="journal-tape" aria-hidden="true" />
          <span className="journal-eyebrow">Field observation</span>
          <p>{chapterWorkflows[index].note}</p>
        </aside>}
        <div className="journal-skills-slip">
          <span className="journal-eyebrow">Working knowledge</span>
          <div className="journal-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </div>
      <span className="journal-folio">{String(index + 1).padStart(2, '0')}</span>
    </div>
  );
}

function Arrow({ back = false }) {
  return (
    <svg viewBox="0 0 80 46" fill="none" aria-hidden="true" style={back ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M8 32C24 17 47 13 69 20M55 8l16 12-14 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ExperienceJournal({ items }) {
  const [page, setPage] = useState(-1);
  const [contributionsOpen, setContributionsOpen] = useState(false);
  const contributionTrigger = useRef(null);
  const [turn, setTurn] = useState(null);
  const [hintReady, setHintReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hintMinimumElapsed, setHintMinimumElapsed] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);
  const [hintCycle, setHintCycle] = useState(0);
  const [hintInteraction, setHintInteraction] = useState(0);
  const markInteraction = () => {
    setHasInteracted(true);
    setHintInteraction((count) => count + 1);
  };
  const journalSound = useRef(null);
  const playPaperSound = (from, to) => {
    if (!journalSound.current) journalSound.current = createJournalSound();
    const closing = to === -1 || to === items.length + 1;
    const opening = from === -1 || from === items.length + 1;
    journalSound.current.play(closing ? 'close' : opening ? 'open' : 'turn');
  };
  const regionRef = useRef(null);
  const reduced = useReducedMotion();
  const bookRef = useRef(null);
  const leafRef = useRef(null);
  const transitionRef = useRef(null);
  const animationsRef = useRef([]);
  const gestureRef = useRef(null);
  const suppressClick = useRef(false);
  const releaseRef = useRef(null);
  const lastPage = items.length;
  const backCoverPage = lastPage + 1;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHintReady(true);
        observer.disconnect();
      }
    }, { threshold: .25 });
    if (regionRef.current) observer.observe(regionRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hintReady) return undefined;
    setHintHidden(false);
    setHasInteracted(false);
    setHintMinimumElapsed(false);
    const timer = window.setTimeout(() => setHintMinimumElapsed(true), 3800);
    return () => window.clearTimeout(timer);
  }, [hintReady, hintCycle]);

  useEffect(() => {
    if (!hasInteracted || !hintMinimumElapsed) return undefined;
    setHintHidden(true);
    const timer = window.setTimeout(() => setHintCycle((cycle) => cycle + 1), 10000);
    return () => window.clearTimeout(timer);
  }, [hasInteracted, hintMinimumElapsed, hintInteraction]);

  const finish = (complete) => {
    const current = transitionRef.current;
    if (!current) return;
    transitionRef.current = null;
    setPage(complete ? current.to : current.from);
    setTurn(null);
  };

  const select = (next, manual = false) => {
    if (transitionRef.current || next === page || next < -1 || next > backCoverPage) return false;
    playPaperSound(page, next);
    if (reduced) {
      if (!manual) setPage(next);
      return false;
    }
    const current = { from: page, to: next, forward: next > page, manual };
    transitionRef.current = current;
    setTurn(current);
    return true;
  };

  const scrub = (progress) => {
    const bounded = Math.max(0, Math.min(1, progress));
    if (gestureRef.current) gestureRef.current.progress = bounded;
    animationsRef.current.forEach((animation) => { animation.currentTime = bounded * 1000; });
  };

  const settle = (complete) => {
    if (!transitionRef.current) return;
    if (!animationsRef.current.length) {
      releaseRef.current = complete;
      return;
    }
    const animations = animationsRef.current;
    animations.forEach((animation) => {
      animation.playbackRate = complete ? 1.15 : -1.5;
      animation.play();
    });
    animations[0].finished.then(() => finish(complete)).catch(() => {});
  };

  useLayoutEffect(() => {
    if (!turn || !leafRef.current || !bookRef.current) return undefined;
    const endClose = turn.to === backCoverPage;
    const endOpen = turn.from === backCoverPage;
    const fromAngle = endOpen ? -180 : turn.forward ? 0 : -180;
    const toAngle = turn.forward ? -180 : 0;
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const closedOffset = mobile ? '0%' : '-25%';
    const fromOffset = endOpen ? (mobile ? '0%' : '25%') : turn.from === -1 ? closedOffset : '0%';
    const toOffset = endClose ? (mobile ? '0%' : '25%') : turn.to === -1 ? closedOffset : '0%';
    const options = { duration: 1000, easing: turn.manual ? 'linear' : 'cubic-bezier(.77,0,.175,1)', fill: 'both' };
    const leafAnimation = leafRef.current.animate([
      { transform: 'rotateY(' + fromAngle + 'deg)' },
      { transform: 'rotateY(' + toAngle + 'deg)' },
    ], options);
    const bookAnimation = bookRef.current.animate([
      { transform: 'translateX(' + fromOffset + ')' },
      { transform: 'translateX(' + toOffset + ')' },
    ], options);
    const shadeAnimations = [...leafRef.current.querySelectorAll('.journal-leaf-light')].map((node) =>
      node.animate([{ opacity: 0 }, { opacity: .55, offset: .5 }, { opacity: 0 }], options));
    animationsRef.current = [leafAnimation, bookAnimation, ...shadeAnimations];
    if (turn.manual) {
      animationsRef.current.forEach((animation) => animation.pause());
      scrub(gestureRef.current?.progress || 0);
      if (releaseRef.current !== null) {
        const complete = releaseRef.current;
        releaseRef.current = null;
        settle(complete);
      }
    } else {
      leafAnimation.finished.then(() => finish(true)).catch(() => {});
    }
    return () => {
      animationsRef.current.forEach((animation) => animation.cancel());
      animationsRef.current = [];
    };
  }, [turn]);

  useEffect(() => () => {
    transitionRef.current = null;
    journalSound.current?.dispose();
    journalSound.current = null;
    animationsRef.current.forEach((animation) => animation.cancel());
  }, []);

  const startDrag = (event) => {
    if (transitionRef.current || !event.isPrimary || event.button !== 0 || reduced) return;
    if (event.target.closest('.journal-open-hint, .journal-contribution-trigger')) return;
    suppressClick.current = false;
    gestureRef.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      width: bookRef.current.getBoundingClientRect().width, progress: 0, started: false,
    };
  };

  const moveDrag = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.started) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { gestureRef.current = null; return; }
      if (Math.abs(dx) < 8) return;
      const next = page + (dx < 0 ? 1 : -1);
      if (!select(next, true)) { gestureRef.current = null; return; }
      gesture.started = true;
      gesture.direction = dx < 0 ? -1 : 1;
      event.currentTarget.setPointerCapture(event.pointerId);
      suppressClick.current = true;
    }
    event.preventDefault();
    scrub((dx * gesture.direction) / Math.max(100, gesture.width * .55));
  };

  const endDrag = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    if (gesture.started) {
      settle(event.type !== 'pointercancel' && gesture.progress > .25);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gestureRef.current = null;
  };

  const endClosing = turn?.to === backCoverPage;
  const endOpening = turn?.from === backCoverPage;
  const backClosed = page === backCoverPage && !turn;
  const closed = page === -1 && !turn;
  const leftIndex = turn ? (turn.forward ? turn.from : turn.to) : page;
  // Keep the final scene mounted as the right board folds over the left page.
  const rightIndex = endClosing || endOpening ? lastPage : turn ? (turn.forward ? turn.to : turn.from) : page;
  const cover = <Cover items={items} />;
  const backCover = <Cover items={items} back />;
  const renderPage = (index, side) => <Page item={items[index]} index={index} side={side} />;
  const leafFront = endClosing || endOpening ? renderPage(lastPage, 'right') :
    turn?.from === -1 || turn?.to === -1 ? cover : turn && renderPage(turn.forward ? turn.from : turn.to, 'right');
  const leafBack = endClosing || endOpening ? backCover : turn && renderPage(turn.forward ? turn.to : turn.from, 'left');

  return (
    <div ref={regionRef} className="experience-journal" data-sound="silent" role="region" aria-label="Experience journal" onPointerDownCapture={markInteraction} onClickCapture={markInteraction}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); markInteraction(); select(page + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); markInteraction(); select(page - 1); }
      }}>
      <div className="journal-stage">
        <button data-sound="silent" className="journal-side-arrow journal-prev" onClick={() => select(page - 1)} disabled={page === -1 || !!turn} aria-label="Previous experience page"><Arrow back /></button>
        <div ref={bookRef} className={'journal-book' + (closed ? ' is-closed' : '') + (backClosed ? ' is-back-closed' : '') + (turn ? ' is-turning' : '')}
          aria-busy={!!turn} onPointerDown={startDrag} onPointerMove={moveDrag}
          onPointerUp={endDrag} onPointerCancel={endDrag}
          onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
          <div className="journal-paper journal-base-left" style={{ visibility: leftIndex < 0 || closed ? 'hidden' : undefined }}>
            {backClosed ? <button data-sound="silent" className="journal-cover-button" onClick={() => select(lastPage)} aria-label="Reopen the experience journal">{backCover}</button> : leftIndex >= 0 && leftIndex <= lastPage && renderPage(leftIndex, 'left')}
          </div>
          <div className="journal-paper journal-base-right" style={{ visibility: backClosed ? 'hidden' : undefined }}>
            {closed ? <Cover items={items} onOpen={() => select(0)} onContributions={(event) => {
              contributionTrigger.current = event.currentTarget;
              setContributionsOpen(true);
            }} /> :
                rightIndex >= 0 && rightIndex <= lastPage && renderPage(rightIndex, 'right')}
          </div>
          {closed && <button data-sound="silent" className="journal-open-hint" onClick={() => select(0)}>open me <Arrow back /></button>}
          {turn && <div ref={leafRef} className={'journal-leaf' + (endClosing || endOpening ? ' journal-end-board' : '')} aria-hidden="true">
            <div className="journal-leaf-front">{leafFront}<div className="journal-leaf-light" /></div>
            <div className="journal-leaf-back">{leafBack}<div className="journal-leaf-light" /></div>
          </div>}
        </div>
        <button data-sound="silent" className="journal-side-arrow journal-next" onClick={() => select(page + 1)} disabled={page === backCoverPage || !!turn} aria-label="Next experience page"><Arrow /></button>
      </div>
      <p key={hintCycle} className={'journal-gesture-hint' + (hintReady ? ' is-arrived' : '') + (hintHidden ? ' is-used' : '')} aria-hidden={hintHidden}>Hold and drag a page to turn it</p>
      <nav className="journal-dots" aria-label="Experience pages">
        <button data-sound="silent" aria-label="Journal cover" aria-current={closed ? 'page' : undefined} disabled={!!turn} onClick={() => select(-1)} />
        {items.map((item, index) => <button data-sound="silent" key={item.role} aria-label={item.role} aria-current={page === index ? 'page' : undefined} disabled={!!turn} onClick={() => select(index)} />)}
        <button data-sound="silent" aria-label="Closing scene" aria-current={page === lastPage ? 'page' : undefined} disabled={!!turn} onClick={() => select(lastPage)} />
        <button data-sound="silent" aria-label="Back cover" aria-current={backClosed ? 'page' : undefined} disabled={!!turn} onClick={() => select(backCoverPage)} />
      </nav>
      {contributionsOpen && <JournalContributionOverlay trigger={contributionTrigger.current} onClosed={() => setContributionsOpen(false)} />}
      <span className="journal-status" role="status" aria-live="polite">{closed ? 'Experience journal cover' : backClosed ? 'Experience journal back cover' : page === lastPage ? 'Closing scene' : items[page]?.role}</span>
    </div>
  );
}
