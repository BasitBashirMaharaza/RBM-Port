// Original portfolio thoughts, shared by the robot rather than attributed quotations.
export const robotThoughts=[
 'Build with data. Design with care.',
 'Better questions make better models.',
 'From practical experience to useful AI.',
 'Small experiments. Meaningful progress.',
 'Engineering begins with curiosity.',
 'Human context belongs in every model.',
 'Turn information into something useful.',
 'Learn by doing. Build with purpose.'
];
export function nextRobotThought(previous){
 const choices=robotThoughts.filter(thought=>thought!==previous);
 return choices[Math.floor(Math.random()*choices.length)];
}
