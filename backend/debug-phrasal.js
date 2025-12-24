const dataAnalytics = require('./services/dataAnalytics');

// Test specific sentences
const testSentences = [
  'The system is not working. I need to check the database and fix the problem.',
  'There is an error in the code. I will review it and make changes.',
  'The server stopped. I have to restart it and verify everything is OK.',
  'Our project has issues. I need to find the solution quickly.',
  'The application crashed. I must investigate and repair it.'
];

console.log('Testing phrasal verb detection:\n');

testSentences.forEach((sentence, i) => {
  const result = dataAnalytics.analyzePhrasalVerbUsage(sentence);
  console.log(`Sentence ${i + 1}:`);
  console.log(`   "${sentence}"`);
  console.log(`   Phrasal verbs found: ${result.phrasal_verbs_found.length > 0 ? result.phrasal_verbs_found.join(', ') : 'NONE'}`);
  console.log(`   Lacks phrasal verbs: ${result.lacks_phrasal_verbs}`);
  console.log('');
});
