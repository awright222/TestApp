const Papa = require('papaparse');

const QUESTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=771661310&single=true&output=csv';

console.log('Fetching case study questions data...');

fetch(QUESTIONS_URL)
  .then(r => r.text())
  .then(csv => {
    console.log('Raw CSV response (first 500 chars):', csv.substring(0, 500));
    
    const questionData = Papa.parse(csv, { header: true }).data;
    console.log('Parsed question data:');
    console.log('Total questions:', questionData.length);
    console.log('Column headers:', questionData.length > 0 ? Object.keys(questionData[0]) : []);
    
    // Filter for case study 1 (Northwind Traders)
    const caseStudy1Questions = questionData.filter(row => String(row.case_study_id).trim() === '1');
    console.log('Case Study 1 questions found:', caseStudy1Questions.length);
    
    if (caseStudy1Questions.length > 0) {
      console.log('First question data:', caseStudy1Questions[0]);
      console.log('First question choices:', caseStudy1Questions[0].choices);
    }
  })
  .catch(err => {
    console.error('Error fetching data:', err);
  });
