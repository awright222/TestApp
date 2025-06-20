// Test drag and drop parsing logic
const parseDragDropData = (question) => {
  if (question.question_type?.toLowerCase() !== 'drag and drop') return null;
  
  const lines = question.choices.split('\n').filter(line => line.trim());
  const items = [];
  const zones = [];
  const correctMatches = {};
  
  let currentSection = '';
  
  lines.forEach(line => {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith('items:')) {
      currentSection = 'items';
      const itemsText = line.substring(line.indexOf(':') + 1);
      if (itemsText.trim()) {
        items.push(...itemsText.split(',').map(item => item.trim()).filter(item => item));
      }
    } else if (trimmed.startsWith('zones:')) {
      currentSection = 'zones';
      const zonesText = line.substring(line.indexOf(':') + 1);
      if (zonesText.trim()) {
        zones.push(...zonesText.split(',').map(zone => zone.trim()).filter(zone => zone));
      }
    } else if (trimmed.startsWith('correct matches:')) {
      currentSection = 'matches';
      const matchesText = line.substring(line.indexOf(':') + 1);
      if (matchesText.trim()) {
        matchesText.split(',').forEach(match => {
          const [item, zone] = match.split('->').map(s => s.trim());
          if (item && zone) {
            correctMatches[item] = zone;
          }
        });
      }
    } else if (currentSection === 'items' && line.trim()) {
      items.push(...line.split(',').map(item => item.trim()).filter(item => item));
    } else if (currentSection === 'zones' && line.trim()) {
      zones.push(...line.split(',').map(zone => zone.trim()).filter(zone => zone));
    } else if (currentSection === 'matches' && line.includes('->')) {
      line.split(',').forEach(match => {
        const [item, zone] = match.split('->').map(s => s.trim());
        if (item && zone) {
          correctMatches[item] = zone;
        }
      });
    }
  });
  
  return { items, zones, correctMatches };
};

// Test cases
const testCases = [
  {
    name: "Correct format",
    question: {
      question_type: "drag and drop",
      choices: `Items: item1, item2, item3
Zones: zone1, zone2, zone3
Correct matches: item1->zone1, item2->zone2, item3->zone3`
    }
  },
  {
    name: "Mixed case question type",
    question: {
      question_type: "Drag and Drop",
      choices: `Items: item1, item2, item3
Zones: zone1, zone2, zone3
Correct matches: item1->zone1, item2->zone2, item3->zone3`
    }
  },
  {
    name: "Items and zones on multiple lines",
    question: {
      question_type: "drag and drop",
      choices: `Items: item1, item2
item3, item4
Zones: zone1
zone2, zone3
Correct matches: item1->zone1, item2->zone2`
    }
  },
  {
    name: "Missing sections",
    question: {
      question_type: "drag and drop",
      choices: `Items: item1, item2, item3`
    }
  },
  {
    name: "Wrong question type",
    question: {
      question_type: "multiple choice",
      choices: `Items: item1, item2, item3
Zones: zone1, zone2, zone3`
    }
  }
];

console.log("Testing drag and drop parsing:");
console.log("================================");

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log("Input:", testCase.question);
  
  const result = parseDragDropData(testCase.question);
  console.log("Output:", result);
  
  if (result) {
    console.log("Items:", result.items);
    console.log("Zones:", result.zones);
    console.log("Correct matches:", result.correctMatches);
  }
});
