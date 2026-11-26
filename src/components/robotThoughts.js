// Original portfolio thoughts, shared by the robot rather than attributed quotations.
export const robotThoughts=[
 'Big ideas. Tiny robot. Mildly questionable landings.',
 'Be kind to humans. Their software updates take longer.',
 'Curiosity is just debugging with better snacks.',
 'Small steps count. Especially when your legs are this short.',
 'Build things that help. Then remember to save.',
 'Some days you ship. Some days you reassemble.',
 'My confidence is wireless. My balance is still in beta.',
 'Better questions. Fewer mystery buttons.',
 'Take the scenic route. Your brain needs fresh air too.',
 'Plot twist: the bug was a learning opportunity.',
 'Good models learn. Good humans do too.',
 'Powered by curiosity. Occasionally interrupted by gravity.',
 'No giant leap required. A careful little hop will do.',
 'Care is a feature. Keep it in the build.'
];
export function nextRobotThought(previous){
 const choices=robotThoughts.filter(thought=>thought!==previous);
 return choices[Math.floor(Math.random()*choices.length)];
}
