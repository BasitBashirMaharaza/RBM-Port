import { useEffect, useRef, useState } from 'react';

const iconPaths = {
  about: <><circle cx="12" cy="8" r="3" /><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" /></>,
  experience: <><rect x="4" y="7" width="16" height="12" rx="2" /><path d="M9 7V5h6v2M4 12h16M10 12v2h4v-2" /></>,
  work: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  toolkit: <><path d="m14.7 6.3 3-3 3 3-3 3M13 8l-9 9v3h3l9-9" /><circle cx="7" cy="7" r="3" /></>,
  education: <><path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" /><path d="M6 10v5.5c3.7 2.4 8.3 2.4 12 0V10M21 8v7" /></>,
  contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
};

function TabIcon({ name }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</g></svg>;
}

export default function ExpandableTabs({ tabs, onChange }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const root = useRef(null);
  const active = hovered ?? selected;

  useEffect(() => {
    const outside = (event) => {
      if (root.current?.contains(event.target)) return;
      setSelected(null);
      onChange?.(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [onChange]);

  const select = (tab, index) => {
    setSelected(index);
    onChange?.(index, tab);
  };

  return (
    <nav className="expandable-tabs" ref={root} aria-label="Primary navigation" onPointerLeave={() => setHovered(null)}>
      {tabs.map((tab, index) => tab.type === 'separator' ? <i className="expandable-separator" aria-hidden="true" key={`separator-${index}`} /> : (
        <button className={`expandable-tab ${active === index ? 'is-selected' : ''}`} type="button" onClick={() => select(tab, index)} onPointerEnter={() => setHovered(index)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} aria-pressed={selected === index} aria-label={tab.title} key={tab.title} data-sound={`nav-${tab.title}`}>
          <TabIcon name={tab.icon} />
          <span><b>{tab.title}</b></span>
        </button>
      ))}
    </nav>
  );
}
