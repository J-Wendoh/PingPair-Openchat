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

// PING PAIR BOT LOGIC
const users = new Map();
const matches = new Map();
const onlineUsers = new Set();
const activeMatches = new Map();

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

// Function to update user's online status
function updateUserStatus(userId, isOnline) {
  if (isOnline) {
    onlineUsers.add(userId);
  } else {
    onlineUsers.delete(userId);
  }
}

// Enhanced matching algorithm
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

  // Prioritize users with similar interests
  const scoredMatches = potentialMatches.map(match => {
    const commonInterests = user.interests.filter(interest => 
      match.interests.includes(interest)
    ).length;
    
    return {
      user: match,
      score: commonInterests * 2 + Math.random() // Add some randomness
    };
  });

  // Sort by score and pick the best match
  scoredMatches.sort((a, b) => b.score - a.score);
  return scoredMatches[0]?.user;
}

// Function to generate meeting link
function generateMeetingLink() {
  // Generate a unique meeting ID
  const meetingId = Math.random().toString(36).substring(2, 15);
  return `https://meet.openchat.com/${meetingId}`;
}

// Enhanced match creation
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
    isCompleted: false
  };
  
  matches.set(matchId, match);
  activeMatches.set(user1Id, matchId);
  activeMatches.set(user2Id, matchId);
  
  return match;
}

// Enhanced command handlers with ElizaOS integration
function handleStart(userId) {
  if (!users.has(userId)) {
    users.set(userId, {
      userId,
      strixPoints: 5,
      isActive: true,
      timezone: 'UTC',
      interests: [],
      matchHistory: [],
      lastActive: Date.now()
    });
    
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
    
    return {
      text: `🌟 **Your PingPair Profile**\n\n${countryText}\n⏰ Timezone: ${user.timezone}\n🎯 Interests: ${user.interests.join(', ') || 'None set'}\n✨ Strix Points: ${user.strixPoints}\n🤝 Matches: ${user.matchHistory.length}\n\nUse /pingpair profile add [interest] to add interests`
    };
  }
  
  // Handle profile subcommands
  const subCmd = args[0];
  
  if (subCmd === 'add' && args.length > 1) {
    const interest = args.slice(1).join(' ');
    if (!user.interests.includes(interest)) {
      user.interests.push(interest);
      user.strixPoints += 1;
      users.set(userId, user);
    }
    
    return {
      text: `✨ Added "${interest}" to your interests! You now have ${user.strixPoints} Strix Points.`
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
  
  return {
    text: `✨ **Your PingPair Stats**\n\n🎯 Strix Points: ${user.strixPoints}\n🤝 Total Matches: ${user.matchHistory.length}\n🌟 Active: ${user.isActive ? 'Yes' : 'No'}\n\n🌍 Match History:\n${matchHistory || 'No matches yet'}\n\nKeep participating to earn more Strix Points!`
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

// Enhanced match notification
function sendMatchNotification(userId, match) {
  const country = countries[match.country];
  const user = users.get(userId);
  
  return {
    text: `🌟 **PingPair Match!**\n\n🌍 Today's Spotlight: ${country.flag} ${country.name}\n\n📚 Did you know?\n${country.facts[Math.floor(Math.random() * country.facts.length)]}\n\n🎯 Your match is ready!\n\n💬 Meeting Link: ${match.meetingLink}\n\n✨ You'll earn 10 Strix Points for completing this match!`
  };
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
      "/pingpair timezone"
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
      }
    ],
    example_commands: [
      "/pingpair start",
      "/pingpair profile",
      "/pingpair skip",
      "/pingpair stats",
      "/pingpair timezone"
    ]
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PingPair Bot server running on port ${PORT}`);
}); 