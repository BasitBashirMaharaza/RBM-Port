// Shared with the navbar entrance and the guided Contact journey.
export default function ContactBirdMark({bodyClass,wingClass,eyeClass}){
 return <g className={bodyClass}>
  <path fill="currentColor" d="M3 10c2 1 3 1 5 0-1-4 2-7 5-6 1 .3 2 1 2.5 2L19 5l-2 3c0 5-3 10-9 11-3 .5-5-.4-7-2 3 .2 4-.4 5-1.3C3.8 15 2.6 13 3 10Z"/>
  <path className={wingClass} fill="currentColor" d="M10 12C6 10 4 6 4 3c4 1 7 4 8 7Z"/>
  <circle cx="13.1" cy="7.5" r=".65" className={eyeClass}/>
 </g>;
}
