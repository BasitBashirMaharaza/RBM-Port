import { useSyncExternalStore } from 'react';
const getSnapshot=()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const subscribe=notify=>{
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 preference.addEventListener('change',notify);
 return()=>preference.removeEventListener('change',notify);
};
export default function useHeroReducedMotion(){return useSyncExternalStore(subscribe,getSnapshot,()=>true);}
