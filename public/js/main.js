let natural = require('./natural');

var nounInflector = new natural.NounInflector();

console.log('');
console.log('Jaro-Winkler-Distance:');
console.log('---------------------------------------------');
console.log(natural.JaroWinklerDistance("Auto", "Auot"));
console.log(natural.JaroWinklerDistance('mySQL', 'SQL'));