import { useEffect, useRef, useState } from 'react';
import InkRidges from './components/AuraBackground.jsx';
import CanvasText from './components/CanvasText.jsx';
import ExpandableTabs from './components/ExpandableTabs.jsx';
import SignatureHero from './components/SignalHero.jsx';
import { playControlSound, requestWelcomeSound, stopWelcomeSound, unlockSound } from './soundDesign.js';
import './project-motion.css';
import ExperienceStack from './components/ui/card-stack.jsx';
import './education-signature.css';
import './toolkit-glass.css';
import './about-profile.css';
import VoiceNoteOverlay from './VoiceNoteOverlay.jsx';
import { playVoiceNoteRevealSound } from './voiceNoteRevealSound.js';

const profileLinks = {
  github: 'https://github.com/BasitBashirMaharaza',
  linkedin: 'https://www.linkedin.com/in/basit-bashir-maharaza?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  pharmacy: 'https://share.google/5Prjs1RH4UlSEx8BZ',
};

const experiences = [
  {
    period: '2 years',
    location: 'Seer Hamdan · India',
    company: 'Dar Medicate and Medical Agency',
    role: 'Pharmacy & Healthcare Operations',
    label: 'Healthcare operations',
    logo: '/logos/pharmacy.svg',
    summary: 'Hands-on community pharmacy and medical supply operations opposite Sub-District Hospital Seer Hamdan, grounding my technology work in real care workflows.',
    points: [
      'Built practical knowledge of medicines, therapeutic categories, dosage forms, generic compositions, brand equivalents, storage and stock handling.',
      'Operated Marg ERP 9+ for POS billing, purchase entries, supplier records, tax invoices, stock reconciliation and batch expiry tracking.',
      'Supported medicine availability and dosage-schedule comprehension while maintaining accurate digital business records.',
    ],
    tags: ['Marg ERP 9+', 'Pharmacy billing', 'Digital inventory', 'Clinical domain'],
  },
  {
    period: 'Sep — Dec 2023',
    location: 'Srinagar · India',
    company: 'National Institute of Electronics & Information Technology',
    role: 'Project Intern',
    label: 'Data science',
    logo: '/logos/nielit.png',
    summary: 'Worked with technical mentors on production-focused data science problem statements and model benchmarking.',
    points: [
      'Developed exploratory data analysis pipelines and machine-learning algorithms in Python.',
      'Used NumPy, Pandas and Scikit-Learn for cleansing, feature engineering, predictive modeling and evaluation.',
    ],
    tags: ['Python', 'Scikit-Learn', 'NumPy', 'Pandas', 'EDA'],
  },
  {
    period: 'Jul — Nov 2022',
    location: 'Remote',
    company: 'Google',
    role: 'Digital Marketing Intern',
    label: 'Digital growth',
    logo: '/logos/google.svg',
    summary: 'Executed search-engine optimization initiatives, analyzed multi-channel web performance metrics and monitored organic engagement signals.',
    points: [
      'Applied SEO and organic-reach practices to improve web visibility.',
      'Monitored marketing metrics and user-interaction signals across campaigns.',
    ],
    tags: ['SEO', 'Web analytics', 'Digital strategy'],
  },
];

const projects = [
  {
    number: '01',
    title: 'HealthBot',
    eyebrow: 'Flagship · Healthcare AI',
    description: 'A conversational platform translating free-form symptom descriptions into contextual triage through adaptive, multi-turn dialogue.',
    detail: 'The architecture combines stateful clarification, ensemble prediction, urgency stratification, OCR-based prescription schedules and geospatial provider discovery.',
    tags: ['Conversational AI', 'Ensemble ML', 'OCR', 'Geospatial APIs', 'Python'],
    visual: 'pulse',
  },
  {
    number: '02',
    title: 'DocSense',
    eyebrow: 'Generative AI · 2024',
    description: 'An intelligent document Q&A engine designed to keep answers grounded in the source material.',
    detail: 'LangChain partitions documents into semantic chunks, stores vector representations and retrieves relevant context for LLM synthesis through a Streamlit interface.',
    tags: ['RAG', 'LangChain', 'Streamlit', 'LLMs', 'Vector stores'],
    visual: 'document',
  },
  {
    number: '03',
    title: 'Exploratory & Predictive Pipeline',
    eyebrow: 'Predictive data science',
    description: 'A modular path from raw data to evaluated classification and regression models.',
    detail: 'Built during project work at NIELIT with structured cleaning, feature engineering, outlier handling, cross-validation and visual model analysis.',
    tags: ['Scikit-Learn', 'NumPy', 'Pandas', 'Matplotlib', 'Seaborn'],
    visual: 'data',
  },
  {
    number: '04',
    title: 'Semantic Vector Knowledge Base',
    eyebrow: 'Natural language processing',
    description: 'Contextual search across unstructured documents using embeddings and cosine similarity.',
    detail: 'The retrieval layer maps document chunks and user queries into a shared semantic space, making results resilient to synonyms and alternate phrasing.',
    tags: ['NLP', 'Embeddings', 'LangChain', 'Vector indexing'],
    visual: 'nodes',
  },
  {
    number: '05',
    title: 'SEO & Web Analytics Engine',
    eyebrow: 'Growth & analytics',
    description: 'A structured framework for search intent, discoverability, engagement and content performance.',
    detail: 'The audit approach combines crawl optimization, intent mapping and user behavior analysis to identify practical visibility improvements.',
    tags: ['SEO', 'Web analytics', 'Growth strategy', 'Data tracking'],
    visual: 'search',
  },
];

const skillGroups = [
  ['AI & machine learning', 'Retrieval-Augmented Generation', 'Large Language Models & LangChain', 'NLP & semantic retrieval', 'Scikit-Learn modeling', 'Feature engineering & evaluation'],
  ['Languages & data', 'Python', 'NumPy & Pandas', 'C / C++ foundations', 'Matplotlib & Seaborn', 'Data cleansing & EDA'],
  ['Healthcare operations', 'Marg ERP 9+', 'Pharmacy billing & POS', 'Pharmaceutical formulations', 'Digital inventory & reconciliation', 'Batch & expiry workflows'],
  ['Web & analytics', 'Streamlit prototyping', 'Search engine optimization', 'Web analytics', 'Git & Linux', 'Digital growth strategy'],
];

function SkillIcon({ index }) {
  const paths = [
    <><path d="M4 23 16 4l12 19H4Z" /><path d="m13 23 7-11 7 11" /><circle cx="16" cy="4" r="1.5" /></>,
    <><rect x="4" y="5" width="16" height="21" rx="3" /><path d="M10 10h4M10 15h9M10 20h6M23 9l5 5-5 5" /></>,
    <><path d="M16 3 29 16 16 29 3 16 16 3Z" /><path d="M7 16h5l3-5 3 10 3-5h4" /></>,
    <><circle cx="16" cy="16" r="12" /><path d="M5 19h5l4-7 4 10 4-6h5M10 9h12" /></>,
  ];
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index]}</svg>;
}

function ToolkitGallery() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? selected;
  const tiltCard = (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = event.currentTarget;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - left) / width - .5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - top) / height - .5) * 2));
    card.style.setProperty('--toolkit-tilt-x', `${-y * 3}deg`);
    card.style.setProperty('--toolkit-tilt-y', `${x * 3}deg`);
    card.style.setProperty('--toolkit-light-x', `${(x + 1) * 50}%`);
    card.style.setProperty('--toolkit-light-y', `${(y + 1) * 50}%`);
  };
  const resetCardTilt = (card) => {
    card.style.removeProperty('--toolkit-tilt-x');
    card.style.removeProperty('--toolkit-tilt-y');
    card.style.removeProperty('--toolkit-light-x');
    card.style.removeProperty('--toolkit-light-y');
  };
  return <div className="skills-grid toolkit-cards" data-expanded={active !== null}>
    {skillGroups.map(([title, ...skills], index) => {
      const open = active === index;
      return <article className="skill-column skill-card reveal" data-open={open} key={title} onPointerMove={tiltCard} onPointerLeave={(event) => { if (event.pointerType === 'mouse') { resetCardTilt(event.currentTarget); setHovered(null); } }}>
        <div className="skill-card-top"><span>0{index + 1} / 04</span><SkillIcon index={index} /></div>
        <h3>{title}</h3>
        <div id={`skill-card-panel-${index}`} className="skill-card-details" aria-hidden={!open}>
          <div className="skill-card-details-inner"><p>Working knowledge</p><ul>{skills.map((skill, skillIndex) => <li key={skill} style={{ '--skill-index': skillIndex }}>{skill}</li>)}</ul></div>
        </div>
        <button className="skill-card-action" type="button" aria-expanded={open} aria-controls={`skill-card-panel-${index}`}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches) setHovered(index); }}
          onClick={(event) => { if (event.detail === 0 || !matchMedia('(hover: hover) and (pointer: fine)').matches) setSelected(selected === index ? null : index); }} data-sound={`toolkit-${index + 1}`}>
          <span>{open ? 'Show less' : 'Explore skills'}</span><span className="skill-card-action-icon" aria-hidden="true">{open ? '−' : '↗'}</span>
        </button>
      </article>;
    })}
  </div>;
}

function Arrow({ direction = 'up' }) {
  return <span className={`arrow arrow-${direction}`} aria-hidden="true">↗</span>;
}

function useInterfaceSounds() {
  useEffect(() => {
    const play = (event) => {
      if (!event.isTrusted) return;
      unlockSound();
      const control = event.target.closest('button, a, input, label[data-sound], [role="button"], [data-sound]');
      if (control) playControlSound(control);
    };

    const keyboard = (event) => {
      if (!event.isTrusted || event.repeat) return;
      unlockSound();
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const control = event.target.closest('button, a, input, label[data-sound], [role="button"], [data-sound]');
      if (control) playControlSound(control);
    };

    document.addEventListener('pointerdown', play, { capture: true, passive: true });
    document.addEventListener('keydown', keyboard, true);
    return () => {
      document.removeEventListener('pointerdown', play, true);
      document.removeEventListener('keydown', keyboard, true);
    };
  }, []);
}

const greetings = [
  { word: 'Hello', emoji: '✦' },
  { word: 'السلام علیکم', emoji: '☾' },
  { word: 'Namaste', emoji: '🙏' },
  { word: 'Hola', emoji: '☀️' },
  { word: 'Bonjour', emoji: '✧' },
  { word: 'Salaam', emoji: '☾' },
  { word: 'Ciao', emoji: '◡̈' },
  { word: 'Olá', emoji: '✺' },
  { word: 'Hallo', emoji: '♡' },
  { word: 'Sat Sri Akal', emoji: '✨' },
];

function WelcomeScreen({ onComplete, leaving }) {
  const [greeting, setGreeting] = useState(0);
  const screen = useRef(null);

  useEffect(() => {
    let exitTimer;
    const interval = window.setInterval(() => {
      setGreeting((current) => {
        if (current >= greetings.length - 2) {
          window.clearInterval(interval);
          exitTimer = window.setTimeout(onComplete, 300);
          return greetings.length - 1;
        }
        return current + 1;
      });
    }, 300);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(exitTimer);
    };
  }, [onComplete]);

  const parallax = (event) => {
    const rect = screen.current.getBoundingClientRect();
    screen.current.style.setProperty('--welcome-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 16}deg`);
    screen.current.style.setProperty('--welcome-y', `${((event.clientY - rect.top) / rect.height - 0.5) * -12}deg`);
  };

  return (
    <div className={`welcome-screen ${leaving ? 'is-leaving' : ''}`} ref={screen} onPointerMove={parallax}>
      <InkRidges />
      <div className="welcome-grid" aria-hidden="true" />
      <div className="welcome-top"><span>BASIT BASHIR</span><span>WELCOME · 0{greeting + 1}/0{greetings.length}</span></div>
      <div className="welcome-stage" aria-live="polite">
        <span className="welcome-echo echo-one">{greetings[(greeting + greetings.length - 1) % greetings.length].word}</span>
        <div className="welcome-word" key={greetings[greeting].word}>
          <span className="welcome-emoji" aria-hidden="true">{greetings[greeting].emoji}</span>
          <strong>{greetings[greeting].word}</strong>
          <small>A portfolio of applied intelligence</small>
        </div>
        <span className="welcome-echo echo-two">{greetings[(greeting + 1) % greetings.length].word}</span>
      </div>
    </div>
  );
}

function ExperienceGallery() {
  return <ExperienceStack items={experiences} />;
}

function LampSwitch({ theme, onToggle }) {
  return (
    <label className="bb8-toggle" data-sound="theme-switch">
      <input
        className="bb8-toggle__checkbox"
        type="checkbox"
        checked={theme === 'dark'}
        onChange={onToggle}
        data-sound="theme-switch"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      />
      <span className="bb8-toggle__container">
        <span className="bb8-toggle__scenery">
          {Array.from({ length: 7 }, (_, index) => <i className="bb8-toggle__star" key={`star-${index}`} />)}
          <i className="tatto-1" /><i className="tatto-2" />
          <i className="gomrassen" /><i className="hermes" /><i className="chenini" />
          <i className="bb8-toggle__cloud" /><i className="bb8-toggle__cloud" /><i className="bb8-toggle__cloud" />
        </span>
        <span className="bb8">
          <span className="bb8__head-container">
            <i className="bb8__antenna" /><i className="bb8__antenna" /><i className="bb8__head" />
          </span>
          <i className="bb8__body" />
        </span>
        <span className="artificial__hidden"><i className="bb8__shadow" /></span>
      </span>
    </label>
  );
}

function Header({ theme, onThemeToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const update = () => {
      const current = window.scrollY;
      setHidden(current > lastScroll.current && current > 520 && !menuOpen);
      lastScroll.current = current;
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const escape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menuOpen]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const navTabs = [
    { title: 'About', icon: 'about', target: 'about' },
    { title: 'Education', icon: 'education', target: 'education' },
    { title: 'Experience', icon: 'experience', target: 'experience' },
    { title: 'Work', icon: 'work', target: 'work' },
    { title: 'Toolkit', icon: 'toolkit', target: 'toolkit' },
    { type: 'separator' },
    { title: 'Contact', icon: 'contact', target: 'contact' },
  ];
  const navigateTab = (_, tab) => {
    if (!tab) return;
    document.getElementById(tab.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header className={`site-header ${hidden ? 'header-hidden' : ''}`}>
        <a className="brand" href="#home" onClick={close} aria-label="Basit Bashir, home">
          <span className="brand-avatar"><img src="/portfolio_photo.webp" alt="" decoding="async" fetchPriority="high" /></span>
          <span className="brand-name">Basit Bashir <small>AI · DATA · HEALTH</small></span>
        </a>
        <div className="desktop-nav"><ExpandableTabs tabs={navTabs} onChange={navigateTab} /></div>
        <div className="header-actions">
          <a className="nav-cta" href="#contact">Let’s talk <Arrow /></a>
          <div className="header-switch-dock"><LampSwitch theme={theme} onToggle={onThemeToggle} /></div>
          <button className={`menu-button ${menuOpen ? 'open' : ''}`} type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation"><span /><span /></button>
        </div>
      </header>
      <nav id="mobile-navigation" className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
        {['about', 'education', 'experience', 'work', 'toolkit', 'contact'].map((item, index) => <a key={item} href={`#${item}`} onClick={close}><span>0{index + 1}</span>{item}</a>)}
      </nav>
    </>
  );
}

function OrbitalHero({ introReady }) {
  const scene = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const orbitItems = [
    { number: '01', title: 'AI', subtitle: 'Context systems', detail: 'Grounded assistants, retrieval pipelines and purposeful LLM orchestration.', target: 'work' },
    { number: '02', title: 'ML', subtitle: 'Predictive models', detail: 'Feature engineering, model evaluation and practical predictive systems.', target: 'work' },
    { number: '03', title: 'CARE', subtitle: 'Health informatics', detail: 'Healthcare technology informed by two years of frontline pharmacy work.', target: 'experience' },
    { number: '04', title: 'DATA', subtitle: 'Applied pipelines', detail: 'Clean, explainable paths from raw information to useful decisions.', target: 'toolkit' },
  ];
  const [activeOrbit, setActiveOrbit] = useState(orbitItems[0]);

  useEffect(() => {
    const element = scene.current;
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const pointer = (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.setProperty('--scene-x', `${x * 11}deg`);
      element.style.setProperty('--scene-y', `${-y * 9}deg`);
    };
    const reset = () => {
      element.style.setProperty('--scene-x', '0deg');
      element.style.setProperty('--scene-y', '0deg');
    };
    element.addEventListener('pointermove', pointer);
    element.addEventListener('pointerleave', reset);
    return () => {
      element.removeEventListener('pointermove', pointer);
      element.removeEventListener('pointerleave', reset);
    };
  }, []);

  const exploreActive = () => {
    document.getElementById(activeOrbit.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="orbital-scene" ref={scene} aria-label="Interactive orbital illustration of Basit’s core disciplines">
      <div className="scene-ambient" />
      <div className="scene-cross cross-x" /><div className="scene-cross cross-y" />
      <div className="orbit orbit-outer"><i /></div>
      <div className="orbit orbit-inner"><i /></div>
      <div className="orbit-track">
        {orbitItems.map((item, index) => (
          <div className={`orbit-item orbit-item-${index + 1}`} key={item.title}>
            <button
              className={`orbit-card ${activeOrbit.title === item.title ? 'is-active' : ''}`}
              type="button"
              data-sound={`orbit-${item.title}`}
              aria-pressed={activeOrbit.title === item.title}
              onClick={() => setActiveOrbit(item)}
            >
              <span>{item.number}</span><strong>{item.title}</strong><small>{item.subtitle}</small>
            </button>
          </div>
        ))}
      </div>
      <div className="portrait-core">
        <button className="portrait-frame" type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="dialog" data-sound="profile-greeting">
          <img src="/portfolio_photo.webp" alt="Basit Bashir" decoding="async" fetchPriority="high" />
          <span className="sr-only">Open a greeting from Basit</span>
        </button>
        <div className="portrait-copy">
          <span>{activeOrbit.title} · {activeOrbit.subtitle}</span>
          {introReady ? <CanvasText text="Basit Bashir" className="portrait-particle-name" /> : <strong className="portrait-name-placeholder" aria-hidden="true">Basit Bashir</strong>}
          <small>{activeOrbit.detail}</small>
          <button className="orbit-explore" type="button" onClick={exploreActive} data-sound={`explore-${activeOrbit.title}`}>Explore section <b>↘</b></button>
        </div>
        {profileOpen && (
          <div className="portrait-greeting" role="dialog" aria-label="A greeting from Basit">
            <button className="portrait-greeting-close" type="button" onClick={() => setProfileOpen(false)} aria-label="Close greeting">×</button>
            <span>Hi there.</span>
            <strong>Thanks for stopping by.</strong>
            <p>I’m always glad to connect about thoughtful AI, data and healthcare work. Let’s build something useful.</p>
            <div><a href="#contact" onClick={() => setProfileOpen(false)}>Let’s talk <b>↘</b></a><a href={profileLinks.linkedin} target="_blank" rel="noreferrer">Connect <b>↗</b></a></div>
          </div>
        )}
      </div>
      <div className="scene-coordinates">34.15° N / 75.01° E</div>
    </div>
  );
}

function SectionHeading({ index, label, children, aside }) {
  return (
    <header className="section-heading reveal">
      <p className="section-label"><span>{index}</span>{label}</p>
      <h2>{children}</h2>
      {aside && <p className="section-aside">{aside}</p>}
    </header>
  );
}

function ProjectVisual({ type, index }) {
  const images = { pulse: 'healthbot', document: 'docsense', data: 'predictive', nodes: 'semantic', search: 'seo' };
  const visual = useRef(null);

  useEffect(() => {
    const root = visual.current;
    const card = root?.closest('.project-card');
    if (!root || !card) return undefined;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (!visible || reduced.matches) return;
      const rect = root.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      root.style.setProperty('--work-progress', progress.toFixed(3));
      root.style.setProperty('--work-parallax', `${((progress - .5) * 22).toFixed(2)}px`);
      root.style.setProperty('--work-scale', (1.055 + progress * .018).toFixed(3));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { root.classList.add('work-motion-entered'); schedule(); }
    }, { threshold: 0.08, rootMargin: '0px 0px 8% 0px' });
    observer.observe(root);
    const move = (event) => {
      if (reduced.matches || !finePointer.matches) return;
      const rect = root.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      root.style.setProperty('--work-x', `${(-x * 7).toFixed(2)}px`);
      root.style.setProperty('--work-y', `${(-y * 6).toFixed(2)}px`);
      root.style.setProperty('--work-light-x', `${(50 + x * 32).toFixed(1)}%`);
      root.style.setProperty('--work-light-y', `${(50 + y * 32).toFixed(1)}%`);
    };
    const reset = () => { root.style.setProperty('--work-x', '0px'); root.style.setProperty('--work-y', '0px'); root.style.setProperty('--work-light-x', '50%'); root.style.setProperty('--work-light-y', '50%'); };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', reset);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    if (reduced.matches) root.classList.add('work-motion-entered');
    return () => {
      observer.disconnect();
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', reset);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={`project-visual project-art work-motion work-motion-${type}`} style={{ '--work-delay': `${index * 75}ms` }} ref={visual} aria-hidden="true">
      <div className="work-motion-stage">
        <img className="project-photograph" src={`/project-images/${images[type]}.svg`} alt="" loading="lazy" decoding="async" />
        <span className="work-motion-effect"><i /><i /><i /><i /></span>
        <span className="work-motion-light" />
      </div>
    </div>
  );
}

function LegacySignatureHero() {
  const surface = useRef(null);
  useEffect(() => {
    const root = surface.current;
    if (!root || !matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const move = (event) => {
      const box = root.getBoundingClientRect();
      root.style.setProperty('--hero-x', `${((event.clientX - box.left) / box.width - .5) * 18}px`);
      root.style.setProperty('--hero-y', `${((event.clientY - box.top) / box.height - .5) * 18}px`);
    };
    const reset = () => { root.style.setProperty('--hero-x', '0px'); root.style.setProperty('--hero-y', '0px'); };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', reset);
    return () => { root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', reset); };
  }, []);
  return <section className="signature-hero" id="home" ref={surface}>
    <div className="signature-noise" aria-hidden="true" />
    <div className="signature-glow signature-glow-one" aria-hidden="true" /><div className="signature-glow signature-glow-two" aria-hidden="true" />
    <svg className="signature-contours" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><path d="M-50 655 C180 514 225 798 445 646 S720 545 890 676 S1190 765 1360 590 S1530 670 1660 490" /><path d="M-80 720 C120 575 272 858 490 702 S764 604 934 733 S1210 822 1412 645 S1540 734 1690 552" /><path d="M-80 785 C120 640 270 922 504 758 S786 668 944 790 S1214 888 1424 710 S1540 800 1690 615" /></svg>
    <div className="signature-shell container">
      <div className="signature-topline"><span><i /> Available for thoughtful AI systems</span><span>34.15° N&nbsp; / &nbsp;75.01° E</span></div>
      <div className="signature-main">
        <div className="signature-copy">
          <p className="signature-index">01 — Basit Bashir / independent systems engineer</p>
          <h1><span>Human</span><span>context,</span><em>made useful.</em></h1>
          <p className="signature-intro">I design applied intelligence that is calm under complexity—bridging generative AI, data systems, and the lived realities of healthcare operations.</p>
          <div className="signature-actions"><a href="#work" className="signature-primary">Enter the work <b>↓</b></a><a href="#experience" className="signature-text-link">View field notes <Arrow /></a></div>
        </div>
        <div className="signature-object" aria-label="Interactive profile signal">
          <div className="signature-orbit orbit-one" /><div className="signature-orbit orbit-two" /><div className="signature-orbit orbit-three" />
          <div className="signature-crosshair" /><div className="signature-avatar"><img src="/portfolio_photo.webp" alt="Basit Bashir" /><span>BB</span></div>
          <div className="signature-data signature-data-top"><b>01</b><span>RETRIEVAL<br />SYSTEMS</span></div><div className="signature-data signature-data-right"><b>02</b><span>MODEL<br />CRAFT</span></div><div className="signature-data signature-data-bottom"><b>03</b><span>CARE<br />OPERATIONS</span></div>
          <div className="signature-pulse"><i /><i /><i /></div>
        </div>
      </div>
      <div className="signature-footer"><span>AI · DATA · HEALTHCARE</span><span className="signature-scroll">SCROLL TO EXPLORE <i>↓</i></span><span>ANANTNAG, INDIA</span></div>
    </div>
  </section>;
}

function replaySignature(event) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const signature = event.currentTarget;
  signature.signatureAnimations?.forEach((animation) => animation.cancel());
  signature.signatureAnimations = Array.from(signature.querySelectorAll('path'), (path, index) => {
    const length = path.getTotalLength();
    return path.animate(
      [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      { duration: index < 3 ? 620 : 360, delay: index < 3 ? index * 160 : 480 + (index - 3) * 110, easing: 'ease-out', fill: 'both' },
    );
  });
}

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceOrigin, setVoiceOrigin] = useState(null);
  const voiceTrigger = useRef(null);
  const lastVoicePress = useRef(null);
  const voiceOpened = useRef(false);
  const welcomeSoundArmed = useRef(false);
  useInterfaceSounds();

  const openVoiceNote = (event) => {
    if (voiceOpen || voiceOpened.current) return;
    voiceOpened.current = true;
    const rect = voiceTrigger.current?.getBoundingClientRect();
    setVoiceOrigin({
      x: event?.clientX || (rect ? rect.left + rect.width / 2 : innerWidth / 2),
      y: event?.clientY || (rect ? rect.top + rect.height / 2 : innerHeight / 2),
    });
    stopWelcomeSound();
    playVoiceNoteRevealSound();
    setVoiceOpen(true);
  };

  const handleVoicePress = (event) => {
    if (event.button !== 0) return;
    const now = Date.now();
    const last = lastVoicePress.current;
    const maxDelay = event.pointerType === 'touch' ? 350 : 500;
    if (last && last.pointerType === event.pointerType && now - last.time < maxDelay && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 40) {
      lastVoicePress.current = null;
      openVoiceNote(event);
    } else {
      lastVoicePress.current = { time: now, x: event.clientX, y: event.clientY, pointerType: event.pointerType };
    }
  };

  const finishWelcome = () => {
    if (welcomeLeaving) return;
    setWelcomeLeaving(true);
    window.setTimeout(() => {
      welcomeSoundArmed.current = true;
      setWelcomeOpen(false);
    }, 480);
  };

  useEffect(() => {
    document.body.classList.toggle('welcome-open', welcomeOpen);
    return () => document.body.classList.remove('welcome-open');
  }, [welcomeOpen]);

  useEffect(() => {
    requestWelcomeSound();
  }, []);

  useEffect(() => {
    if (welcomeOpen || !welcomeSoundArmed.current) return undefined;
    window.scrollTo({ top: 0, behavior: 'instant' });
    return undefined;
  }, [welcomeOpen]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('basit-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0b0d' : '#f3f2eb');
  }, [theme]);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = document.querySelectorAll('.reveal');
    if (reduce) {
      reveals.forEach((node) => node.classList.add('visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((node) => observer.observe(node));

    let frame = 0;
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        document.documentElement.style.setProperty('--scroll', max > 0 ? window.scrollY / max : 0);
        document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
      });
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const cards = document.querySelectorAll('[data-tilt]');
    const move = (event) => {
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${-y * 3.5}deg`);
      card.style.setProperty('--tilt-y', `${x * 4.5}deg`);
    };
    const reset = (event) => {
      event.currentTarget.style.setProperty('--tilt-x', '0deg');
      event.currentTarget.style.setProperty('--tilt-y', '0deg');
    };
    cards.forEach((card) => { card.addEventListener('pointermove', move); card.addEventListener('pointerleave', reset); });
    return () => cards.forEach((card) => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', reset); });
  }, []);

  return (
    <>
      {welcomeOpen && <WelcomeScreen onComplete={finishWelcome} leaving={welcomeLeaving} />}
      <a className="skip-link" href="#main">Skip to content</a>
      <InkRidges />
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <Header theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

      <main id="main">
        {welcomeOpen ? <div className="hero-placeholder" aria-hidden="true" /> : <SignatureHero />}

        <section className="section about" id="about">
          <div className="container">
            <SectionHeading index="01" label="Profile">A technical perspective shaped by <em>care.</em></SectionHeading>
            <div className="about-grid">
              <figure ref={voiceTrigger} className="about-profile-sketch reveal" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Basit Bashir portrait. Double-click or double-tap to open a voice note; press Enter to open with a keyboard." data-sound="silent" onDoubleClick={openVoiceNote} onPointerUp={handleVoicePress} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openVoiceNote(event); } }} onPointerMove={(event) => { if (event.pointerType !== 'mouse') return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--profile-tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -3}deg`); event.currentTarget.style.setProperty('--profile-tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 3}deg`); }} onPointerLeave={(event) => { event.currentTarget.style.setProperty('--profile-tilt-x', '0deg'); event.currentTarget.style.setProperty('--profile-tilt-y', '0deg'); }}>
                <div className="about-profile-portrait"><img src="/portfolio_photo.webp" alt="Basit Bashir" loading="lazy" decoding="async" /></div>
                <svg className="about-profile-arrows" viewBox="0 0 400 320" preserveAspectRatio="none" aria-hidden="true"><path d="M107 34 C126 31 140 39 148 55 M137 49 L148 55 L148 43" /><path d="M293 34 C274 31 260 39 252 55 M252 43 L252 55 L263 49" /><path d="M75 151 C89 143 101 146 108 160 M97 153 L108 160 L99 168" /><path d="M325 151 C311 143 299 146 292 160 M301 168 L292 160 L303 153" /><path d="M102 295 C113 280 128 273 144 270 M130 265 L144 270 L135 280" /><path d="M298 295 C287 280 272 273 256 270 M265 280 L256 270 L270 265" /></svg>
                <span className="about-profile-note note-clear">Clear Thinker</span><span className="about-profile-note note-detail">Detail-Oriented</span><span className="about-profile-note note-people">People-First</span><span className="about-profile-note note-curious">Curious</span><span className="about-profile-note note-fast">Fast Learner</span><span className="about-profile-note note-consistent">Consistent</span>
              </figure>
              <div className="about-copy reveal">
                <p>I graduated with a Bachelor of Technology in Computer Science & Engineering from Government College of Engineering and Technology, Safapora Ganderbal, in the 2024 batch.</p>
                <p>Technical internships at NIELIT Srinagar and Google sit alongside two years at Dar Medicate and Medical Agency. Experience with pharmaceutical products, prescription workflows, inventory and Marg ERP 9+ now informs how I approach healthcare AI.</p>
                <a className="underlink" href={profileLinks.pharmacy} target="_blank" rel="noreferrer">View the pharmacy location <Arrow /></a>
                <div className="about-focus"><div><span>Focus</span><strong>Data Science<br />Generative AI<br />Healthcare Informatics</strong></div><div><span>Core stack</span><strong>Python · LangChain<br />Scikit-Learn · Pandas<br />Streamlit · NumPy</strong></div></div>
              </div>
            </div>
            <div className="capabilities reveal"><span>Retrieval-Augmented Generation</span><span>Clinical conversational AI</span><span>Predictive modeling</span><span>Pharmacy operations & ERP</span></div>
          </div>
        </section>

        <section className="section education" id="education">
          <div className="container">
            <SectionHeading index="05" label="Education">Formal learning, <em>applied.</em></SectionHeading>
            <div className="education-grid">
              <article className="degree-card reveal" data-tilt><div className="degree-year">2019<span>—</span>2024</div><div><div className="degree-institution-mark"><img src="/logos/gcet-degree.svg" alt="" loading="lazy" decoding="async" /><span>GCET Kashmir<small>Safapora · Ganderbal</small></span></div><p className="mini-label">Academic degree</p><h3>Bachelor of Technology</h3><h4>Computer Science & Engineering</h4><p>Government College of Engineering and Technology (GCET), Safapora Ganderbal, Jammu & Kashmir, India.</p><div className="tag-list"><span>Algorithms & DSA</span><span>Machine learning</span><span>DBMS</span><span>Software engineering</span><span>Operating systems</span></div></div></article>
              <div className="credentials">
                <article className="credential reveal" data-tilt><img className="credential-logo credential-logo-michigan" src="/logos/michigan.svg" alt="University of Michigan logo" loading="lazy" decoding="async" /><div><span>University of Michigan</span><time>Jun 2024</time></div><h3>Applied Machine Learning in Python</h3><p>Applied algorithms, Scikit-Learn model creation, NumPy and Pandas preprocessing, and evaluation metrics.</p></article>
                <article className="credential reveal" data-tilt><img className="credential-logo credential-logo-google" src="/logos/google.svg" alt="Google logo" loading="lazy" decoding="async" /><div><span>Google Digital Garage</span><time>Nov 2022</time></div><h3>The Fundamentals of Digital Marketing</h3><p>SEO practices, digital strategy, web analytics and search-performance optimization.</p><small>Credential ID: U33 RXC S8T</small></article>
              </div>
            </div>
          </div>
        </section>

        <section className="section experience" id="experience">
          <div className="container">
            <SectionHeading index="02" label="Experience">From operations to <em>models.</em></SectionHeading>
            <ExperienceGallery />
          </div>
        </section>

        <section className="section work" id="work">
          <div className="container">
            <SectionHeading index="03" label="Selected work" aside="Five projects across conversational healthcare, document intelligence, predictive data science, semantic search and web analytics.">Systems built for <em>use.</em></SectionHeading>
            <div className="project-stack">
              {projects.map((project, index) => (
                <article className="project-card reveal" key={project.title} style={{ '--index': index }} data-tilt>
                  <ProjectVisual type={project.visual} index={index} />
                  <div className="project-copy">
                    <div className="project-meta"><span>{project.number}</span><span>{project.eyebrow}</span></div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p><p className="project-detail">{project.detail}</p>
                    <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <a className="case-link" href={profileLinks.github} target="_blank" rel="noreferrer">Explore on GitHub <Arrow /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section toolkit" id="toolkit">
          <div className="container">
            <SectionHeading index="04" label="Toolkit">Capabilities over <em>percentages.</em></SectionHeading>
            <ToolkitGallery />
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-orb" aria-hidden="true" />
          <div className="container contact-grid">
            <div className="contact-copy reveal"><p className="section-label"><span>06</span>Contact</p><h2>Let’s build something <em>useful.</em></h2><p>If you’re working on retrieval systems, healthcare AI, predictive models, or a role where practical domain thinking matters, I’d like to hear about <span className="contact-signature-anchor">it.<svg className="contact-signature" viewBox="0 0 150 62" role="button" tabIndex={0} aria-label="Replay Basit signature" onClick={replaySignature} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); replaySignature(event); } }}><path d="M12 51 C18 35 25 17 31 8 C35 2 47 3 49 10 C52 18 41 23 29 27 C41 22 56 24 54 34 C52 43 37 49 17 49 C32 50 47 46 57 40" /><path d="M57 40 C61 35 66 32 69 35 C72 38 68 45 62 46 C57 46 58 40 62 36 M69 36 C66 43 68 47 75 42 C79 38 83 34 87 35 C91 37 85 41 79 43 C76 46 83 47 90 41" /><path d="M90 41 C93 37 96 33 98 32 C96 37 93 43 97 44 C101 44 104 40 107 37 C111 32 115 20 118 14 C120 10 121 15 118 22 C115 31 109 40 111 43 C114 47 121 41 129 35 C133 32 137 33 140 35" /><path d="M107 29 C115 27 122 26 128 27" /><path d="M100 26 L100.5 25" /><path d="M29 55 C63 56 100 53 137 52" /></svg></span></p></div>
            <div className="contact-links reveal">
              <a href={profileLinks.linkedin} target="_blank" rel="noreferrer"><small>Start a conversation</small><strong>LinkedIn</strong><Arrow /></a>
              <a href={profileLinks.github} target="_blank" rel="noreferrer"><small>Explore the code</small><strong>GitHub</strong><Arrow /></a>
              <div className="contact-availability"><i /><span><strong>Open to opportunities</strong><small>Onsite & remote · Anantnag, India</small></span></div>
            </div>
          </div>
        </section>
      </main>

      <footer><div className="container"><span>© {new Date().getFullYear()} Basit Bashir</span><span>Computer Science Engineer · AI, Data & Healthcare</span><a href="#home">Back to top ↑</a></div></footer>
      {voiceOpen && <VoiceNoteOverlay origin={voiceOrigin} onClosed={() => { setVoiceOpen(false); requestAnimationFrame(() => voiceTrigger.current?.focus({ preventScroll: true })); }} />}
    </>
  );
}

export default App;
