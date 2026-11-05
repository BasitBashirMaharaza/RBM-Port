import { useEffect, useRef, useState } from 'react';
import InkRidges from './components/InkRidges.jsx';
import CanvasText from './components/CanvasText.jsx';
import ExpandableTabs from './components/ExpandableTabs.jsx';
import { playControlSound, requestWelcomeSound, unlockSound } from './soundDesign.js';

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

function Arrow({ direction = 'up' }) {
  return <span className={`arrow arrow-${direction}`} aria-hidden="true">↗</span>;
}

function useInterfaceSounds() {
  useEffect(() => {
    const play = (event) => {
      unlockSound();
      const control = event.target.closest('button, a, input, label[data-sound], [role="button"], [data-sound]');
      if (control) playControlSound(control);
    };

    const keyboard = (event) => {
      if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
      unlockSound();
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
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState('next');
  const gallery = useRef(null);
  const touchStart = useRef(null);
  const item = experiences[active];

  const select = (index) => {
    const normalized = (index + experiences.length) % experiences.length;
    setDirection(normalized > active || (active === experiences.length - 1 && normalized === 0) ? 'next' : 'previous');
    setActive(normalized);
  };

  const parallax = (event) => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const rect = gallery.current.getBoundingClientRect();
    gallery.current.style.setProperty('--gallery-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 4.5}deg`);
    gallery.current.style.setProperty('--gallery-y', `${((event.clientY - rect.top) / rect.height - 0.5) * -3.5}deg`);
  };

  const reset = () => {
    gallery.current?.style.setProperty('--gallery-x', '0deg');
    gallery.current?.style.setProperty('--gallery-y', '0deg');
  };

  const startSwipe = (event) => {
    if (event.pointerType === 'mouse') return;
    touchStart.current = { x: event.clientX, y: event.clientY };
  };

  const endSwipe = (event) => {
    if (!touchStart.current) return;
    const deltaX = event.clientX - touchStart.current.x;
    const deltaY = event.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 46 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    select(active + (deltaX < 0 ? 1 : -1));
  };

  return (
    <div className="experience-gallery reveal" ref={gallery} onPointerMove={parallax} onPointerLeave={reset}>
      <div className="experience-stage" onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={() => { touchStart.current = null; }}>
        <div className={`experience-panel is-${direction}`} key={item.role}>
          <div className="experience-visual" aria-hidden="true">
            <span>0{active + 1}</span>
            <div className="experience-rings"><i /><i /><i /></div>
            <div className="experience-brand"><img src={item.logo} alt="" loading="lazy" decoding="async" /><span>Verified identity</span></div>
            <small>{item.label}</small>
            <strong>{item.company}</strong>
          </div>
          <article className="experience-detail">
            <div className="experience-meta"><span>{item.period}</span><span>{item.location}</span></div>
            <p>{item.company}</p>
            <h3>{item.role}</h3>
            <div className="experience-summary">{item.summary}</div>
            <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
            <div className="tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
        </div>
      </div>
      <div className="experience-controls">
        <div className="gallery-arrows">
          <button type="button" onClick={() => select(active - 1)} aria-label="Previous experience" data-sound="experience-previous">←</button>
          <button type="button" onClick={() => select(active + 1)} aria-label="Next experience" data-sound="experience-next">→</button>
        </div>
        <span><b>0{active + 1}</b> / 0{experiences.length}</span>
      </div>
      <div className="experience-thumbnails" role="tablist" aria-label="Experience gallery">
        {experiences.map((experience, index) => (
          <button className={active === index ? 'is-active' : ''} type="button" role="tab" aria-selected={active === index} onClick={() => select(index)} key={experience.role} data-sound={`experience-${index + 1}`}>
            <span>0{index + 1}</span><strong>{experience.role}</strong><small>{experience.period}</small>
          </button>
        ))}
      </div>
    </div>
  );
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
    { title: 'Experience', icon: 'experience', target: 'experience' },
    { title: 'Work', icon: 'work', target: 'work' },
    { title: 'Toolkit', icon: 'toolkit', target: 'toolkit' },
    { title: 'Education', icon: 'education', target: 'education' },
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
          <button className={`menu-button ${menuOpen ? 'open' : ''}`} type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation"><span /><span /></button>
        </div>
      </header>
      <div className={`header-switch-dock ${hidden ? 'header-hidden' : ''}`}><LampSwitch theme={theme} onToggle={onThemeToggle} /></div>
      <nav id="mobile-navigation" className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
        {['about', 'experience', 'work', 'toolkit', 'education', 'contact'].map((item, index) => <a key={item} href={`#${item}`} onClick={close}><span>0{index + 1}</span>{item}</a>)}
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

function ProjectVisual({ type }) {
  return (
    <div className={`project-visual visual-${type}`} aria-hidden="true">
      {type === 'pulse' && <><div className="medical-grid" /><div className="pulse-line" /><span>Symptoms</span><span>Triage</span><span>Care</span></>}
      {type === 'document' && <><div className="document-sheet"><i /><i /><i /><i /></div><b>?</b><div className="vector-plane" /></>}
      {type === 'data' && <><svg viewBox="0 0 600 350" preserveAspectRatio="none"><path d="M0 260 C80 250 90 160 165 180 S270 260 350 140 S470 100 600 40" /><path d="M0 290 C130 260 190 300 285 220 S430 160 600 190" /></svg><i /></>}
      {type === 'nodes' && <div className="node-field">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>}
      {type === 'search' && <><div className="search-ring" /><div className="search-bars">{[68, 42, 86, 58, 94].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></>}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  useInterfaceSounds();

  const finishWelcome = () => {
    if (welcomeLeaving) return;
    requestWelcomeSound();
    setWelcomeLeaving(true);
    window.setTimeout(() => setWelcomeOpen(false), 480);
  };

  useEffect(() => {
    document.body.classList.toggle('welcome-open', welcomeOpen);
    return () => document.body.classList.remove('welcome-open');
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
        <section className="hero" id="home">
          <div className="hero-grain" />
          <div className="hero-layout container">
            <div className="hero-copy">
              <p className="availability reveal"><i /> Available for AI & data science opportunities</p>
              <h1><span><i>Engineering</i></span><span><i>intelligence for</i></span><span className="hero-accent"><i>real-world care.</i></span></h1>
              <p className="hero-intro reveal">I’m <strong>Basit Bashir</strong>, a computer science engineer connecting data science, generative AI and two years of frontline pharmacy experience to build useful systems.</p>
              <div className="hero-actions reveal">
                <a className="primary-button" href="#work">Explore selected work <span>↓</span></a>
                <a className="underlink" href={profileLinks.github} target="_blank" rel="noreferrer">GitHub <Arrow /></a>
                <a className="underlink" href={profileLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn <Arrow /></a>
              </div>
              <div className="hero-meta reveal"><span>Anantnag, Jammu & Kashmir, India</span><span>Open to onsite & remote roles</span></div>
            </div>
            <OrbitalHero introReady={!welcomeOpen} />
          </div>
          <div className="marquee" aria-hidden="true"><div>{['Generative AI', 'Predictive systems', 'Healthcare informatics', 'Data engineering', 'Human-centered technology', 'Generative AI'].map((item, i) => <span key={`${item}-${i}`}>{item}<b>✦</b></span>)}</div></div>
        </section>

        <section className="section about" id="about">
          <div className="container">
            <SectionHeading index="01" label="Profile">A technical perspective shaped by <em>care.</em></SectionHeading>
            <div className="about-grid">
              <p className="about-lead reveal">My work sits where machine intelligence meets practical operating knowledge.</p>
              <div className="about-copy reveal">
                <p>I graduated with a Bachelor of Technology in Computer Science & Engineering from Government College of Engineering and Technology, Safapora Ganderbal, in the 2024 batch.</p>
                <p>Technical internships at NIELIT Srinagar and Google sit alongside two years at Dar Medicate and Medical Agency. Experience with pharmaceutical products, prescription workflows, inventory and Marg ERP 9+ now informs how I approach healthcare AI.</p>
                <a className="underlink" href={profileLinks.pharmacy} target="_blank" rel="noreferrer">View the pharmacy location <Arrow /></a>
              </div>
              <aside className="profile-card reveal">
                <img src="/portfolio_photo.webp" alt="Basit Bashir" loading="lazy" decoding="async" />
                <div><span>Focus</span><strong>Data Science<br />Generative AI<br />Healthcare Informatics</strong></div>
                <div><span>Core stack</span><strong>Python · LangChain<br />Scikit-Learn · Pandas<br />Streamlit · NumPy</strong></div>
              </aside>
            </div>
            <div className="capabilities reveal"><span>Retrieval-Augmented Generation</span><span>Clinical conversational AI</span><span>Predictive modeling</span><span>Pharmacy operations & ERP</span></div>
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
                  <ProjectVisual type={project.visual} />
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
            <div className="skills-grid">
              {skillGroups.map(([title, ...skills], index) => <article className="skill-column reveal" key={title}><span>0{index + 1}</span><h3>{title}</h3><ul>{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></article>)}
            </div>
          </div>
        </section>

        <section className="section education" id="education">
          <div className="container">
            <SectionHeading index="05" label="Education">Formal learning, <em>applied.</em></SectionHeading>
            <div className="education-grid">
              <article className="degree-card reveal" data-tilt><div className="degree-year">2019<span>—</span>2024</div><div><div className="degree-institution-mark"><img src="/logos/gcet-degree.svg" alt="" loading="lazy" decoding="async" /><span>GCET Kashmir<small>Safapora · Ganderbal</small></span></div><p className="mini-label">Academic degree</p><h3>Bachelor of Technology</h3><h4>Computer Science & Engineering</h4><p>Government College of Engineering and Technology (GCET), Safapora Ganderbal, Jammu & Kashmir, India.</p><div className="tag-list"><span>Algorithms & DSA</span><span>Machine learning</span><span>DBMS</span><span>Software engineering</span><span>Operating systems</span></div></div></article>
              <div className="credentials">
                <article className="credential reveal"><img className="credential-logo credential-logo-michigan" src="/logos/michigan.svg" alt="University of Michigan logo" loading="lazy" decoding="async" /><div><span>University of Michigan</span><time>Jun 2024</time></div><h3>Applied Machine Learning in Python</h3><p>Applied algorithms, Scikit-Learn model creation, NumPy and Pandas preprocessing, and evaluation metrics.</p></article>
                <article className="credential reveal"><img className="credential-logo credential-logo-google" src="/logos/google.svg" alt="Google logo" loading="lazy" decoding="async" /><div><span>Google Digital Garage</span><time>Nov 2022</time></div><h3>The Fundamentals of Digital Marketing</h3><p>SEO practices, digital strategy, web analytics and search-performance optimization.</p><small>Credential ID: U33 RXC S8T</small></article>
              </div>
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-orb" aria-hidden="true" />
          <div className="container contact-grid">
            <div className="contact-copy reveal"><p className="section-label"><span>06</span>Contact</p><h2>Let’s build something <em>useful.</em></h2><p>If you’re working on retrieval systems, healthcare AI, predictive models, or a role where practical domain thinking matters, I’d like to hear about it.</p></div>
            <div className="contact-links reveal">
              <a href={profileLinks.linkedin} target="_blank" rel="noreferrer"><small>Start a conversation</small><strong>LinkedIn</strong><Arrow /></a>
              <a href={profileLinks.github} target="_blank" rel="noreferrer"><small>Explore the code</small><strong>GitHub</strong><Arrow /></a>
              <div className="contact-availability"><i /><span><strong>Open to opportunities</strong><small>Onsite & remote · Anantnag, India</small></span></div>
            </div>
          </div>
        </section>
      </main>

      <footer><div className="container"><span>© {new Date().getFullYear()} Basit Bashir</span><span>Computer Science Engineer · AI, Data & Healthcare</span><a href="#home">Back to top ↑</a></div></footer>
    </>
  );
}

export default App;
