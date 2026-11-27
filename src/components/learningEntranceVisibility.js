// Use the same framing rule for starting and advancing the entrance timeline.
export function isLearningFramed(section){
 if(!section||document.hidden||document.body.classList.contains('welcome-open'))return false;
 const rect=section.getBoundingClientRect(),height=document.documentElement.clientHeight;
 const visible=Math.max(0,Math.min(rect.bottom,height)-Math.max(rect.top,0));
 return rect.top<=height*.16&&rect.bottom>=Math.min(height*.78,rect.height*.85)&&visible>=Math.min(rect.height,height)*.72;
}
