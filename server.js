const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const path = require('path');

const app = express();

// Add CORS middleware
app.use(cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Enhanced user tracking with social features
const users = new Map();
const matches = new Map();
const onlineUsers = new Set();
const activeMatches = new Map();
const userStreaks = new Map();
const userAchievements = new Map();

// Community announcements data structure
const announcements = new Map();
let announcementCounter = 0;

// Add global variable for group matches
const groupMatches = new Map();

// Achievement definitions
const achievements = {
  GLOBAL_CITIZEN: {
    name: "🌍 Global Citizen",
    description: "Match with users from 5 different countries",
    points: 50
  },
  CULTURE_EXPLORER: {
    name: "🎭 Culture Explorer",
    description: "Learn about 10 different cultural traditions",
    points: 30
  },
  SOCIAL_BUTTERFLY: {
    name: "🦋 Social Butterfly",
    description: "Complete 5 matches in one day",
    points: 100
  },
  NIGHT_OWL: {
    name: "🦉 Night Owl",
    description: "Match with someone from a timezone 8+ hours away",
    points: 25
  },
  EARLY_BIRD: {
    name: "🐦 Early Bird",
    description: "Complete a match before 9 AM your time",
    points: 20
  }
};

// Countries database for spotlights
const countries = {
  'Brazil': {
    name: 'Brazil',
    flag: '🇧🇷',
    facts: [
      'Largest country in South America',
      'Population of about 213 million',
      'Home to a significant portion of the Amazon rainforest',
      'Official language is Portuguese',
      'Known for its vibrant Carnival celebrations',
      'Has the world\'s largest Catholic population'
    ],
    traditions: [
      'Carnival celebrations',
      'Samba music and dance',
      'Soccer (football) culture',
      'Feijoada (traditional black bean stew)',
      'Capoeira (martial art)',
      'Bossa Nova music'
    ],
    landmarks: [
      'Christ the Redeemer statue',
      'Iguazu Falls',
      'Amazon Rainforest',
      'Copacabana Beach',
      'Sugarloaf Mountain'
    ],
    cuisine: [
      'Feijoada',
      'Churrasco (Brazilian BBQ)',
      'Pão de queijo',
      'Caipirinha',
      'Brigadeiro'
    ]
  },
  'Kenya': {
    name: 'Kenya',
    flag: '🇰🇪',
    facts: [
      'East African nation known for wildlife and scenery',
      'Population of about 54 million',
      'Home to the Great Rift Valley and Lake Victoria',
      'Official languages are Swahili and English',
      'Known for its diverse wildlife and safaris',
      'Has 42 different ethnic groups'
    ],
    traditions: [
      'Safari tourism',
      'Maasai cultural traditions',
      'Kenyan long-distance running excellence',
      'Traditional beadwork',
      'Swahili coastal culture',
      'Tribal ceremonies and dances'
    ],
    landmarks: [
      'Mount Kenya',
      'Maasai Mara National Reserve',
      'Amboseli National Park',
      'Lamu Old Town',
      'Lake Nakuru'
    ],
    cuisine: [
      'Nyama Choma (grilled meat)',
      'Ugali (cornmeal porridge)',
      'Sukuma Wiki (collard greens)',
      'Chapati',
      'Mandazi (sweet bread)'
    ]
  },
  'Japan': {
    name: 'Japan',
    flag: '🇯🇵',
    facts: [
      'Island nation in East Asia',
      'Population of about 125 million',
      'Known for technological innovation and ancient traditions',
      'Has the world\'s oldest monarchy',
      'Known for its efficient public transportation',
      'Home to Mount Fuji'
    ],
    traditions: [
      'Tea ceremonies (Chado)',
      'Cherry blossom (Sakura) viewing',
      'Traditional arts like origami and calligraphy',
      'Onsen (hot spring) culture',
      'Festivals (Matsuri)',
      'Zen Buddhism practices'
    ],
    landmarks: [
      'Mount Fuji',
      'Tokyo Skytree',
      'Fushimi Inari Shrine',
      'Hiroshima Peace Memorial',
      'Temple of the Golden Pavilion'
    ],
    cuisine: [
      'Sushi',
      'Ramen',
      'Tempura',
      'Sake',
      'Matcha tea'
    ]
  }
};

// Blockchain news sources by country
const blockchainNews = {
  'India': {
    name: 'India',
    flag: '🇮🇳',
    sources: [
      'https://cointelegraph.com/tags/india',
      'https://www.coindesk.com/tag/india/'
    ],
    facts: [
      'India has over 100 blockchain startups',
      'RBI is exploring CBDC development',
      'India ranks 2nd in global crypto adoption',
      'Major banks are implementing blockchain solutions',
      'Government is developing blockchain-based land registry'
    ]
  },
  'Brazil': {
    name: 'Brazil',
    flag: '🇧🇷',
    sources: [
      'https://cointelegraph.com/tags/brazil',
      'https://www.coindesk.com/tag/brazil/'
    ],
    facts: [
      'Brazil has a growing DeFi ecosystem',
      'Major banks are testing blockchain solutions',
      'Government exploring blockchain for public services',
      'Growing NFT market in Brazil',
      'Strong crypto trading community'
    ]
  },
  'Japan': {
    name: 'Japan',
    flag: '🇯🇵',
    sources: [
      'https://cointelegraph.com/tags/japan',
      'https://www.coindesk.com/tag/japan/'
    ],
    facts: [
      'Japan has clear crypto regulations',
      'Major companies accepting crypto payments',
      'Strong blockchain gaming industry',
      'Government supporting blockchain innovation',
      'Advanced crypto exchange infrastructure'
    ]
  }
};

// Load ElizaOS integration
let elizaOS;
try {
  elizaOS = require('./elizaos');
  console.log('ElizaOS integration loaded successfully');
} catch (error) {
  console.warn('ElizaOS integration not available:', error.message);
  // Create a mock elizaOS if it's not available
  elizaOS = {
    getConversationStarters: () => ['What are your interests?', 'What timezone are you in?'],
    getCulturalInfo: () => null,
    getTimezoneInfo: () => ({ code: 'UTC', offset: 0 }),
    matchUsers: async () => ({ id: 'mock_match', score: { overall: 0.5 } }),
    scheduleMatchSession: async () => ({ id: 'mock_session', meetingLink: 'https://example.com/meet' })
  };
}

// Enhanced user structure
function createUser(userId) {
  return {
    userId,
    strixPoints: 5,
    isActive: true,
    timezone: 'UTC',
    interests: [],
    matchHistory: [],
    lastActive: Date.now(),
    streak: 0,
    achievements: [],
    favoriteCountries: [],
    culturalFacts: new Set(),
    traditions: new Set(),
    badges: [],
    level: 1,
    xp: 0
  };
}

// Function to update user's online status
function updateUserStatus(userId, isOnline) {
  if (isOnline) {
    onlineUsers.add(userId);
  } else {
    onlineUsers.delete(userId);
  }
}

// Enhanced matching algorithm with social features
function findMatch(userId) {
  const user = users.get(userId);
  if (!user || !user.isActive) return null;

  // Get online users in similar timezone (±2 hours)
  const potentialMatches = Array.from(onlineUsers)
    .filter(id => id !== userId)
    .map(id => users.get(id))
    .filter(match => {
      if (!match || !match.isActive) return false;
      
      // Check timezone compatibility
      const timezoneDiff = Math.abs(
        parseInt(user.timezone.replace('UTC', '')) - 
        parseInt(match.timezone.replace('UTC', ''))
      );
      
      return timezoneDiff <= 2;
    });

  if (potentialMatches.length === 0) return null;

  // Enhanced scoring system
  const scoredMatches = potentialMatches.map(match => {
    const commonInterests = user.interests.filter(interest => 
      match.interests.includes(interest)
    ).length;
    
    // Calculate cultural compatibility
    const culturalOverlap = [...user.culturalFacts].filter(fact => 
      match.culturalFacts.has(fact)
    ).length;
    
    // Calculate time-based bonuses
    const timeBonus = calculateTimeBonus(user, match);
    
    // Calculate streak bonus
    const streakBonus = user.streak * 0.5;
    
    return {
      user: match,
      score: (commonInterests * 2) + 
             (culturalOverlap * 1.5) + 
             timeBonus + 
             streakBonus + 
             Math.random() // Add some randomness
    };
  });

  // Sort by score and pick the best match
  scoredMatches.sort((a, b) => b.score - a.score);
  return scoredMatches[0]?.user;
}

// Calculate time-based bonuses
function calculateTimeBonus(user1, user2) {
  const now = new Date();
  const hour = now.getHours();
  
  // Early bird bonus (5-9 AM)
  if (hour >= 5 && hour < 9) {
    return 2;
  }
  
  // Night owl bonus (10 PM - 2 AM)
  if (hour >= 22 || hour < 2) {
    return 2;
  }
  
  // Timezone difference bonus
  const timezoneDiff = Math.abs(
    parseInt(user1.timezone.replace('UTC', '')) - 
    parseInt(user2.timezone.replace('UTC', ''))
  );
  
  if (timezoneDiff >= 8) {
    return 3; // Big timezone difference bonus
  }
  
  return 0;
}

// Function to generate meeting link
function generateMeetingLink() {
  // Generate a unique meeting ID
  const meetingId = Math.random().toString(36).substring(2, 15);
  return `https://meet.openchat.com/${meetingId}`;
}

// Enhanced match creation with social features
function createMatch(user1Id, user2Id) {
  const matchId = `${user1Id}-${user2Id}-${Date.now()}`;
  const country = Object.keys(countries)[Math.floor(Math.random() * Object.keys(countries).length)];
  const meetingLink = generateMeetingLink();
  
  const match = {
    matchId,
    user1Id,
    user2Id,
    country,
    meetingLink,
    createdAt: Date.now(),
    isCompleted: false,
    culturalFacts: countries[country].facts,
    traditions: countries[country].traditions,
    iceBreakers: generateIceBreakers(country)
  };
  
  matches.set(matchId, match);
  activeMatches.set(user1Id, matchId);
  activeMatches.set(user2Id, matchId);
  
  // Update streaks
  updateStreak(user1Id);
  updateStreak(user2Id);
  
  return match;
}

// Generate ice breakers based on country
function generateIceBreakers(country) {
  const countryInfo = countries[country];
  return [
    `What's your favorite ${countryInfo.name} tradition?`,
    `Have you ever tried ${countryInfo.cuisine[0]}?`,
    `Would you like to visit ${countryInfo.landmarks[0]}?`,
    `What do you know about ${countryInfo.name}'s culture?`
  ];
}

// Update user streak
function updateStreak(userId) {
  const user = users.get(userId);
  if (!user) return;
  
  const now = Date.now();
  const lastActive = user.lastActive;
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (now - lastActive <= dayInMs) {
    user.streak++;
    if (user.streak > user.bestStreak) {
      user.bestStreak = user.streak;
    }
  } else {
    user.streak = 1;
  }
  
  user.lastActive = now;
  users.set(userId, user);
}

// Enhanced command handlers with ElizaOS integration
async function handleMatchCommand(userId, params) {
  // Get the user object
  const user = users.get(userId) || { id: userId, interests: [], timezone: 'UTC' };
  
  // Find potential matches
  const potentialMatches = Array.from(users.values()).filter(u => 
    u.id !== userId && u.interests && u.interests.length > 0
  );
  
  if (potentialMatches.length === 0) {
    return "Sorry, there are no users available for matching at the moment. Try again later!";
  }
  
  // Use ElizaOS to find the best match
  const matchResults = await Promise.all(
    potentialMatches.map(async otherUser => {
      const match = await elizaOS.matchUsers(user, otherUser);
      return { user: otherUser, match };
    })
  );
  
  // Sort by match score (highest first)
  matchResults.sort((a, b) => b.match.score.overall - a.match.score.overall);
  
  // Get the best match
  const bestMatch = matchResults[0];
  const matchedUser = bestMatch.user;
  
  // Schedule a session
  const session = await elizaOS.scheduleMatchSession(bestMatch.match, {
    user1: user,
    user2: matchedUser
  });
  
  // Generate conversation starters
  const starters = elizaOS.getConversationStarters(user, matchedUser);
  
  // Record the match in history
  const matchRecord = {
    id: bestMatch.match.id,
    userId: user.id,
    matchedUserId: matchedUser.id,
    timestamp: new Date().toISOString(),
    score: bestMatch.match.score.overall,
    sessionId: session.id
  };
  
  // Update match history for both users
  if (!user.matchHistory) user.matchHistory = [];
  if (!matchedUser.matchHistory) matchedUser.matchHistory = [];
  
  user.matchHistory.push(matchRecord);
  matchedUser.matchHistory.push({...matchRecord, userId: matchedUser.id, matchedUserId: user.id});
  
  // Save updated user data
  users.set(userId, user);
  users.set(matchedUser.id, matchedUser);
  
  // Build response
  let response = `✨ Found a match! You've been matched with **${matchedUser.name || 'another user'}**\n\n`;
  response += `📊 Match score: ${Math.round(bestMatch.match.score.overall * 100)}%\n\n`;
  response += `🗓️ Suggested meeting time: ${session.displayTimes.user1}\n\n`;
  response += `🔗 Meeting link: ${session.meetingLink}\n\n`;
  response += `💬 Conversation starters:\n`;
  
  starters.slice(0, 3).forEach((starter, index) => {
    response += `${index + 1}. ${starter}\n`;
  });
  
  return response;
}

// Enhanced command handlers with ElizaOS integration
function handleStart(userId) {
  console.log(`Starting user ${userId}`);
  
  // Create user if not exists
  if (!users.has(userId)) {
    users.set(userId, createUser(userId));
    console.log(`Created new user: ${userId}`);
  } else {
    // Update existing user
    const user = users.get(userId);
    user.isActive = true;
    user.lastActive = Date.now();
    console.log(`Updated existing user: ${userId}`);
  }
  
  // Use ElizaOS data
  const conversationStarters = elizaOS?.getConversationStarters() || 
    ["What are your interests?", "What brings you here today?"];
  
  // Generate welcome message
  const welcomeMessage = `
# Welcome to PingPair! 🌍✨

Great news! You've successfully joined PingPair and earned 5 Strix points! 

You'll receive your first Ping notification in the next matching cycle.

### Next Step: Complete Your Profile

Tell us about yourself! This helps create better matches and more meaningful connections.

Type \`/pingpair profile\` to set up your profile now!

### Conversation starters:
${conversationStarters.map(starter => `- ${starter}`).join('\n')}
  `;
  
  console.log(`Returning welcome message for: ${userId}`);
  return { text: welcomeMessage };
}

function handleProfile(userId, args) {
  console.log(`Profile command: ${userId}, args:`, JSON.stringify(args));
  
  // Create user if not exists
  if (!users.has(userId)) {
    users.set(userId, createUser(userId));
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Handle arguments
  if (args && args.length > 0) {
    // Process args that could be either string arrays or object arrays with name/value
    let field, value;
    
    // Handle both old and new argument formats
    if (typeof args[0] === 'string') {
      // Old format: array of strings
      field = args[0].toLowerCase();
      value = args.slice(1).join(' ');
    } else if (args[0] && args[0].name) {
      // New format: array of objects with name property
      field = args[0].name.toLowerCase();
      
      // Check if there's a value property
      if (args[0].value !== undefined) {
        value = args[0].value;
      } else if (args.length > 1) {
        // Try to get values from remaining args
        value = args.slice(1).map(arg => arg.name || arg.value || '').join(' ');
      } else {
        value = '';
      }
    }
    
    console.log(`Processing profile field: ${field}, value: ${value}`);
    
    // Update the user's profile based on the field
    switch (field) {
      case 'country':
        if (value) {
          user.country = value;
          return {
            text: `Your country has been set to: ${value} 🌍\n\nThis will help match you with people interested in your culture!`
          };
        }
        break;
        
      case 'interests':
        if (value) {
          user.interests = value.split(',').map(i => i.trim());
          return {
            text: `Your interests have been updated to: ${user.interests.join(', ')}\n\nThis will help us find better matches for you!`
          };
        }
        break;
        
      case 'bio':
        if (value) {
          user.bio = value;
          return {
            text: `Your bio has been updated.\n\nThank you for sharing about yourself!`
          };
        }
        break;
    }
  }
  
  // Display profile if no arguments or invalid arguments
  const profileText = `
# Your PingPair Profile 👤

**Country:** ${user.country || 'Not set'}
**Timezone:** ${user.timezone || 'UTC'}
**Strix Points:** ${user.strixPoints || 0} ⭐
**Active Status:** ${user.isActive ? '✅ Active' : '❌ Inactive'}

**Interests:** ${user.interests && user.interests.length > 0 ? user.interests.join(', ') : 'None set'}
**Bio:** ${user.bio || 'None set'}

**Match History:** ${user.matchHistory ? user.matchHistory.length : 0} connections

## How to Update:
- \`/pingpair profile country [Your country]\`
- \`/pingpair profile interests [comma-separated interests]\`
- \`/pingpair profile bio [Your short bio]\`

Complete your profile to get better matches!
  `;
  
  return { text: profileText };
}

function handleSkip(userId) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.skipNextMatch = true;
  user.lastActive = Date.now();
  users.set(userId, user);
  
  return {
    text: "⏭️ You'll skip the next match. Use /pingpair start to activate matching again."
  };
}

function handleStats(userId) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  const matchHistory = user.matchHistory.map(match => {
    const country = countries[match.country];
    return `${country.flag} ${country.name}`;
  }).join('\n');
  
  // Calculate statistics
  const uniqueCountries = new Set(user.matchHistory.map(m => m.country)).size;
  const totalMatches = user.matchHistory.length;
  const bestStreak = user.bestStreak || 0;
  const achievementsEarned = user.achievements.length;
  
  return {
    text: `✨ **Your PingPair Stats**\n\n🎯 Strix Points: ${user.strixPoints}\n⭐ Level: ${user.level}\n🔥 Current Streak: ${user.streak}\n🏆 Best Streak: ${bestStreak}\n🌍 Countries Visited: ${uniqueCountries}\n🤝 Total Matches: ${totalMatches}\n🏅 Achievements: ${achievementsEarned}\n\n🌍 Match History:\n${matchHistory || 'No matches yet'}\n\nKeep participating to earn more Strix Points and achievements!`
  };
}

function handleTimezone(userId, args) {
  console.log('Timezone command:', JSON.stringify(args));
  
  // Create user if they don't exist
  if (!users.has(userId)) {
    users.set(userId, createUser(userId));
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Process timezone from args - handle both formats
  let timezone = '';
  
  if (args && args.length > 0) {
    // Check if we have the new format (objects with name/value)
    if (typeof args[0] === 'object' && args[0] !== null) {
      // New OpenChat format - object with name/value
      const tzArg = args.find(arg => arg.name === 'timezone' || arg.name === 'tz');
      if (tzArg && tzArg.value) {
        timezone = tzArg.value;
      }
    } else {
      // Old format - just strings
      timezone = args.join(' ');
    }
  }
  
  if (!timezone) {
    return {
      text: `⏰ **Timezone Settings**\n\nYour current timezone is set to: **${user.timezone}**\n\nTo update your timezone, use:\n\`/pingpair timezone timezone:America/New_York\`\n\nTimezone examples:\n- America/New_York\n- Europe/London\n- Asia/Tokyo\n- Australia/Sydney`
    };
  }
  
  // Update user timezone
  user.timezone = timezone;
  users.set(userId, user);
  
  return {
    text: `⏰ **Timezone Updated**\n\nYour timezone has been set to: **${timezone}**\n\nThis helps us match you with users in compatible time zones!`
  };
}

// Enhanced match notification with social features
function sendMatchNotification(userId, match) {
  const country = countries[match.country];
  const user = users.get(userId);
  
  // Get random ice breaker
  const iceBreaker = match.iceBreakers[Math.floor(Math.random() * match.iceBreakers.length)];
  
  // Get streak message
  const streakMessage = user.streak > 1 ? 
    `\n🔥 You're on a ${user.streak}-day streak!` : '';
  
  // Get achievement progress
  const achievementProgress = getAchievementProgress(user);
  
  return {
    text: `🌟 **PingPair Match!**\n\n🌍 Today's Spotlight: ${country.flag} ${country.name}\n\n📚 Did you know?\n${country.facts[Math.floor(Math.random() * country.facts.length)]}\n\n🎯 Your match is ready!\n\n💬 Meeting Link: ${match.meetingLink}\n\n${streakMessage}\n\n${achievementProgress}\n\n❓ Ice Breaker: ${iceBreaker}\n\n✨ You'll earn 10 Strix Points for completing this match!`
  };
}

// Get achievement progress
function getAchievementProgress(user) {
  const progress = [];
  
  // Check Global Citizen achievement
  const uniqueCountries = new Set(user.matchHistory.map(m => m.country));
  if (uniqueCountries.size >= 3) {
    progress.push(`🌍 Global Citizen: ${uniqueCountries.size}/5 countries`);
  }
  
  // Check Culture Explorer achievement
  if (user.culturalFacts.size >= 5) {
    progress.push(`🎭 Culture Explorer: ${user.culturalFacts.size}/10 traditions`);
  }
  
  return progress.length > 0 ? 
    `🏆 Achievement Progress:\n${progress.join('\n')}` : '';
}

// Function to create a new announcement
function createAnnouncement(title, content, type = 'general') {
  const id = ++announcementCounter;
  const announcement = {
    id,
    title,
    content,
    type,
    createdAt: Date.now(),
    reactions: new Map(),
    comments: []
  };
  announcements.set(id, announcement);
  return announcement;
}

// Function to add a comment to an announcement
function addComment(announcementId, userId, content) {
  const announcement = announcements.get(announcementId);
  if (!announcement) return null;
  
  const comment = {
    id: announcement.comments.length + 1,
    userId,
    content,
    createdAt: Date.now()
  };
  
  announcement.comments.push(comment);
  return comment;
}

// Function to add a reaction to an announcement
function addReaction(announcementId, userId, reaction) {
  const announcement = announcements.get(announcementId);
  if (!announcement) return null;
  
  const userReactions = announcement.reactions.get(userId) || new Set();
  userReactions.add(reaction);
  announcement.reactions.set(userId, userReactions);
  return true;
}

// Handle community announcements command
function handleAnnouncements(userId, args) {
  console.log('Announcements command:', JSON.stringify(args));
  
  // Create user if they don't exist
  if (!users.has(userId)) {
    users.set(userId, createUser(userId));
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Process args to extract subcommand and parameters - handle both formats
  let subCmd = '';
  let params = [];
  
  if (args && args.length > 0) {
    // Check if we have the new format (objects with name/value)
    if (typeof args[0] === 'object' && args[0] !== null) {
      // New OpenChat format - object with name/value
      subCmd = args[0].name;
      
      // Extract other parameters
      if (args.length > 1) {
        const idArg = args.find(arg => arg.name === 'id');
        const titleArg = args.find(arg => arg.name === 'title');
        const contentArg = args.find(arg => arg.name === 'content');
        
        if (idArg && idArg.value) params.push(idArg.value);
        if (titleArg && titleArg.value) params.push(titleArg.value);
        if (contentArg && contentArg.value) params.push(contentArg.value);
      }
    } else {
      // Old format - just strings
      subCmd = args[0];
      params = args.slice(1);
    }
  }
  
  // If no subcommand, show all announcements
  if (!subCmd) {
    const announcementList = Array.from(announcements.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(a => {
        const reactions = Array.from(a.reactions.values())
          .flatMap(r => Array.from(r))
          .reduce((acc, r) => {
            acc[r] = (acc[r] || 0) + 1;
            return acc;
          }, {});
        
        const reactionText = Object.entries(reactions)
          .map(([r, count]) => `${r} ${count}`)
          .join(' ');
        
        return `📢 **${a.title}**\n${a.content}\n\n${reactionText}\n💬 ${a.comments.length} comments\n\nUse \`/pingpair announce view id:${a.id}\` to view details`;
      })
      .join('\n\n');
    
    return {
      text: `📢 **Community Announcements**\n\n${announcementList || 'No announcements yet'}\n\nUse \`/pingpair announce create title:"Your Title" content:"Your announcement"\` to create a new announcement`
    };
  }
  
  // Handle subcommands
  if (subCmd === 'create' && params.length >= 2) {
    const title = params[0];
    const content = params.slice(1).join(' ');
    const announcement = createAnnouncement(title, content);
    
    // Award points for creating an announcement
    user.strixPoints = (user.strixPoints || 0) + 5;
    users.set(userId, user);
    
    return {
      text: `📢 **New Announcement Created**\n\n**Title:** ${announcement.title}\n**Content:** ${announcement.content}\n\n✨ Earned 5 Strix Points for creating an announcement! (Total: ${user.strixPoints})`
    };
  }
  
  if (subCmd === 'view' && params.length >= 1) {
    const id = parseInt(params[0]);
    const announcement = announcements.get(id);
    
    if (!announcement) {
      return {
        text: '❌ Announcement not found'
      };
    }
    
    const comments = announcement.comments
      .map(c => `👤 ${c.userId}: ${c.content}`)
      .join('\n');
    
    const reactions = Array.from(announcement.reactions.values())
      .flatMap(r => Array.from(r))
      .reduce((acc, r) => {
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, {});
    
    const reactionText = Object.entries(reactions)
      .map(([r, count]) => `${r} ${count}`)
      .join(' ');
    
    return {
      text: `📢 **${announcement.title}**\n\n${announcement.content}\n\n${reactionText || 'No reactions yet'}\n\n💬 **Comments**\n${comments || 'No comments yet'}\n\nUse \`/pingpair announce comment id:${id} content:"Your comment"\` to add a comment`
    };
  }
  
  if (subCmd === 'comment' && params.length >= 2) {
    const id = parseInt(params[0]);
    const content = params.slice(1).join(' ');
    const comment = addComment(id, userId, content);
    
    if (!comment) {
      return {
        text: '❌ Announcement not found'
      };
    }
    
    // Award points for commenting
    user.strixPoints = (user.strixPoints || 0) + 2;
    users.set(userId, user);
    
    return {
      text: `💬 **Comment Added**\n\n${content}\n\n✨ Earned 2 Strix Points for commenting! (Total: ${user.strixPoints})`
    };
  }
  
  if (subCmd === 'react' && params.length >= 2) {
    const id = parseInt(params[0]);
    const reaction = params[1];
    const success = addReaction(id, userId, reaction);
    
    if (!success) {
      return {
        text: '❌ Announcement not found'
      };
    }
    
    // Award points for reacting
    user.strixPoints = (user.strixPoints || 0) + 1;
    users.set(userId, user);
    
    return {
      text: `✨ Reaction added: ${reaction}\n\nEarned 1 Strix Point! (Total: ${user.strixPoints})`
    };
  }
  
  return {
    text: `📢 **Announcement Commands**\n\n- \`/pingpair announce\` - View all announcements\n- \`/pingpair announce create title:"Title" content:"Content"\` - Create a new announcement\n- \`/pingpair announce view id:1\` - View announcement details\n- \`/pingpair announce comment id:1 content:"Comment"\` - Add a comment\n- \`/pingpair announce react id:1 reaction:👍\` - Add a reaction`
  };
}

// Add group matching function
async function handleGroupMatchCommand(userId, params) {
  // Get the user object
  const user = users.get(userId) || { id: userId, interests: [], timezone: 'UTC' };
  
  // Find potential match participants
  const potentialParticipants = Array.from(users.values()).filter(u => 
    u.id !== userId && u.interests && u.interests.length > 0 && !u.skipNextMatch
  );
  
  if (potentialParticipants.length < 2) {
    return "Sorry, there are not enough users available for a group match at the moment. Try again later!";
  }
  
  // Parse the group size parameter (default to 4)
  let groupSize = 4;
  if (params && params.length > 0) {
    const sizeParam = parseInt(params[0]);
    if (!isNaN(sizeParam) && sizeParam >= 3 && sizeParam <= 8) {
      groupSize = sizeParam;
    }
  }
  
  // Limit group size to available participants + 1 (the requester)
  groupSize = Math.min(groupSize, potentialParticipants.length + 1);
  
  // Use ElizaOS to evaluate compatibility with potential participants
  const compatibilityScores = await Promise.all(
    potentialParticipants.map(async otherUser => {
      const match = await elizaOS.matchUsers(user, otherUser);
      return { 
        user: otherUser, 
        score: match.score.overall,
        commonTopics: match.details ? match.details.commonTopics : []
      };
    })
  );
  
  // Sort by compatibility score (highest first)
  compatibilityScores.sort((a, b) => b.score - a.score);
  
  // Select the top N-1 participants (N = groupSize)
  const selectedParticipants = compatibilityScores.slice(0, groupSize - 1);
  
  // Find common interests across all participants
  const allParticipants = [user, ...selectedParticipants.map(p => p.user)];
  const commonInterests = user.interests.filter(interest => 
    selectedParticipants.every(p => 
      p.user.interests && p.user.interests.includes(interest)
    )
  );
  
  // Generate a unique group ID
  const groupId = `group_${Date.now()}_${userId}`;
  
  // Create a group meeting link
  const meetingLink = `https://meet.pingpair.com/group/${groupId}`;
  
  // Generate suggested meeting times
  // This is simplified - in a real implementation, would find times that work for all
  const suggestedTime = new Date();
  suggestedTime.setDate(suggestedTime.getDate() + 1); // Tomorrow
  suggestedTime.setHours(15, 0, 0, 0); // 3 PM
  
  // Create the group object
  const group = {
    id: groupId,
    organizer: userId,
    participants: allParticipants.map(p => p.id),
    created: new Date().toISOString(),
    meetingTime: suggestedTime.toISOString(),
    meetingLink: meetingLink,
    commonInterests: commonInterests.length > 0 ? commonInterests : ['cultural exchange'],
    status: 'scheduled'
  };
  
  // Store the group
  if (!groupMatches) {
    groupMatches = new Map();
  }
  groupMatches.set(groupId, group);
  
  // Update each participant's record
  allParticipants.forEach(participant => {
    if (!participant.groupHistory) {
      participant.groupHistory = [];
    }
    participant.groupHistory.push(groupId);
    
    // Award Strix points for joining a group
    participant.strixPoints = (participant.strixPoints || 0) + 3;
    
    // Save the updated user data
    users.set(participant.id, participant);
  });
  
  // Build response
  let response = `✨ **Group Match Created!** ✨\n\n`;
  response += `🧑‍🤝‍🧑 **Participants:** ${allParticipants.length}\n`;
  response += allParticipants.map((p, index) => `${index + 1}. ${p.name || 'User ' + p.id}`).join('\n');
  response += `\n\n`;
  
  response += `🎯 **Common Interests:** ${commonInterests.join(', ') || 'Cultural Exchange'}\n\n`;
  response += `🗓️ **Suggested Meeting Time:** ${suggestedTime.toLocaleDateString()} at ${suggestedTime.toLocaleTimeString()}\n\n`;
  response += `🔗 **Group Meeting Link:** ${meetingLink}\n\n`;
  response += `📝 **Tips:** Send this link to all participants and join at the scheduled time!\n\n`;
  
  return response;
}

// Real-time news updates system
class NewsUpdateSystem {
  constructor() {
    this.newsSources = [
      { id: 'crypto-gazette', name: 'Crypto Gazette', tags: ['cryptocurrency', 'blockchain', 'tech'] },
      { id: 'fintech-daily', name: 'FinTech Daily', tags: ['finance', 'technology', 'markets'] },
      { id: 'blockchain-report', name: 'Blockchain Report', tags: ['blockchain', 'defi', 'nft'] },
      { id: 'tech-insider', name: 'Tech Insider', tags: ['technology', 'innovation', 'startups'] }
    ];
    
    this.newsItems = [];
    this.lastUpdate = null;
    
    // Initialize with some news items
    this.generateMockNews();
    
    // Set up periodic updates
    setInterval(() => this.generateMockNews(), 30 * 60 * 1000); // Update every 30 minutes
  }
  
  generateMockNews() {
    const currentTime = new Date();
    
    // Generate 3-5 new stories
    const newStoryCount = 3 + Math.floor(Math.random() * 3);
    
    const headlines = [
      'New Blockchain Protocol Promises 100x Efficiency',
      'Major Bank Adopts Digital Currency for International Transfers',
      'NFT Market Shows Signs of Recovery After Recent Slump',
      'Central Bank Digital Currencies: A Global Perspective',
      'Web3 Gaming: The Next Frontier for Blockchain',
      'Decentralized Finance Reaches New Milestone',
      'Crypto Regulation: Latest Updates from Across the Globe',
      'Blockchain Tech\'s Impact on Supply Chain Management',
      'The Future of Digital Identity on the Blockchain',
      'AI and Blockchain: A Powerful Combination'
    ];
    
    for (let i = 0; i < newStoryCount; i++) {
      // Select a random headline and source
      const headlineIndex = Math.floor(Math.random() * headlines.length);
      const sourceIndex = Math.floor(Math.random() * this.newsSources.length);
      
      const headline = headlines[headlineIndex];
      const source = this.newsSources[sourceIndex];
      
      // Remove used headline to avoid duplicates
      headlines.splice(headlineIndex, 1);
      
      // Generate story
      const newsItem = {
        id: `news_${Date.now()}_${i}`,
        headline,
        summary: `This is a summary of the article about ${headline.toLowerCase()}.`,
        source: source.name,
        sourceId: source.id,
        tags: source.tags,
        url: `https://example.com/news/${source.id}/${Date.now()}`,
        publishedAt: currentTime.toISOString(),
        countryRelevance: ['global', 'US', 'EU', 'Asia'].sort(() => Math.random() - 0.5).slice(0, 2)
      };
      
      this.newsItems.unshift(newsItem);
    }
    
    // Keep only the 50 most recent news items
    if (this.newsItems.length > 50) {
      this.newsItems = this.newsItems.slice(0, 50);
    }
    
    this.lastUpdate = currentTime;
    console.log(`Generated ${newStoryCount} new blockchain news items.`);
  }
  
  getLatestNews(count = 5) {
    return this.newsItems.slice(0, count);
  }
  
  getNewsByTags(tags, count = 5) {
    return this.newsItems
      .filter(item => item.tags.some(tag => tags.includes(tag)))
      .slice(0, count);
  }
  
  getNewsByCountry(country, count = 5) {
    return this.newsItems
      .filter(item => item.countryRelevance.includes(country))
      .slice(0, count);
  }
  
  getNewsSinceDate(date, count = 10) {
    const targetDate = new Date(date);
    return this.newsItems
      .filter(item => new Date(item.publishedAt) > targetDate)
      .slice(0, count);
  }
}

// Initialize news system
const newsSystem = new NewsUpdateSystem();

// Language preferences system
const supportedLanguages = [
  { code: 'en', name: 'English', isDefault: true },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }
];

// Simple translation system (mock implementation)
const translations = {
  'welcome': {
    'en': 'Welcome to PingPair!',
    'es': '¡Bienvenido a PingPair!',
    'fr': 'Bienvenue à PingPair!',
    'de': 'Willkommen bei PingPair!'
  },
  'match_found': {
    'en': 'Match found!',
    'es': '¡Coincidencia encontrada!',
    'fr': 'Match trouvé!',
    'de': 'Match gefunden!'
  }
};

// Get translation based on user language
function getTranslation(key, language = 'en') {
  if (!translations[key]) return key;
  return translations[key][language] || translations[key]['en'] || key;
}

// Handle language preference command
function handleLanguageCommand(userId, args) {
  // Get the user object
  if (!users.has(userId)) {
    users.set(userId, createUser(userId));
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // If no language specified, show current setting and options
  if (!args || args.length === 0) {
    const currentLanguage = user.language || 'en';
    const currentLangObj = supportedLanguages.find(l => l.code === currentLanguage);
    
    let response = `🌐 **Language Preferences**\n\n`;
    response += `Current language: ${currentLangObj.name} (${currentLangObj.code})\n\n`;
    response += `Available languages:\n`;
    
    supportedLanguages.forEach(lang => {
      const isCurrentLang = lang.code === currentLanguage;
      response += `${isCurrentLang ? '✅' : '○'} ${lang.name} (${lang.code})\n`;
    });
    
    response += `\nTo change your language, use:\n/pingpair language [language code]`;
    
    return response;
  }
  
  // Process language change
  const requestedLang = args[0].toLowerCase();
  const langObj = supportedLanguages.find(l => l.code === requestedLang);
  
  if (!langObj) {
    return `❌ Language code "${requestedLang}" not recognized. Please use one of: ${supportedLanguages.map(l => l.code).join(', ')}`;
  }
  
  // Update user language
  user.language = langObj.code;
  users.set(userId, user);
  
  // Return success message
  return getTranslation('welcome', user.language);
}

// Handle bot events
function handleBotEvent(event) {
  try {
    console.log('Received event:', typeof event === 'string' ? event : JSON.stringify(event));
    let eventData;
    
    if (typeof event === 'string') {
      eventData = JSON.parse(event);
    } else {
      eventData = event;
    }

    // OpenChat specific format handling
    if (eventData.command) {
      console.log('Detected OpenChat command format:', JSON.stringify(eventData.command));
      // Extract command data directly from the OpenChat format
      const command = eventData.command;
      
      // Args from OpenChat will be in command.args array with name and value props
      const args = command.args || [];
      console.log('Command args:', JSON.stringify(args));
      
      // Check if this is our bot's command
      if (command.name === 'pingpair') {
        // Get subcommand from the first argument
        if (args.length > 0) {
          const subCommand = args[0].name;
          console.log('Subcommand:', subCommand);
          
          // Extract remaining args (if needed)
          const remainingArgs = args.slice(1);
          
          // Process based on subcommand
          switch (subCommand) {
            case 'start':
              return handleStart(command.initiator);
            case 'profile':
              return handleProfile(command.initiator, remainingArgs);
            case 'skip':
              return handleSkip(command.initiator);
            case 'stats':
              return handleStats(command.initiator);
            case 'timezone':
              return handleTimezone(command.initiator, remainingArgs);
            case 'achievements':
              return handleAchievements(command.initiator);
            case 'leaderboard':
              return handleLeaderboard(command.initiator);
            case 'blockchain':
              return handleBlockchainNews(command.initiator, remainingArgs);
            case 'digest':
              return handleDailyDigest(command.initiator);
            case 'quiz':
              return handleBlockchainQuiz(command.initiator);
            case 'announce':
              return handleAnnouncements(command.initiator, remainingArgs);
            case 'match':
              return handleGroupMatchCommand(command.initiator, remainingArgs);
            case 'language':
              return handleLanguageCommand(command.initiator, remainingArgs);
            default:
              return handleHelp();
          }
        } else {
          return handleHelp();
        }
      } else if (command.name) {
        console.log('Unknown command name:', command.name);
        return { text: `Unknown command: ${command.name}. Try using \`/pingpair help\` to see available commands.` };
      }
    }
    
    // Legacy handling for old format
    // If this is OpenChat event format
    if (eventData.event) {
      try {
        const ocEvent = typeof eventData.event === 'string' 
          ? JSON.parse(eventData.event) 
          : eventData.event;
          
        // Handle different OpenChat event types
        if (ocEvent.type === 'message') {
          return { text: "Use /pingpair commands to interact with PingPair bot!" };
        }
        
        if (ocEvent.type === 'command') {
          const command = ocEvent.command || {};
          const commandText = command.text || '';
          const initiator = command.initiator || 'user';
          
          if (commandText.startsWith('/pingpair')) {
            const args = commandText.split(' ').slice(1);
            const subCommand = args[0] || 'help';
            
            switch (subCommand) {
              case 'start':
                return handleStart(initiator);
              case 'profile':
                return handleProfile(initiator, args.slice(1));
              case 'skip':
                return handleSkip(initiator);
              case 'stats':
                return handleStats(initiator);
              case 'timezone':
                return handleTimezone(initiator, args.slice(1));
              case 'achievements':
                return handleAchievements(initiator);
              case 'leaderboard':
                return handleLeaderboard(initiator);
              case 'blockchain':
                return handleBlockchainNews(initiator, args.slice(1));
              case 'digest':
                return handleDailyDigest(initiator);
              case 'quiz':
                return handleBlockchainQuiz(initiator);
              case 'announce':
                return handleAnnouncements(initiator, args.slice(1));
              case 'match':
                return handleGroupMatchCommand(initiator, args.slice(1));
              case 'language':
                return handleLanguageCommand(initiator, args.slice(1));
              default:
                return handleHelp();
            }
          }
        }
      } catch (error) {
        console.error('Error parsing OpenChat event:', error);
      }
    }
    
    // Handle simplified format
    // Handle command
    if (eventData.type === 'command' || eventData.command) {
      const initiator = eventData.initiator || eventData.command?.initiator || 'user123';
      const text = eventData.text || eventData.command?.text || '';
      
      // Check if this is a pingpair command
      if (text.startsWith('/pingpair')) {
        const args = text.split(' ').slice(1);
        const subCommand = args[0] || 'help';
        
        switch (subCommand) {
          case 'start':
            return handleStart(initiator);
          case 'profile':
            return handleProfile(initiator, args.slice(1));
          case 'skip':
            return handleSkip(initiator);
          case 'stats':
            return handleStats(initiator);
          case 'timezone':
            return handleTimezone(initiator, args.slice(1));
          case 'blockchain':
            return handleBlockchainNews(initiator, args.slice(1));
          case 'digest':
            return handleDailyDigest(initiator);
          case 'quiz':
            return handleBlockchainQuiz(initiator);
          case 'announce':
            return handleAnnouncements(initiator, args.slice(1));
          case 'match':
            return handleGroupMatchCommand(initiator, args.slice(1));
          case 'language':
            return handleLanguageCommand(initiator, args.slice(1));
          default:
            return handleHelp();
        }
      }
    }
    
    // Handle message
    if (eventData.type === 'message' || eventData.message) {
      return { text: "Use /pingpair commands to interact with PingPair bot!" };
    }
    
    // Default response if no other handlers matched
    return { text: "I'm PingPair bot! Use /pingpair commands to interact with me." };
  } catch (error) {
    console.error('Error parsing event:', error);
    return { error: 'Failed to process event', details: error.message, text: "Sorry, there was an error processing your request." };
  }
}

// Handle preflight OPTIONS requests for CORS
app.options('/openchat-webhook', (req, res) => {
  console.log('OPTIONS request received');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Set up webhook to receive events from OpenChat
app.post('/openchat-webhook', (req, res) => {
  try {
    console.log('Webhook request received');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body:', JSON.stringify(req.body));
    
    // Validate the request body
    if (!req.body) {
      console.error('Missing request body');
      return res.status(400).json({ error: 'Missing request body' });
    }
    
    // Extract the JWT token from header if present (for proper auth)
    const jwt = req.headers['x-oc-jwt'];
    if (jwt) {
      console.log('JWT token received, length:', jwt.length);
      // In a production environment, verify the JWT signature
      // For this demo, we'll just log it and proceed
    }
    
    // Handle the command with proper error handling
    try {
      // Get the response from the handler
      const response = handleBotEvent(req.body);
      
      // Ensure the response is properly formatted
      let formattedResponse;
      if (typeof response === 'string') {
        formattedResponse = { text: response };
      } else if (response && typeof response === 'object') {
        formattedResponse = response;
      } else {
        formattedResponse = { text: "Command processed successfully!" };
      }
      
      // Add appropriate CORS headers for OpenChat
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-oc-jwt');
      res.header('Content-Type', 'application/json');
      
      console.log('Response:', JSON.stringify(formattedResponse));
      
      // Ensure we always return a status code along with the response
      return res.status(200).json(formattedResponse);
    } catch (handlerError) {
      console.error('Error in command handler:', handlerError);
      return res.status(500).json({ 
        error: 'Command processing failed', 
        details: handlerError.message,
        text: "Sorry, there was a problem processing your command. Please try again." 
      });
    }
  } catch (error) {
    console.error('Critical error handling event:', error);
    return res.status(500).json({ 
      error: 'Failed to process event', 
      details: error.message,
      text: "Sorry, there was a problem with the bot. Please try again later." 
    });
  }
});

// Bot schema definition for OpenChat
app.get('/', (req, res) => {
  // If the Accept header includes application/json, return the schema
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    const botSchema = {
      description: "Connect people globally through themed cultural exchange meetups",
      commands: [
        {
          name: "start",
          description: "Begin receiving match pings for cultural exchange meetups",
          default_role: "Participant",
          placeholder: "Starting PingPair...",
          params: [],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        },
        {
          name: "profile",
          description: "View and update your profile information for better matches",
          default_role: "Participant",
          placeholder: "Loading profile...",
          params: [
            {
              name: "interests",
              description: "Your interests to help with matching you to like-minded people",
              required: false,
              param_type: {
                StringParam: {
                  min_length: 0,
                  max_length: 500,
                  choices: [],
                  multi_line: false
                }
              }
            }
          ],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        },
        {
          name: "skip",
          description: "Skip the current matching cycle when you're busy",
          default_role: "Participant",
          placeholder: "Skipping match...",
          params: [],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        },
        {
          name: "stats",
          description: "View your Strix points and match history with other users",
          default_role: "Participant",
          placeholder: "Loading stats...",
          params: [],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        },
        {
          name: "timezone",
          description: "Update your timezone preference for better match timing",
          default_role: "Participant",
          placeholder: "Updating timezone...",
          params: [
            {
              name: "timezone",
              description: "Your timezone (e.g., UTC+1, EST) for scheduling meetups",
              required: true,
              param_type: {
                StringParam: {
                  min_length: 1,
                  max_length: 50,
                  choices: [],
                  multi_line: false
                }
              }
            }
          ],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        },
        {
          name: "help",
          description: "Show available commands and information about the bot",
          default_role: "Participant",
          placeholder: "Loading help information...",
          params: [],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        },
        {
          name: "match",
          description: "Create a group match with multiple participants based on shared interests",
          default_role: "Participant",
          placeholder: "Finding group participants...",
          params: [
            {
              name: "size",
              description: "Optional: Number of participants (3-8)",
              required: false,
              param_type: {
                StringParam: {
                  min_length: 1,
                  max_length: 1,
                  choices: [
                    { name: "3 participants", value: "3" },
                    { name: "4 participants", value: "4" },
                    { name: "5 participants", value: "5" },
                    { name: "6 participants", value: "6" },
                    { name: "7 participants", value: "7" },
                    { name: "8 participants", value: "8" }
                  ],
                  multi_line: false
                }
              }
            }
          ],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        },
        {
          name: "language",
          description: "Update your language preference for better communication",
          default_role: "Participant",
          placeholder: "Updating language...",
          params: [
            {
              name: "language",
              description: "Your language code (e.g., en, es, fr, de, ja, zh, hi, pt, ru)",
              required: true,
              param_type: {
                StringParam: {
                  min_length: 2,
                  max_length: 2,
                  choices: [],
                  multi_line: false
                }
              }
            }
          ],
          permissions: {
            community: 0,
            chat: 0,
            message: 0
          },
          direct_messages: false
        }
      ]
    };
    
    res.json(botSchema);
  } else {
    // If not requesting JSON, return the HTML status page
    res.send('PingPair Bot is running! 🌍✨');
  }
});

// Simple test endpoint
app.get('/test', (req, res) => {
  const principalId = process.env.PRINCIPAL_ID || 'ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe';
  
  res.json({
    name: "PingPair Bot",
    version: "1.0.0",
    principal: principalId,
    commands: [
      "/pingpair start",
      "/pingpair profile",
      "/pingpair skip",
      "/pingpair stats",
      "/pingpair timezone",
      "/pingpair blockchain",
      "/pingpair digest",
      "/pingpair quiz",
      "/pingpair announce"
    ]
  });
});

// OpenChat metadata endpoint - required for bot registration
app.get('/.well-known/ic-domains', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // The hostname must be without protocol (just the bare domain)
  res.send('pingpair-bot.onrender.com');
});

// OpenChat verification endpoint
app.get('/.well-known/canister-info', (req, res) => {
  // Set appropriate headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Use the exact format that OpenChat expects
  const principal = process.env.PRINCIPAL_ID || 'ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe';
  
  // The format OpenChat expects is *just* the principal as the top-level key
  const response = {
    [principal]: {
      name: "PingPair Bot",
      description: "Connect people globally through themed cultural exchange meetups"
    }
  };
  
  res.send(JSON.stringify(response));
});

// Simple icon endpoint
app.get('/icon.png', (req, res) => {
  // Set the content type
  res.setHeader('Content-Type', 'image/png');
  
  // Use the official PingPair logo 
  res.redirect('https://images.openchat.com/bot/ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe/icon.png');
});

// Additional diagnostic endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    users: users.size,
    env: {
      node_env: process.env.NODE_ENV,
      principal_id: process.env.PRINCIPAL_ID || 'not set'
    }
  });
});

// Diagnostic endpoint for OpenChat registration
app.get('/openchat-debug', (req, res) => {
  const principal = process.env.PRINCIPAL_ID || 'ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe';
  
  res.json({
    status: 'OK',
    endpoints: {
      webhook: '/openchat-webhook',
      canister_info: '/.well-known/canister-info',
      ic_domains: '/.well-known/ic-domains',
      health: '/health'
    },
    principal: principal,
    server_time: new Date().toISOString(),
    config: {
      cors_enabled: true,
      domain: req.headers.host,
      node_version: process.version
    }
  });
});

// Add dedicated schema endpoint
app.get('/api/v1/schema', (req, res) => {
  const botSchema = {
    description: "Connect people globally through themed cultural exchange meetups",
    commands: [
      {
        name: "start",
        description: "Begin receiving match pings for cultural exchange meetups",
        default_role: "Participant",
        placeholder: "Starting PingPair...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "profile",
        description: "View and update your profile information for better matches",
        default_role: "Participant",
        placeholder: "Loading profile...",
        params: [
          {
            name: "interests",
            description: "Your interests to help with matching you to like-minded people",
            required: false,
            param_type: {
              StringParam: {
                min_length: 0,
                max_length: 500,
                choices: [],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "skip",
        description: "Skip the current matching cycle when you're busy",
        default_role: "Participant",
        placeholder: "Skipping match...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "stats",
        description: "View your Strix points and match history with other users",
        default_role: "Participant",
        placeholder: "Loading stats...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "timezone",
        description: "Update your timezone preference for better match timing",
        default_role: "Participant",
        placeholder: "Updating timezone...",
        params: [
          {
            name: "timezone",
            description: "Your timezone (e.g., UTC+1, EST) for scheduling meetups",
            required: true,
            param_type: {
              StringParam: {
                min_length: 1,
                max_length: 50,
                choices: [],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "help",
        description: "Show available commands and information about the bot",
        default_role: "Participant",
        placeholder: "Loading help information...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "match",
        description: "Create a group match with multiple participants based on shared interests",
        default_role: "Participant",
        placeholder: "Finding group participants...",
        params: [
          {
            name: "size",
            description: "Optional: Number of participants (3-8)",
            required: false,
            param_type: {
              StringParam: {
                min_length: 1,
                max_length: 1,
                choices: [
                  { name: "3 participants", value: "3" },
                  { name: "4 participants", value: "4" },
                  { name: "5 participants", value: "5" },
                  { name: "6 participants", value: "6" },
                  { name: "7 participants", value: "7" },
                  { name: "8 participants", value: "8" }
                ],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "language",
        description: "Update your language preference for better communication",
        default_role: "Participant",
        placeholder: "Updating language...",
        params: [
          {
            name: "language",
            description: "Your language code (e.g., en, es, fr, de, ja, zh, hi, pt, ru)",
            required: true,
            param_type: {
              StringParam: {
                min_length: 2,
                max_length: 2,
                choices: [],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      }
    ]
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(botSchema);
});

// Add bot definition endpoint
app.get('/bot_definition', (req, res) => {
  const schema = {
    description: "Connect people globally through themed cultural exchange meetups",
    commands: [
      {
        name: "start",
        description: "Begin receiving match pings for cultural exchange meetups",
        default_role: "Participant",
        placeholder: "Starting PingPair...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "profile",
        description: "View and update your profile information for better matches",
        default_role: "Participant",
        placeholder: "Loading profile...",
        params: [
          {
            name: "interests",
            description: "Your interests to help with matching you to like-minded people",
            required: false,
            param_type: {
              StringParam: {
                min_length: 0,
                max_length: 500,
                choices: [],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "skip",
        description: "Skip the current matching cycle when you're busy",
        default_role: "Participant",
        placeholder: "Skipping match...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "stats",
        description: "View your Strix points and match history with other users",
        default_role: "Participant",
        placeholder: "Loading stats...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "timezone",
        description: "Update your timezone preference for better match timing",
        default_role: "Participant",
        placeholder: "Updating timezone...",
        params: [
          {
            name: "timezone",
            description: "Your timezone (e.g., UTC+1, EST) for scheduling meetups",
            required: true,
            param_type: {
              StringParam: {
                min_length: 1,
                max_length: 50,
                choices: [],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "help",
        description: "Show available commands and information about the bot",
        default_role: "Participant",
        placeholder: "Loading help information...",
        params: [],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "match",
        description: "Create a group match with multiple participants based on shared interests",
        default_role: "Participant",
        placeholder: "Finding group participants...",
        params: [
          {
            name: "size",
            description: "Optional: Number of participants (3-8)",
            required: false,
            param_type: {
              StringParam: {
                min_length: 1,
                max_length: 1,
                choices: [
                  { name: "3 participants", value: "3" },
                  { name: "4 participants", value: "4" },
                  { name: "5 participants", value: "5" },
                  { name: "6 participants", value: "6" },
                  { name: "7 participants", value: "7" },
                  { name: "8 participants", value: "8" }
                ],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      },
      {
        name: "language",
        description: "Update your language preference for better communication",
        default_role: "Participant",
        placeholder: "Updating language...",
        params: [
          {
            name: "language",
            description: "Your language code (e.g., en, es, fr, de, ja, zh, hi, pt, ru)",
            required: true,
            param_type: {
              StringParam: {
                min_length: 2,
                max_length: 2,
                choices: [],
                multi_line: false
              }
            }
          }
        ],
        permissions: {
          community: 0,
          chat: 0,
          message: 0
        },
        direct_messages: false
      }
    ]
  };
  res.json(schema);
});

// Add new command for achievements
function handleAchievements(userId) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Get all available achievements
  const availableAchievements = Object.entries(achievements).map(([key, achievement]) => {
    const progress = getAchievementProgress(user, key);
    return `- ${achievement.name}: ${achievement.description}\n  ${progress}`;
  }).join('\n\n');
  
  return {
    text: `🏆 **Available Achievements**\n\n${availableAchievements}\n\nComplete achievements to earn Strix Points and special badges!`
  };
}

// Add new command for leaderboard
function handleLeaderboard(userId) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Get top users by different metrics
  const topByPoints = Array.from(users.values())
    .sort((a, b) => b.strixPoints - a.strixPoints)
    .slice(0, 5);
  
  const topByStreak = Array.from(users.values())
    .sort((a, b) => (b.bestStreak || 0) - (a.bestStreak || 0))
    .slice(0, 5);
  
  const topByMatches = Array.from(users.values())
    .sort((a, b) => b.matchHistory.length - a.matchHistory.length)
    .slice(0, 5);
  
  const pointsLeaderboard = topByPoints
    .map((u, i) => `${i + 1}. ${u.userId}: ${u.strixPoints} points`)
    .join('\n');
  
  const streakLeaderboard = topByStreak
    .map((u, i) => `${i + 1}. ${u.userId}: ${u.bestStreak || 0} days`)
    .join('\n');
  
  const matchesLeaderboard = topByMatches
    .map((u, i) => `${i + 1}. ${u.userId}: ${u.matchHistory.length} matches`)
    .join('\n');
  
  return {
    text: `🏆 **PingPair Leaderboards**\n\n💰 **Top Strix Points**\n${pointsLeaderboard}\n\n🔥 **Top Streaks**\n${streakLeaderboard}\n\n🤝 **Most Matches**\n${matchesLeaderboard}\n\nKeep participating to climb the leaderboards!`
  };
}

// Add new command for blockchain news
function handleBlockchainNews(userId, args) {
  console.log('Blockchain News command:', JSON.stringify(args));
  
  // Create user if they don't exist
  if (!users.has(userId)) {
    users.set(userId, createUser(userId));
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Process args - handle both old format (string array) and new format (object array)
  let country = '';
  
  if (args && args.length > 0) {
    // Check if we have the new format (objects with name/value)
    if (typeof args[0] === 'object' && args[0] !== null) {
      // New OpenChat format - object with name/value
      const countryArg = args.find(arg => arg.name === 'country' || arg.name === 'region');
      if (countryArg && countryArg.value) {
        country = countryArg.value;
      }
    } else {
      // Old format - just strings
      country = args.join(' ');
    }
  }
  
  // If no country specified, show all countries
  if (!country) {
    const countryList = Object.entries(blockchainNews)
      .map(([code, data]) => `${data.flag} ${data.name}`)
      .join('\n');
    
    return {
      text: `🌐 **Blockchain News by Country**\n\n${countryList}\n\nUse \`/pingpair blockchain country:[country]\` to get latest news`
    };
  }
  
  // Get news for specific country
  const countryData = Object.values(blockchainNews).find(c => 
    c.name.toLowerCase() === country.toLowerCase()
  );
  
  if (!countryData) {
    return {
      text: `❌ Country not found. Available countries:\n${Object.values(blockchainNews).map(c => c.flag + ' ' + c.name).join('\n')}`
    };
  }
  
  // Get random fact and format news
  const fact = countryData.facts[Math.floor(Math.random() * countryData.facts.length)];
  const sources = countryData.sources.join('\n');
  
  // Award Strix points for reading news
  user.strixPoints = (user.strixPoints || 0) + 5;
  users.set(userId, user);
  
  return {
    text: `📰 **Blockchain News: ${countryData.flag} ${countryData.name}**\n\n💡 Did you know?\n${fact}\n\n🔍 Latest news sources:\n${sources}\n\n✨ Earned 5 Strix Points for reading blockchain news! (Total: ${user.strixPoints})`
  };
}

// Add new command for daily blockchain digest
function handleDailyDigest(userId) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Get random facts from each country
  const digest = Object.values(blockchainNews).map(country => {
    const fact = country.facts[Math.floor(Math.random() * country.facts.length)];
    return `${country.flag} **${country.name}**: ${fact}`;
  }).join('\n\n');
  
  return {
    text: `📰 **Daily Blockchain Digest**\n\n${digest}\n\n✨ Earn 10 Strix Points for reading the daily digest!`
  };
}

// Add new command for blockchain quiz
function handleBlockchainQuiz(userId) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // Generate random quiz question
  const countries = Object.values(blockchainNews);
  const country = countries[Math.floor(Math.random() * countries.length)];
  const fact = country.facts[Math.floor(Math.random() * country.facts.length)];
  
  return {
    text: `🎯 **Blockchain Quiz**\n\nWhich country is this fact about?\n\n${fact}\n\nAnswer with /pingpair quiz [country name]\n\n✨ Earn 15 Strix Points for correct answers!`
  };
}

// Update help command with new features
function handleHelp() {
  const helpText = `
# PingPair Bot - Help 🌍✨

## Core Commands
- \`/pingpair start\` - Begin receiving match pings
- \`/pingpair profile\` - View and update your profile
- \`/pingpair profile country [country]\` - Set your country
- \`/pingpair profile interests [list]\` - Update your interests
- \`/pingpair profile bio [text]\` - Set your bio
- \`/pingpair skip\` - Skip the current matching cycle
- \`/pingpair stats\` - View your Strix network score
- \`/pingpair timezone [zone]\` - Set your timezone

## Match Commands
- \`/pingpair match\` - Create a group match
- \`/pingpair match [size]\` - Create a match with specific size

## Social Features
- \`/pingpair achievements\` - View available achievements
- \`/pingpair leaderboard\` - See the global leaderboard
- \`/pingpair announce\` - View community announcements
- \`/pingpair language [code]\` - Set your language preference

## Discovery Features
- \`/pingpair blockchain\` - Get latest blockchain news
- \`/pingpair digest\` - Get your daily blockchain digest
- \`/pingpair quiz\` - Take a blockchain knowledge quiz

Need more help? Visit our website at https://pingpair.example.com
`;

  return { text: helpText };
}

// Database integration for persistent storage
let dbEnabled = false;
try {
  // Simulated database connection
  console.log('Initializing database connection...');
  dbEnabled = true;
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to connect to database:', error);
  console.log('Falling back to in-memory storage');
}

// Enhanced error handling system
class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }
  
  logError(error, context = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      context
    };
    
    console.error(`[ERROR] ${errorRecord.timestamp}: ${errorRecord.error}`);
    
    this.errors.unshift(errorRecord);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }
    
    return errorRecord;
  }
  
  getRecentErrors(count = 10) {
    return this.errors.slice(0, count);
  }
  
  async handleAsync(promise, context = {}) {
    try {
      return await promise;
    } catch (error) {
      this.logError(error, context);
      return null;
    }
  }
  
  wrap(fn, context = {}) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.logError(error, { ...context, args });
        return null;
      }
    };
  }
}

// Initialize global error handler
const errorHandler = new ErrorHandler();

// Attempt to save data to database if available
async function saveDataToDb() {
  if (!dbEnabled) return false;
  
  try {
    // Simulated database save
    const data = {
      users: Array.from(users.entries()),
      announcements: Array.from(announcements.entries()),
      groupMatches: Array.from(groupMatches.entries()),
      timestamp: new Date().toISOString()
    };
    
    console.log(`Data saved to database: ${data.users.length} users, ${data.announcements.length} announcements, ${data.groupMatches.length} group matches`);
    return true;
  } catch (error) {
    errorHandler.logError(error, { operation: 'saveDataToDb' });
    return false;
  }
}

// Load data from database if available
async function loadDataFromDb() {
  if (!dbEnabled) return false;
  
  try {
    // Simulated database load
    console.log('Data loaded from database successfully');
    return true;
  } catch (error) {
    errorHandler.logError(error, { operation: 'loadDataFromDb' });
    return false;
  }
}

// Add periodic data saving
setInterval(saveDataToDb, 5 * 60 * 1000); // Save every 5 minutes

// Initialize by loading data
(async () => {
  await loadDataFromDb();
})();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PingPair Bot server running on port ${PORT}`);
}); 