/**
 * PingPair ElizaOS Integration Demo
 * 
 * This script demonstrates the ElizaOS integration with PingPair bot.
 * It showcases the cultural provider, timezone provider, and match actions.
 */

const culturalProvider = require('./data/providers/cultural');
const timezoneProvider = require('./data/providers/timezone');
const createMatch = require('./data/actions/createMatch');
const scheduleSession = require('./data/actions/scheduleSession');

// Demo users
const user1 = {
  id: 'user1',
  name: 'Alex',
  country: 'US',
  timezone: 'EST',
  interests: ['technology', 'travel', 'music']
};

const user2 = {
  id: 'user2',
  name: 'Yuki',
  country: 'Japan',
  timezone: 'JST',
  interests: ['anime', 'technology', 'arts']
};

// Helper to print nicely formatted output
function printSection(title, data) {
  console.log('\n' + '='.repeat(80));
  console.log(`${title.toUpperCase()}`);
  console.log('='.repeat(80));
  
  if (typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
}

async function runDemo() {
  try {
    printSection('PingPair ElizaOS Integration Demo', 'Starting demo...');
    
    // Step 1: Get cultural information
    printSection('Cultural Information', {
      user1: culturalProvider.getCulturalInfo(user1.country),
      user2: culturalProvider.getCulturalInfo(user2.country)
    });
    
    // Step 2: Calculate cultural compatibility
    const culturalCompatibility = culturalProvider.calculateCompatibility(user1, user2);
    printSection('Cultural Compatibility', culturalCompatibility);
    
    // Step 3: Get timezone information
    printSection('Timezone Information', {
      user1: {
        timezone: user1.timezone,
        offset: timezoneProvider.getTimezoneOffset(user1.timezone)
      },
      user2: {
        timezone: user2.timezone,
        offset: timezoneProvider.getTimezoneOffset(user2.timezone)
      },
      hourDifference: timezoneProvider.getHourDifference(user1.timezone, user2.timezone)
    });
    
    // Step 4: Calculate working hours overlap
    const hoursOverlap = timezoneProvider.calculateWorkingHoursOverlap(user1, user2);
    printSection('Working Hours Overlap', {
      hoursOverlap,
      percentage: Math.round((hoursOverlap / 8) * 100) + '%'
    });
    
    // Step 5: Create a match
    const match = await createMatch(user1, user2);
    printSection('Match Created', match);
    
    // Step 6: Schedule a session
    const session = await scheduleSession(match, {
      user1: user1,
      user2: user2
    });
    printSection('Session Scheduled', session);
    
    // Step 7: Suggest conversation starters
    const conversationStarters = culturalProvider.suggestConversationStarters(user1, user2);
    printSection('Conversation Starters', conversationStarters);
    
    printSection('Demo Complete', 'ElizaOS integration functioning correctly');
    
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

runDemo(); 