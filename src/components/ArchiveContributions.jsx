import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import contributions from './journal-contributions.json';
import ContributionSkyline from './ui/contribution-skyline';
import './archive-contributions.css';

export const archiveContributionPalette={light:['#d4dfbd','#a2bb78','#708e4b','#425d30'],dark:['#2d4025','#537436','#86a94d','#c1e590']};

export function ArchiveContributionSource({onCanvasDraw}){return <div className="wa-contribution-source wa-contribution-theme" aria-hidden="true" inert><ContributionSkyline data={contributions.days} endDate={contributions.updated} palette={archiveContributionPalette} showStats={false} showLegend={false} showToggle={false} footer={null} autoEnter onCanvasDraw={onCanvasDraw}/></div>;}


export default function ArchiveContributionOverlay({ trigger, onClosed }) {
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef(null);
  const closingRef = useRef(false);
  const timerRef = useRef(null);
  const [chartHeight,setChartHeight]=useState(240);
  const [compactLandscape,setCompactLandscape]=useState(()=>innerWidth>=701&&innerHeight<=500);
  useLayoutEffect(()=>{
    const dialog=dialogRef.current;
    const fit=()=>{
      const stage=dialog?.querySelector('[data-skyline-stage]');if(!stage)return;
      const viewport=window.visualViewport?.height||innerHeight;
      setCompactLandscape(innerWidth>=701&&viewport<=500);
      const padding=matchMedia('(max-width:700px)').matches?24:48;
      const chrome=dialog.scrollHeight-stage.offsetHeight;
      const available=Math.min(320,Math.max(60,Math.floor(viewport-padding-chrome-2)));
      setChartHeight(current=>Math.abs(current-available)>1?available:current);
    };
    const observer=new ResizeObserver(fit);observer.observe(dialog);
    const chart=dialog.querySelector('.contribution-skyline');if(chart)observer.observe(chart);
    window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);fit();
    return()=>{observer.disconnect();window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);};
  },[]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    timerRef.current = window.setTimeout(onClosed,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 200);
  };

  useEffect(() => {
    const root = document.getElementById('root');
    const previousInert = root?.inert;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    if (scrollbar > 0) {
      document.body.style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar) + 'px';
    }
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
      if (event.key === 'Tab') {
        const targets = [...dialogRef.current.querySelectorAll('button, a[href], [tabindex="0"]')];
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.clearTimeout(timerRef.current);
      document.removeEventListener('keydown', onKey, true);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div className={'archive-contribution-overlay' + (closing ? ' is-closing' : '')}
      onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section onKeyDown={(event) => event.stopPropagation()} ref={dialogRef} className="archive-contribution-window wa-contribution-theme" role="dialog"
        aria-modal="true" aria-labelledby="archive-contribution-title" tabIndex={-1}>
        <div className="archive-contribution-window-top">
          <div className="archive-contribution-heading"><span>GITHUB · BASIT BASHIR</span><h2 id="archive-contribution-title">Building in public.</h2></div>
          <button type="button" className="archive-contribution-close" aria-label="Close contributions" onClick={close}>×</button>
        </div>
        <ContributionSkyline data={contributions.days} endDate={contributions.updated} palette={archiveContributionPalette} compact compactCorners={compactLandscape} maxChartHeight={chartHeight} title={<span>{contributions.total} contributions</span>}/>
        <div className="archive-contribution-foot"><span>Public activity snapshot · Updated {contributions.updated}</span><a href={contributions.source} target="_blank" rel="noreferrer">View GitHub profile <span aria-hidden="true">↗</span></a></div>
      </section>
    </div>,
    document.body,
  );
}
