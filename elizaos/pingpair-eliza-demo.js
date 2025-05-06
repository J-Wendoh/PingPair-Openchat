#!/usr/bin/env node

/**
 * PingPair ElizaOS Integration Demo
 * 
 * This file demonstrates how the core concepts of ElizaOS would enhance PingPair bot.
 * It's a simplified mock-up of the real integration.
 */

const fs = require('fs');
const path = require('path');

// Load character data
const characterPath = path.join(__dirname, 'pingpair.character.json');
let character;

try {
  const characterData = fs.readFileSync(characterPath, 'utf8');
  character = JSON.parse(characterData);
  console.log(`Loaded character: ${character.name}\n`);
} catch (error) {
  console.error(`Error loading character data: ${error.message}`);
  character = {
    name: "PingPair",
    system: "Connect people globally through themed cultural exchange meetups"
  };
  console.log("Using default character data\n");
}

// Country database
const countries = {
  'Japan': {
    name: 'Japan',
    flag: '🇯🇵',
    facts: [
      'Island nation in East Asia',
      'Population of about 125 million',
      'Known for technological innovation and ancient traditions'
    ],
    traditions: [
      'Tea ceremonies (Chado)',
      'Cherry blossom (Sakura) viewing',
      'Traditional arts like origami and calligraphy'
    ]
  },
  'Kenya': {
    name: 'Kenya',
    flag: '🇰🇪',
    facts: [
      'East African nation known for wildlife and scenery',
      'Population of about 54 million',
      'Home to the Great Rift Valley and Lake Victoria'
    ]
  },
  'Brazil': {
    name: 'Brazil',
    flag: '🇧🇷',
    facts: [
      'Largest country in South America',
      'Population of about 213 million',
      'Home to a significant portion of the Amazon rainforest'
    ]
  }
};

// Simulate conversation and matching
console.log("=== PingPair ElizaOS Integration Demo ===\n");
console.log(`${character.name} is a bot that ${character.system.toLowerCase()}\n`);

console.log(`USER: "How does PingPair work?"`);
console.log(`\nPINGPAIR: "PingPair connects you with someone from a different part of the world twice a week! First, create your profile with \`/pingpair profile\` to tell me about your interests and timezone. When it's ping time, I'll match you with someone based on shared interests and different backgrounds, and send you both a video chat link. You earn Strix points for participating and completing meetups, especially with people from different continents. Use \`/pingpair stats\` to check your points and match history anytime!"`);

console.log("\n--- DEMONSTRATING ELIZA ACTIONS ---");

// Simulating the matchUsersAction
console.log("\n[Running MatchUsersAction]");

const countrySpotlight = 'Japan';
const country = countries[countrySpotlight];

console.log(`\n---- MATCH CREATED ----`);
console.log(`Country Spotlight: ${country.name} ${country.flag}`);
console.log(`\nFacts:`);
country.facts.forEach(fact => console.log(`- ${fact}`));

if (country.traditions) {
  console.log(`\nTraditions:`);
  country.traditions.forEach(tradition => console.log(`- ${tradition}`));
}

const meetingId = Math.random().toString(36).substring(2, 10);
console.log(`\nMeeting Link: https://meet.pingpair.app/${meetingId}`);
console.log(`--------------------\n`);

// Simulating ElizaOS providers
console.log("\n[Running Cultural Information Provider]");
console.log("\nUSER: \"Tell me more about Brazil\"");

const userMentionedCountry = 'Brazil';
const requestedCountry = countries[userMentionedCountry];

console.log("\nPINGPAIR: \"");
console.log(`Brazil ${requestedCountry.flag} is the largest country in South America with a population of about 213 million people. It's home to a significant portion of the Amazon rainforest, which is often called the "lungs of the Earth" because it produces about 20% of the world's oxygen.`);
console.log(`\nBrazil is famous for its vibrant culture, especially its annual Carnival celebrations, samba music and dance, and passion for soccer. The country is incredibly diverse, with influences from Indigenous peoples, Portuguese colonizers, African cultures brought through the slave trade, and various European and Asian immigrant groups.`);
console.log(`\nIf you're matched with someone from Brazil, ask them about their favorite local foods or festivals! What part of Brazil would you like to visit someday?\"`);

// Conclusion
console.log("\n\n=== ELIZA INTEGRATION BENEFITS ===");
console.log(`
1. Enhanced Conversations: More natural, context-aware responses
2. Improved Matching Algorithm: Better pairing based on interests and communication style
3. Cultural Knowledge Base: Richer information about countries and traditions
4. Personalized Experience: Adapts to each user's preferences and interests

To implement the full ElizaOS integration, follow the instructions at https://github.com/elizaOS/eliza
`);

console.log("\nDemonstration complete!"); 