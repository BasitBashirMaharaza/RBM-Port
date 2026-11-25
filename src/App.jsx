import ContactGlassLink from './components/ContactGlassLink.jsx';
import ContactMailbox from './components/ContactMailbox.jsx';
import FooterRibbons from './components/FooterRibbons.jsx';
import './contact-polish.css';
import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import InkRidges from './components/AuraBackground.jsx';
import CanvasText from './components/CanvasText.jsx';
import ExpandableTabs from './components/ExpandableTabs.jsx';
import ContactJourney,{CONTACT_JOURNEY} from './components/ContactJourney.jsx';
import SignatureHero from './components/SignalHero.jsx';
import HeroProfileTransition from './components/HeroProfileTransition.jsx';
import BeyondCvSection from './components/BeyondCvSection.jsx';
import SelectedWorkArchive from './components/SelectedWorkArchive.jsx';
import LearningGallery from './components/LearningGallery.jsx';
import SectionTextReveal from './components/SectionTextReveal.jsx';
import { ProfileTagline, ProfileAnnotations, ProfileSkillsLoop } from './components/ProfileMotion.jsx';
import { playControlSound, playNavbarCollapse, requestWelcomeSound, stopWelcomeSound, unlockSound } from './soundDesign.js';
import './project-motion.css';
import ExperienceStack from './components/ExperienceJournal.jsx';
import './education-signature.css';
import './about-profile.css';
import './section-labels.css';
import './navbar-collapse.css';
import VoiceNoteOverlay from './VoiceNoteOverlay.jsx';
import EmailContactOverlay from './EmailContactOverlay.jsx';
import { playEmailSound, stopEmailSound } from './emailContactSound.js';
import './email-contact.css';
import MichiganCertificateOverlay from './MichiganCertificateOverlay.jsx';
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
    title: 'Digital Twin',
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

const WelcomeGreetings = memo(function WelcomeGreetings({greeting,onComplete}) {
  const item = greetings[greeting];
  return <div className="welcome-stage" aria-hidden="true">
      <div className="welcome-word" key={item.word} onAnimationEnd={greeting===greetings.length-1?event=>{if(event.target===event.currentTarget&&event.animationName==='greeting-arrive')onComplete();}:undefined}>
        <span className="welcome-emoji">{item.emoji}</span>
        <strong>{item.word}</strong><small>A portfolio of applied intelligence</small>
      </div>
  </div>;
});

function WelcomeScreen({ onComplete, leaving }) {
  const [greeting, setGreeting] = useState(0);
  const screen = useRef(null);

  useEffect(() => {
    // Warm only the assets needed by the next screen, without parsing the
    // robot or mounting offscreen interactive scenes during the greetings.
    const robot = document.createElement('link');
    robot.rel = 'preload'; robot.as = 'fetch'; robot.crossOrigin = 'anonymous';
    robot.href = '/robot/companion.glb'; robot.fetchPriority = 'low';
    document.head.appendChild(robot);
    document.fonts?.load('italic 400 118px Newsreader').catch(() => {});
    const interval = window.setInterval(() => {
      setGreeting((current) => {
        if (current >= greetings.length - 2) {
          window.clearInterval(interval);
          return greetings.length - 1;
        }
        return current + 1;
      });
    }, 300);
    return () => {
      window.clearInterval(interval);
      robot.remove();
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
      <WelcomeGreetings greeting={greeting} onComplete={onComplete} />
      <span className="sr-only" aria-live="polite">{greetings[greeting].word}</span>
    </div>
  );
}

function ExperienceGallery() {
  return <ExperienceStack items={experiences} />;
}

function EducationScene({ kind }) {
  const grid = <path className="education-scene-grid" d="M0 65H520M0 145H520M0 225H520M80 0V320M200 0V320M340 0V320M460 0V320" />;
  return <svg className={`education-scene education-scene-${kind}`} viewBox="0 0 520 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {grid}
    {kind === 'engineering' && <>
      <path className="education-scene-line" d="M0 90H108V135H210L260 184H386V255H520M0 245H142V198H245L300 114H430V0" />
      <path className="education-scene-signal" d="M0 90H108V135H210L260 184H386V255H520" />
      <g className="education-scene-nodes"><circle cx="108" cy="90" r="5" /><circle cx="210" cy="135" r="5" /><circle cx="260" cy="184" r="5" /><circle cx="386" cy="255" r="5" /><circle cx="300" cy="114" r="5" /></g>
    </>}
    {kind === 'learning' && <>
      <g className="education-scene-line"><path d="M55 70L180 48L310 85L445 46M55 70L180 150L310 85L445 145M55 220L180 150L310 235L445 145M55 220L180 260L310 235L445 270M180 48L180 150L180 260M310 85L310 235" /></g>
      <path className="education-scene-signal" d="M55 70L180 150L310 85L445 145" />
      <g className="education-scene-nodes"><circle cx="55" cy="70" r="6" /><circle cx="55" cy="220" r="6" /><circle cx="180" cy="48" r="7" /><circle cx="180" cy="150" r="8" /><circle cx="180" cy="260" r="7" /><circle cx="310" cy="85" r="8" /><circle cx="310" cy="235" r="8" /><circle cx="445" cy="46" r="6" /><circle cx="445" cy="145" r="7" /><circle cx="445" cy="270" r="6" /></g>
    </>}
    {kind === 'analytics' && <>
      <g className="education-scene-bars"><path d="M85 265V225M145 265V202M205 265V210M265 265V162M325 265V175M385 265V118M445 265V80" /></g>
      <path className="education-scene-line" d="M70 216L145 202L205 210L265 162L325 175L385 118L445 80" />
      <path className="education-scene-signal" d="M70 216L145 202L205 210L265 162L325 175L385 118L445 80" />
      <g className="education-scene-nodes"><circle cx="145" cy="202" r="5" /><circle cx="265" cy="162" r="5" /><circle cx="385" cy="118" r="5" /><circle cx="445" cy="80" r="5" /></g>
    </>}
  </svg>;
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
  const root=useRef(null),avatar=useRef(null);
  const [away,setAway]=useState(false),[revealed,setRevealed]=useState(false);
  const awayRef=useRef(false),revealedRef=useRef(false),openedAt=useRef(0);
  revealedRef.current=revealed;
  const collapsed=away&&!revealed&&!menuOpen;

  useEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;const header=root.current,home=document.getElementById('home');if(!header||!home)return;
      const headerRect=header.getBoundingClientRect(),heroBottom=home.getBoundingClientRect().bottom;
      const next=heroBottom<headerRect.bottom+24+(awayRef.current?36:0);
      if(next!==awayRef.current){awayRef.current=next;setAway(next);setRevealed(false);}
      if(next&&revealedRef.current&&Math.abs(window.scrollY-openedAt.current)>64)setRevealed(false);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const measure=()=>{
      const header=root.current,icon=avatar.current?.querySelector('.brand-avatar');if(!header||!icon)return;
      const box=header.getBoundingClientRect();
      // Offset geometry stays stable while the avatar animates toward the screen edge.
      const left=avatar.current.offsetLeft+icon.offsetLeft+header.clientLeft;
      const top=avatar.current.offsetTop+icon.offsetTop+header.clientTop;
      const edge=parseFloat(getComputedStyle(header).getPropertyValue('--nav-edge-inset'))||8;
      const shift=Math.min(0,edge-box.left-left);
      header.style.setProperty('--nav-edge-x',shift+'px');
      header.style.setProperty('--nav-avatar-top',top+'px');
      header.style.setProperty('--nav-avatar-left',left+'px');
      header.style.setProperty('--nav-avatar-right',Math.max(0,box.width-left-icon.offsetWidth)+'px');
      header.style.setProperty('--nav-avatar-bottom',Math.max(0,box.height-top-icon.offsetHeight)+'px');
      header.querySelectorAll('.desktop-nav,.header-actions,.intro-robot-anchor').forEach(part=>{
        header.style.setProperty('--nav-gather-'+(part.classList.contains('desktop-nav')?'links':part.classList.contains('header-actions')?'actions':'robot'),(left+icon.offsetWidth/2-part.offsetLeft-part.offsetWidth/2)+'px');
      });
      schedule();
    };
    const resize=new ResizeObserver(measure);if(root.current)resize.observe(root.current);
    const heroChanges=new MutationObserver(schedule);const main=document.getElementById('main');if(main)heroChanges.observe(main,{childList:true});
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure);measure();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();heroChanges.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);};
  },[]);

  const previousCollapse=useRef(collapsed);
  useEffect(()=>{if(collapsed&&!previousCollapse.current)playNavbarCollapse();previousCollapse.current=collapsed;},[collapsed]);

  useEffect(()=>{
    if(!collapsed)return;
    if(root.current?.contains(document.activeElement)&&document.activeElement!==avatar.current)avatar.current?.focus({preventScroll:true});
  },[collapsed]);
  useEffect(()=>{
    if(!revealed)return undefined;
    const outside=event=>{if(!root.current?.contains(event.target)&&!event.target.closest('.intro-video-overlay'))setRevealed(false);};
    const escape=event=>{if(event.key==='Escape'&&!document.querySelector('.intro-video-overlay')){setRevealed(false);avatar.current?.focus({preventScroll:true});}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[revealed]);
  const toggleNavigation=()=>{
    if(away){openedAt.current=window.scrollY;setRevealed(value=>!value);}
    else document.getElementById('home')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };

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

  const close = () => { setMenuOpen(false);setRevealed(false); };
  const navTabs = [
    { title: 'About', icon: 'about', target: 'about' },
    { title: 'Education', icon: 'education', target: 'education' },
    { title: 'Experience', icon: 'experience', target: 'experience' },
    { title: 'Work', icon: 'work', target: 'work' },
    { title: 'Beyond CV', icon: 'beyond', target: 'beyond-cv' },
    { type: 'separator' },
    { title: 'Contact', icon: 'contact', target: 'contact' },
  ];
  const navigateTab = (_, tab) => {
    if (!tab) return;
    setRevealed(false);
    if(tab.target==='contact'){window.dispatchEvent(new Event(CONTACT_JOURNEY));return;}
    document.getElementById(tab.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header ref={root} className={`site-header nav-morph ${collapsed?'nav-collapsed':'nav-expanded'}`} data-nav-state={collapsed?'collapsed':'expanded'} data-hero-away={away ? 'true' : 'false'}>
        <span className="nav-morph-glass" aria-hidden="true" />
        <button ref={avatar} className="brand nav-profile-toggle" data-sound="silent" type="button" onClick={toggleNavigation} aria-label={away?(collapsed?'Open navigation':'Collapse navigation'):'Basit Bashir, home'} aria-expanded={!collapsed} aria-controls="portfolio-primary-navigation">
          <span className="brand-avatar"><img src="/portfolio_photo.webp" alt="" decoding="async" fetchPriority="high" /></span>
          <span className="brand-name" aria-hidden={collapsed}>Basit Bashir <small>AI · DATA · HEALTH</small></span>
        </button>
        <div id="portfolio-primary-navigation" className="desktop-nav" inert={collapsed}><ExpandableTabs tabs={navTabs} onChange={navigateTab} /></div>
        <div className="header-actions" inert={collapsed}>
          <a className="nav-cta" href="#contact" onClick={event=>{event.preventDefault();close();window.dispatchEvent(new Event(CONTACT_JOURNEY));}}>Let’s talk <Arrow /></a>
          <div className="header-switch-dock"><LampSwitch theme={theme} onToggle={onThemeToggle} /></div>
          <button className={`menu-button ${menuOpen ? 'open' : ''}`} type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation"><span /><span /></button>
        </div>
      </header>
      <nav id="mobile-navigation" className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
        {['about', 'education', 'experience', 'work', 'beyond-cv', 'contact'].map((item, index) => <a key={item} href={`#${item}`} onClick={event=>{close();if(item==='contact'){event.preventDefault();window.dispatchEvent(new Event(CONTACT_JOURNEY));}}}><span>0{index + 1}</span>{item === 'beyond-cv' ? 'Beyond CV' : item}</a>)}
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

function SectionHeading({ label, children, aside, effect }) {
  return (
    <header className="section-heading">
      <p className="section-label">{label}</p>
      <h2>{effect ? <SectionTextReveal>{children}</SectionTextReveal> : children}</h2>
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
      { duration: index < 3 ? 700 : 400, delay: index < 3 ? index * 180 : 540 + (index - 3) * 120, easing: 'ease-out', fill: 'both' },
    );
  });
}

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [michiganCertificateOpen, setMichiganCertificateOpen] = useState(false);
  const [googleCertificateOpen, setGoogleCertificateOpen] = useState(false);
  const [emailContactOpen, setEmailContactOpen] = useState(false);
  const [emailVisible, setEmailVisible] = useState(false);
  const [voiceOrigin, setVoiceOrigin] = useState(null);
  const voiceTrigger = useRef(null);
  const michiganLogo = useRef(null);
  const googleLogo = useRef(null);
  const emailTrigger = useRef(null);
  const contactSection = useRef(null);
  const emailVisibleRef = useRef(false);
  const lastVoicePress = useRef(null);
  const profileHintTimer = useRef(null);
  const welcomeSoundArmed = useRef(false);
  useInterfaceSounds();

  const revealEmail = () => {
    if (emailVisibleRef.current) return;
    emailVisibleRef.current = true;
    setEmailVisible(true);
    playEmailSound('reveal');
  };

  const hideEmail = () => {
    if (!emailVisibleRef.current || emailContactOpen || document.documentElement.dataset.contactJourney==='running' || contactSection.current?.contains(document.activeElement)) return;
    emailVisibleRef.current = false;
    setEmailVisible(false);
    stopEmailSound();
  };

  useEffect(() => {
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const section = contactSection.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) revealEmail();
    }, { threshold: .2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const openEmailContact = () => {
    if (emailContactOpen) return;
    stopWelcomeSound();
    playEmailSound('open');
    setEmailContactOpen(true);
  };

  const openVoiceNote = (event) => {
    if (voiceOpen) return;
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
    if (event.pointerType === 'touch') {
      event.currentTarget.classList.add('profile-hint-visible');
      window.clearTimeout(profileHintTimer.current);
      profileHintTimer.current = window.setTimeout(() => event.currentTarget.classList.remove('profile-hint-visible'), 1800);
    }
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
      requestWelcomeSound();
    }, 480);
  };

  useEffect(() => {
    document.body.classList.toggle('welcome-open', welcomeOpen);
    return () => document.body.classList.remove('welcome-open');
  }, [welcomeOpen]);

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

    let frame = 0, maxScroll = 0;
    const progress = document.querySelector('.scroll-progress span');
    const parallax = Array.from(document.querySelectorAll('.orbital-scene,.contact-orb'));
    // Root-level inherited variables invalidated the whole portfolio every scroll frame.
    // Keep the identical visual values on the few elements that actually use them.
    document.documentElement.style.removeProperty('--scroll');
    document.documentElement.style.removeProperty('--scroll-y');
    const updateScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const position = window.scrollY;
        if (progress) progress.style.transform = `scaleX(${maxScroll > 0 ? position / maxScroll : 0})`;
        parallax.forEach(node => {
          const rate = node.classList.contains('contact-orb') ? -.025 : .025;
          node.style.transform = `translateY(${position * rate}px)`;
        });
      });
    };
    const measureScroll = () => {
      maxScroll = document.documentElement.scrollHeight - innerHeight;
      updateScroll();
    };
    const scrollSize = new ResizeObserver(measureScroll);
    scrollSize.observe(document.body);
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', measureScroll);
    measureScroll();
    return () => {
      observer.disconnect();
      scrollSize.disconnect();
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', measureScroll);
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
      if (card.closest('.education')) {
        card.style.setProperty('--education-light-x', `${(x + .5) * 100}%`);
        card.style.setProperty('--education-light-y', `${(y + .5) * 100}%`);
      }
    };
    const reset = (event) => {
      event.currentTarget.style.setProperty('--tilt-x', '0deg');
      event.currentTarget.style.setProperty('--tilt-y', '0deg');
      if (event.currentTarget.closest('.education')) {
        event.currentTarget.style.removeProperty('--education-light-x');
        event.currentTarget.style.removeProperty('--education-light-y');
      }
    };
    cards.forEach((card) => { card.addEventListener('pointermove', move); card.addEventListener('pointerleave', reset); });
    return () => cards.forEach((card) => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', reset); });
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll('.education .degree-card, .education .credential');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('education-in-view', entry.isIntersecting));
    }, { rootMargin: '100px 0px' });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
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

        <HeroProfileTransition compact />

        <section className="section about" id="about">
          <div className="container">
            <SectionHeading index="01" label="Profile"><ProfileTagline /></SectionHeading>
            <div className="about-grid">
              <figure ref={voiceTrigger} className="about-profile-sketch reveal" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Basit Bashir portrait. Double-click or double-tap to open a voice note; press Enter to open with a keyboard." data-sound="silent" onDoubleClick={openVoiceNote} onPointerUp={handleVoicePress} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openVoiceNote(event); } }} onPointerMove={(event) => { if (event.pointerType !== 'mouse') return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--profile-tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -3}deg`); event.currentTarget.style.setProperty('--profile-tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 3}deg`); }} onPointerLeave={(event) => { event.currentTarget.style.setProperty('--profile-tilt-x', '0deg'); event.currentTarget.style.setProperty('--profile-tilt-y', '0deg'); }}>
                <div className="about-profile-portrait"><img src="/portfolio_photo.webp" alt="Basit Bashir" loading="lazy" decoding="async" /><span className="about-profile-hint" aria-hidden="true"><span className="profile-hint-desktop">Double-click to listen</span><span className="profile-hint-mobile">Double-tap to listen</span></span></div>
                <ProfileAnnotations />
              </figure>
              <div className="about-copy">
                <h3 className="profile-hello"><SectionTextReveal early>Hello.</SectionTextReveal><svg viewBox="0 0 400 22" fill="none" aria-hidden="true"><path d="M4 18C91 3 287 4 396 12" /></svg></h3>
                <p><SectionTextReveal early>I graduated with a <strong>Bachelor of Technology in Computer Science & Engineering</strong> from Government College of Engineering and Technology, Safapora Ganderbal, in the 2024 batch.</SectionTextReveal></p>
                <p><SectionTextReveal early>Technical internships at <strong>NIELIT Srinagar</strong> and <strong>Google</strong> sit alongside two years at <strong>Dar Medicate and Medical Agency</strong>. Experience with pharmaceutical products, prescription workflows, inventory and <strong>Marg ERP 9+</strong> now informs how I approach <strong>healthcare AI</strong>.</SectionTextReveal></p>
                <a className="underlink" href={profileLinks.pharmacy} target="_blank" rel="noreferrer">View the pharmacy location <Arrow /></a>
                <div className="about-focus"><div><span>Focus</span><strong>Data Science<br />Generative AI<br />Healthcare Informatics</strong></div><div><span>Core stack</span><strong>Python · LangChain<br />Scikit-Learn · Pandas<br />Streamlit · NumPy</strong></div></div>
              </div>
            </div>
            <ProfileSkillsLoop />
          </div>
        </section>

        <HeroProfileTransition compact direction="reverse" topic="education" />

        <LearningGallery skillGroups={skillGroups} michiganLogoRef={michiganLogo} googleLogoRef={googleLogo} onMichiganOpen={()=>setMichiganCertificateOpen(true)} onGoogleOpen={()=>setGoogleCertificateOpen(true)} />

        <HeroProfileTransition compact direction="forward" topic="experience" />

        <section className="section experience" id="experience">
          <div className="container">
            <SectionHeading index="02" label="Experience" effect="float">From operations to <em>models.</em></SectionHeading>
            <ExperienceGallery />
          </div>
        </section>

        <HeroProfileTransition compact direction="reverse" topic="work" />

        <SelectedWorkArchive projects={projects} githubUrl={profileLinks.github} />

        <HeroProfileTransition compact direction="forward" topic="beyond" />

        <BeyondCvSection />

        <section ref={contactSection} className="contact" id="contact" onPointerEnter={(event) => { if (event.pointerType === 'mouse') revealEmail(); }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') hideEmail(); }} onTouchStart={revealEmail} onFocusCapture={revealEmail}>
          <div className="contact-orb" aria-hidden="true" />
          <div className="container contact-grid">
            <div className="contact-copy"><p className="section-label">Contact</p><h2><SectionTextReveal>Let’s build something <em>useful.</em></SectionTextReveal></h2><p>If you’re working on retrieval systems, healthcare AI, predictive models, or a role where practical domain thinking matters, I’d like to hear about <span className="contact-signature-anchor">it.<svg className="contact-signature" viewBox="0 0 150 62" role="button" tabIndex={0} aria-label="Replay Basit signature" onClick={replaySignature} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); replaySignature(event); } }}><path d="M12 51 C18 35 25 17 31 8 C35 2 47 3 49 10 C52 18 41 23 29 27 C41 22 56 24 54 34 C52 43 37 49 17 49 C32 50 47 46 57 40" /><path d="M57 40 C61 35 66 32 69 35 C72 38 68 45 62 46 C57 46 58 40 62 36 M69 36 C66 43 68 47 75 42 C79 38 83 34 87 35 C91 37 85 41 79 43 C76 46 83 47 90 41" /><path d="M90 41 C93 37 96 33 98 32 C96 37 93 43 97 44 C101 44 104 40 107 37 C111 32 115 20 118 14 C120 10 121 15 118 22 C115 31 109 40 111 43 C114 47 121 41 129 35 C133 32 137 33 140 35" /><path d="M107 29 C115 27 122 26 128 27" /><path d="M100 26 L100.5 25" /><path d="M29 55 C63 56 100 53 137 52" /></svg></span></p></div>
            <div className="contact-links reveal">
              <div className={`contact-email-dock mailbox-dock${emailVisible ? ' is-visible' : ''}`}><button ref={emailTrigger} className="contact-email-trigger mailbox-trigger" type="button" aria-label="Email me" onClick={openEmailContact} data-sound="silent" aria-haspopup="dialog" tabIndex={0}><ContactMailbox/></button></div>
              <ContactGlassLink kind="linkedin" href={profileLinks.linkedin}><Arrow/></ContactGlassLink>
              <ContactGlassLink kind="github" href={profileLinks.github}><Arrow/></ContactGlassLink>
              <div className="contact-availability"><i /><span><strong>Open to opportunities</strong><small>Onsite & remote · Anantnag, India</small></span></div>
            </div>
          </div>

        </section>
      </main>

      <footer className="footer-light-bar"><FooterRibbons/><div className="container"><span>© {new Date().getFullYear()} Basit Bashir</span><span>Computer Science Engineer · AI, Data & Healthcare</span><a className="footer-return" href="#home" aria-label="Back to top"><span>Back to top</span><i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></i></a></div></footer>
      <ContactJourney onRevealEmail={revealEmail}/>
      {voiceOpen && <VoiceNoteOverlay origin={voiceOrigin} onClosed={() => { setVoiceOpen(false); requestAnimationFrame(() => voiceTrigger.current?.focus({ preventScroll: true })); }} />}
      {michiganCertificateOpen && <MichiganCertificateOverlay triggerRef={michiganLogo} onClosed={() => setMichiganCertificateOpen(false)} />}
      {googleCertificateOpen && <MichiganCertificateOverlay triggerRef={googleLogo} imageSrc="/certificates/google-digital-marketing.jpg" certificateLabel="The Fundamentals of Digital Marketing certificate" imageAlt="Google Digital Unlocked Fundamentals of Digital Marketing certificate awarded to Basit Bashir Maharaza" onClosed={() => setGoogleCertificateOpen(false)} />}
      {emailContactOpen && <EmailContactOverlay triggerRef={emailTrigger} onClosed={() => { setEmailContactOpen(false); if (contactSection.current?.matches(':hover')) revealEmail(); }} />}
    </>
  );
}

export default App;
