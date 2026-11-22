import { archiveMarks } from './workArchiveMarks.js';
export function ArchiveMark({index,className=''}){
 return <svg className={className} viewBox="0 0 34 34" fill="none" aria-hidden="true">{archiveMarks[index%archiveMarks.length].map((path,i)=><path key={i} d={path} stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>;
}
export function ArchiveFace({project,index}){
 return <div className="wa-flight-face"><div className="wa-flight-meta"><span>{project.number}</span><span>↗</span></div><h3>{project.title}</h3><ArchiveMark index={index}/><span className="wa-flight-eyebrow">{project.eyebrow}</span><span className="wa-flight-signature">BASIT BASHIR / SELECTED WORK</span></div>;
}
