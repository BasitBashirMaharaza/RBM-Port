// A short display-style reveal. The complete wording stays available to readers.
export default function RobotDisplayText({children}){
 return <span key={children} className="robot-display-text"><span className="sr-only">{children}</span><span aria-hidden="true">{children.split(' ').map((word,index)=><span key={index} className="robot-display-word" style={{'--word-index':index}}>{word}{' '}</span>)}</span></span>;
}
