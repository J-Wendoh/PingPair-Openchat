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
function handleStart(userId) {
  if (!users.has(userId)) {
    users.set(userId, createUser(userId));
    
    updateUserStatus(userId, true);
    
    return {
      text: "🌟 Welcome to PingPair! 🌍✨\n\nI'll connect you with someone from a different part of the world for cultural exchange meetups.\n\n🎯 You've earned 5 Strix Points for joining!\n\nUse /pingpair profile to set up your profile and start getting matched!"
    };
  }
  
  const user = users.get(userId);
  user.isActive = true;
  user.lastActive = Date.now();
  users.set(userId, user);
  updateUserStatus(userId, true);
  
  return {
    text: "🌟 Welcome back to PingPair! You're now active and will receive match notifications.\n\nUse /pingpair profile to update your profile and start matching!"
  };
}

function handleProfile(userId, args) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // If no arguments, show current profile
  if (!args || args.length === 0) {
    const countryInfo = user.country ? countries[user.country] : null;
    let countryText = '';
    if (countryInfo) {
      countryText = `\n🌍 Country: ${countryInfo.flag} ${countryInfo.name}`;
    }
    
    // Format achievements
    const achievementsText = user.achievements.length > 0 ?
      `\n🏆 Achievements:\n${user.achievements.map(a => `- ${a.name}: ${a.description}`).join('\n')}` : '';
    
    // Format badges
    const badgesText = user.badges.length > 0 ?
      `\n🎖️ Badges:\n${user.badges.join(' ')}` : '';
    
    // Format streak
    const streakText = user.streak > 0 ?
      `\n🔥 Current Streak: ${user.streak} days` : '';
    
    // Format level
    const levelText = `\n⭐ Level ${user.level} (${user.xp} XP)`;
    
    return {
      text: `🌟 **Your PingPair Profile**\n\n${countryText}\n⏰ Timezone: ${user.timezone}\n🎯 Interests: ${user.interests.join(', ') || 'None set'}\n✨ Strix Points: ${user.strixPoints}${levelText}${streakText}${achievementsText}${badgesText}\n\n🤝 Matches: ${user.matchHistory.length}\n\nUse /pingpair profile add [interest] to add interests`
    };
  }
  
  // Handle profile subcommands
  const subCmd = args[0];
  
  if (subCmd === 'add' && args.length > 1) {
    const interest = args.slice(1).join(' ');
    if (!user.interests.includes(interest)) {
      user.interests.push(interest);
      user.strixPoints += 1;
      user.xp += 5;
      
      // Check for level up
      if (user.xp >= user.level * 100) {
        user.level++;
        user.badges.push('🎯');
      }
      
      users.set(userId, user);
    }
    
    return {
      text: `✨ Added "${interest}" to your interests! You now have ${user.strixPoints} Strix Points and ${user.xp} XP.`
    };
  }
  
  return {
    text: "To update your profile, use:\n/pingpair profile add [interest]"
  };
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
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  if (!args || args.length === 0) {
    return {
      text: `⏰ Your current timezone is set to: ${user.timezone}\n\nUse /pingpair timezone [your timezone] to update it.`
    };
  }
  
  const timezone = args.join(' ');
  user.timezone = timezone;
  users.set(userId, user);
  
  return {
    text: `⏰ Your timezone has been updated to: ${timezone}`
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
              default:
                return handleHelp();
            }
          }
        }
      } catch (error) {
        console.error('Error parsing OpenChat event:', error);
      }
    }
    
    // Handle our simplified format
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
          default:
            return handleHelp();
        }
      }
    }
    
    // Handle message
    if (eventData.type === 'message' || eventData.message) {
      return { text: "Use /pingpair commands to interact with PingPair bot!" };
    }
    
    return { text: "I'm PingPair bot! Use /pingpair commands to interact with me." };
  } catch (error) {
    console.error('Error parsing event:', error);
    return { error: 'Failed to process event', details: error.message };
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
    
    // Get the response from the handler
    const response = handleBotEvent(req.body);
    
    // Add appropriate CORS headers for OpenChat
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    console.log('Response:', JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error('Error handling event:', error);
    res.status(500).json({ error: 'Failed to process event', details: error.message });
  }
});

// Bot schema definition for OpenChat
app.get('/', (req, res) => {
  // If the Accept header includes application/json, return the schema
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    const botSchema = {
      name: "PingPair Bot",
      description: "Connect people globally through themed cultural exchange meetups",
      category: "Social & Community",
      version: "1.0.0",
      avatar: "https://images.openchat.com/bot/ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe/icon.png",
      commands: [
        {
          name: "/pingpair start",
          description: "Begin receiving match pings"
        },
        {
          name: "/pingpair profile",
          description: "View and update profile"
        },
        {
          name: "/pingpair skip",
          description: "Skip current matching cycle"
        },
        {
          name: "/pingpair stats",
          description: "View Strix points and match history"
        },
        {
          name: "/pingpair timezone",
          description: "Update timezone preference"
        },
        {
          name: "/pingpair blockchain",
          description: "Get blockchain news"
        },
        {
          name: "/pingpair digest",
          description: "Get daily blockchain digest"
        },
        {
          name: "/pingpair quiz",
          description: "Test your blockchain knowledge"
        }
      ],
      example_commands: ["/pingpair start", "/pingpair profile", "/pingpair stats"]
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
      "/pingpair quiz"
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
  res.send(`{"${principal}":{"name":"PingPair Bot","description":"Connect people globally through themed cultural exchange meetups","icon_url":"https://images.openchat.com/bot/ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe/icon.png"}}`);
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
    name: "PingPair Bot",
    description: "Connect people globally through themed cultural exchange meetups",
    category: "Social & Community",
    version: "1.0.0",
    avatar: "https://images.openchat.com/bot/ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe/icon.png",
    commands: [
      {
        name: "/pingpair start",
        description: "Begin receiving match pings"
      },
      {
        name: "/pingpair profile",
        description: "View and update profile"
      },
      {
        name: "/pingpair skip",
        description: "Skip current matching cycle"
      },
      {
        name: "/pingpair stats",
        description: "View Strix points and match history"
      },
      {
        name: "/pingpair timezone",
        description: "Update timezone preference"
      },
      {
        name: "/pingpair blockchain",
        description: "Get blockchain news"
      },
      {
        name: "/pingpair digest",
        description: "Get daily blockchain digest"
      },
      {
        name: "/pingpair quiz",
        description: "Test your blockchain knowledge"
      }
    ],
    example_commands: ["/pingpair start", "/pingpair profile", "/pingpair stats"]
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(botSchema);
});

// Add bot definition endpoint
app.get('/bot_definition', (req, res) => {
  res.json({
    name: "PingPair Bot",
    description: "Connect people globally through themed cultural exchange meetups",
    category: "Social & Community",
    version: "1.0.0",
    avatar: "https://pingpair-bot.onrender.com/icon.png",
    commands: [
      {
        name: "/pingpair start",
        description: "Begin receiving match pings"
      },
      {
        name: "/pingpair profile",
        description: "View and update your profile"
      },
      {
        name: "/pingpair skip",
        description: "Skip current matching cycle"
      },
      {
        name: "/pingpair stats",
        description: "View your Strix points and match history"
      },
      {
        name: "/pingpair timezone",
        description: "Update your timezone preference"
      },
      {
        name: "/pingpair blockchain",
        description: "Get blockchain news"
      },
      {
        name: "/pingpair digest",
        description: "Get daily blockchain digest"
      },
      {
        name: "/pingpair quiz",
        description: "Test your blockchain knowledge"
      }
    ],
    example_commands: [
      "/pingpair start",
      "/pingpair profile",
      "/pingpair skip",
      "/pingpair stats",
      "/pingpair timezone",
      "/pingpair blockchain",
      "/pingpair digest",
      "/pingpair quiz"
    ]
  });
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
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  user.lastActive = Date.now();
  
  // If no country specified, show all countries
  if (!args || args.length === 0) {
    const countryList = Object.entries(blockchainNews)
      .map(([code, data]) => `${data.flag} ${data.name}`)
      .join('\n');
    
    return {
      text: `🌐 **Blockchain News by Country**\n\n${countryList}\n\nUse /pingpair blockchain [country] to get latest news`
    };
  }
  
  // Get news for specific country
  const country = args.join(' ');
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
  
  return {
    text: `📰 **Blockchain News: ${countryData.flag} ${countryData.name}**\n\n💡 Did you know?\n${fact}\n\n🔍 Latest news sources:\n${sources}\n\n✨ Earn 5 Strix Points for reading blockchain news!`
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
  return {
    text: `🌟 **PingPair Bot Commands**\n\n` +
          `🎯 Core Commands:\n` +
          `/pingpair start - Begin receiving match pings\n` +
          `/pingpair profile - View and update your profile\n` +
          `/pingpair skip - Skip current matching cycle\n` +
          `/pingpair stats - View your stats and match history\n` +
          `/pingpair timezone - Update your timezone\n\n` +
          `🏆 Social Features:\n` +
          `/pingpair achievements - View available achievements\n` +
          `/pingpair leaderboard - View top users\n\n` +
          `📰 Blockchain News:\n` +
          `/pingpair blockchain [country] - Get blockchain news\n` +
          `/pingpair digest - Get daily blockchain digest\n` +
          `/pingpair quiz - Test your blockchain knowledge\n\n` +
          `✨ Earn Strix Points and achievements by:\n` +
          `- Completing matches\n` +
          `- Maintaining streaks\n` +
          `- Reading blockchain news\n` +
          `- Taking blockchain quizzes\n` +
          `- Adding interests to your profile`
  };
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PingPair Bot server running on port ${PORT}`);
}); 