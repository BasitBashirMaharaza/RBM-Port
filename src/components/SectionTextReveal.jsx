import { Children, cloneElement, isValidElement } from 'react';
import ScrollFloat from './ScrollFloat.jsx';
import './scroll-float-portfolio.css';

function plainText(nodes){
 return Children.toArray(nodes).map(node=>typeof node==='string'||typeof node==='number'?String(node):isValidElement(node)?node.type==='br'?'\n':plainText(node.props.children):'').join('');
}
// Keep emphasis and intentional line breaks while supplying the reference's exact targets.
function splitFormatted(nodes,words=false){
 return Children.map(nodes,node=>{
  if(typeof node==='string'||typeof node==='number'){
   return String(node).split(/(\s+)/u).map((word,index)=>/^\s*$/u.test(word)?word:<span className="scroll-float-word" key={index}>{words?word:Array.from(word).map((character,i)=><span className="scroll-float-char" key={i}>{character}</span>)}</span>);
  }
  if(isValidElement(node)&&typeof node.type==='string'&&node.type!=='br')return cloneElement(node,{},splitFormatted(node.props.children,words));
  return node;
 });
}
export default function SectionTextReveal({children,className='',early=false}){
 const parts=Children.toArray(children),plain=parts.every(part=>typeof part==='string'||typeof part==='number');
 const content=plainText(children),long=content.length>90;
 const count=long?content.trim().split(/\s+/u).length:Array.from(content).length;
 const stagger=Math.min(early ? .012 : .02,(early ? .12 : .22)/Math.max(1,count-1));
 return <ScrollFloat
  as="span"
  effect="float"
  splitBy={long?'words':'chars'}
  direction="up"
  order="start"
  fromColor="currentColor"
  animationDuration={early ? .6 : .8}
  ease="back.inOut(2)"
  scrollStart={early?'top bottom+=2%':'top bottom-=5%'}
  scrollEnd={early?'top bottom-=18%':'top bottom-=35%'}
  stagger={stagger}
  distance={120}
  stretch={2.3}
  smoothing={0}
  containerClassName={`section-text-reveal portfolio-scroll-float ${className}`}
  textClassName="portfolio-scroll-float-text"
 >{plain?parts.join(''):<><span className="scroll-float-sr">{plainText(children)}</span><span className="portfolio-scroll-float-rich" aria-hidden="true">{splitFormatted(children,long)}</span></>}</ScrollFloat>;
}
