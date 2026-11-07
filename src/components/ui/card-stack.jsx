import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './card-stack.css';

const wrap = (index, length) => ((index % length) + length) % length;

function ExperienceCardBackground({ index }) {
  if (index === 0) return <svg className="card-stack-scene scene-care" viewBox="0 0 520 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="care-signal"><stop stopColor="currentColor" stopOpacity="0" /><stop offset=".45" stopColor="currentColor" stopOpacity=".8" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    <path className="scene-fine" d="M0 72H520M0 178H520M0 268H520M80 0V320M246 0V320M420 0V320" />
    <path className="scene-care-route" d="M30 78H154Q172 78 172 96V142Q172 157 189 157H327Q345 157 345 174V242H489" />
    <path className="scene-care-route scene-care-route-two" d="M70 245H133Q149 245 149 225V204Q149 190 165 190H368Q386 190 386 174V83H486" />
    <path className="scene-care-ecg" d="M-35 160H84L105 160L119 140L133 183L151 113L168 166L185 160H274L290 160L303 144L316 176L334 128L349 162L365 160H555" />
    <path className="scene-care-sweep" d="M-35 160H84L105 160L119 140L133 183L151 113L168 166L185 160H274L290 160L303 144L316 176L334 128L349 162L365 160H555" />
    <g className="scene-care-cross"><path d="M397 63h12V51h12v12h12v12h-12v12h-12V75h-12z" /></g>
    <g className="scene-care-nodes"><circle cx="172" cy="96" r="5"/><circle cx="189" cy="157" r="5"/><circle cx="345" cy="174" r="5"/><circle cx="386" cy="83" r="5"/><circle cx="149" cy="225" r="5"/></g>
  </svg>;
  if (index === 1) return <svg className="card-stack-scene scene-engineering" viewBox="0 0 520 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path className="scene-fine" d="M0 270H520M45 0V320M260 0V320M475 0V320" />
    <g className="scene-engineering-circuit"><path d="M27 64H110V114H180L236 160H305V216H484"/><path d="M42 246H131V200H198L253 144H352V83H478"/><path d="M95 30V83H145L209 137M427 278V231H369L302 170"/></g>
    <g className="scene-engineering-network"><path d="M109 115L208 69L300 119L395 68M109 115L194 201L300 119L401 210M208 69L194 201M300 119L401 210"/><circle cx="109" cy="115" r="8"/><circle cx="208" cy="69" r="7"/><circle cx="300" cy="119" r="10"/><circle cx="395" cy="68" r="7"/><circle cx="194" cy="201" r="8"/><circle cx="401" cy="210" r="7"/></g>
    <g className="scene-engineering-code"><path d="M62 36h54m-54 11h33m-33 11h74M362 258h83m-83 11h51m-51 11h71"/></g>
    <g className="scene-engineering-particles"><circle cx="127" cy="106" r="3"/><circle cx="273" cy="131" r="3"/><circle cx="380" cy="197" r="3"/></g>
  </svg>;
  return <svg className="card-stack-scene scene-analytics" viewBox="0 0 520 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path className="scene-fine" d="M46 64H490M46 122H490M46 180H490M46 238H490M46 46V264M180 46V264M315 46V264M450 46V264" />
    <g className="scene-analytics-bars"><path d="M96 246v-36M143 246v-57M190 246v-42M237 246v-91M284 246v-76M331 246v-113M378 246v-126M425 246V84"/></g>
    <path className="scene-analytics-trend" d="M62 216L118 192L174 203L231 151L287 168L343 112L399 123L460 67" />
    <path className="scene-analytics-flow" d="M60 245C139 247 153 185 231 196S351 145 462 128" />
    <g className="scene-analytics-points"><circle cx="118" cy="192" r="5"/><circle cx="231" cy="151" r="5"/><circle cx="343" cy="112" r="5"/><circle cx="460" cy="67" r="6"/></g>
    <path className="scene-analytics-arrow" d="M448 68h13V55" />
  </svg>;
}

export default function ExperienceStack({ items }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stageWidth, setStageWidth] = useState(1100);
  const stage = useRef(null);
  const activeIndex = useRef(0);
  const length = items.length;

  useEffect(() => {
    const node = stage.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const choose = useCallback((index) => {
    const next = wrap(index, length);
    activeIndex.current = next;
    setActive(next);
  }, [length]);
  const previous = useCallback(() => choose(activeIndex.current - 1), [choose]);
  const next = useCallback(() => choose(activeIndex.current + 1), [choose]);

  useEffect(() => {
    if (reduceMotion || hovering || focused || length < 2) return undefined;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [reduceMotion, hovering, focused, length, next]);

  if (!length) return null;

  const compact = stageWidth < 650;
  const cardWidth = Math.min(520, compact ? stageWidth - 30 : stageWidth * .58);
  const cardHeight = compact ? 284 : 320;
  const cardSpacing = compact ? Math.min(92, cardWidth * .27) : cardWidth * .52;
  const fanAngle = compact ? 13 : 24;
  const current = items[active];

  return (
    <div className="card-stack-experience reveal" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="card-stack-stage" ref={stage} tabIndex={0} role="region" aria-label="Experience cards. Use left and right arrow keys to navigate." onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); } if (event.key === 'ArrowRight') { event.preventDefault(); next(); } }}>
        <div className="card-stack-spotlight" aria-hidden="true" />
        <div className="card-stack-perspective">
          {items.map((item, index) => {
            const raw = index - active;
            const offset = Math.abs(raw) > length / 2 ? raw - Math.sign(raw) * length : raw;
            const distance = Math.abs(offset);
            const selected = offset === 0;
            return (
              <motion.div
                className={`card-stack-card${selected ? ' is-active' : ''}`}
                key={item.role}
                style={{ width: cardWidth, height: cardHeight, zIndex: 10 - distance }}
                initial={false}
                animate={{ x: offset * cardSpacing, y: selected ? -20 : distance * 10, rotateZ: offset * fanAngle, rotateX: selected ? 0 : 10, scale: selected ? 1.03 : .94, opacity: 1 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 28, mass: .9 }}
                onClick={() => { if (!selected) choose(index); }}
                onPointerMove={(event) => {
                  if (reduceMotion || event.pointerType !== 'mouse') return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty('--scene-x', `${((event.clientX - rect.left) / rect.width - .5) * 12}px`);
                  event.currentTarget.style.setProperty('--scene-y', `${((event.clientY - rect.top) / rect.height - .5) * 12}px`);
                }}
                onPointerLeave={(event) => { event.currentTarget.style.setProperty('--scene-x', '0px'); event.currentTarget.style.setProperty('--scene-y', '0px'); }}
                onDragEnd={(_event, info) => { if (reduceMotion || !selected) return; if (info.offset.x > 80 || info.velocity.x > 650) previous(); else if (info.offset.x < -80 || info.velocity.x < -650) next(); }}
                drag={selected && !reduceMotion ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={.18}
                role={selected ? 'group' : 'button'}
                tabIndex={selected ? -1 : 0}
                onKeyDown={(event) => { if (!selected && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); choose(index); } }}
                aria-label={selected ? `${item.role}, selected` : `Show ${item.role}`}
                aria-hidden={selected ? undefined : false}
              >
                <div className="card-stack-card-inner">
                  <div className="card-stack-art" aria-hidden="true"><ExperienceCardBackground index={index} /><span className="card-stack-index">0{index + 1}</span><img src={item.logo} alt="" loading="lazy" decoding="async" /></div>
                  <div className="card-stack-card-copy"><span>{item.label} <i /> {item.period}</span><strong>{item.role}</strong><small>{item.company}</small></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="card-stack-controls">
        <button type="button" onClick={previous} aria-label="Previous experience" data-sound="experience-previous">←</button>
        <div className="card-stack-dots" aria-label="Choose experience">
          {items.map((item, index) => <button type="button" key={item.role} className={index === active ? 'is-active' : ''} onClick={() => choose(index)} aria-label={`Go to ${item.role}`} aria-current={index === active ? 'true' : undefined} data-sound={`experience-${index + 1}`} />)}
        </div>
        <button type="button" onClick={next} aria-label="Next experience" data-sound="experience-next">→</button>
      </div>
      <motion.article className="card-stack-detail" key={current.role} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .38 }} aria-live="polite">
        <div className="card-stack-detail-heading"><div><span>0{active + 1} / 0{length} &nbsp;·&nbsp; {current.location}</span><h3>{current.role}</h3></div><p>{current.period}<br />{current.company}</p></div>
        <p className="card-stack-summary">{current.summary}</p>
        <ul>{current.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <div className="tag-list">{current.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </motion.article>
    </div>
  );
}
