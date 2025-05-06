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

// Countries database for spotlights
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
    ],
    traditions: [
      'Safari tourism',
      'Maasai cultural traditions',
      'Kenyan long-distance running excellence'
    ]
  },
  'Brazil': {
    name: 'Brazil',
    flag: '🇧🇷',
    facts: [
      'Largest country in South America',
      'Population of about 213 million',
      'Home to a significant portion of the Amazon rainforest'
    ],
    traditions: [
      'Carnival celebrations',
      'Samba music and dance',
      'Soccer (football) culture'
    ]
  }
};

// Command handlers
function handleStart(userId) {
  if (!users.has(userId)) {
    users.set(userId, {
      userId,
      strixPoints: 5,
      isActive: true,
      timezone: 'UTC',
      interests: [],
      matchHistory: []
    });
    
    return {
      text: "Welcome to PingPair! 🌍✨\n\nI'll connect you with someone from a different part of the world twice a week for cultural exchange meetups.\n\nUse /pingpair profile to set up your profile and start getting matched!"
    };
  }
  
  const user = users.get(userId);
  user.isActive = true;
  users.set(userId, user);
  
  return {
    text: "Welcome back to PingPair! You're now active and will receive match notifications. Use /pingpair profile to update your profile."
  };
}

function handleProfile(userId, args) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  
  // If no arguments, show current profile
  if (!args || args.length === 0) {
    return {
      text: `🌟 **Your PingPair Profile**\n\nTimezone: ${user.timezone}\nInterests: ${user.interests.join(', ') || 'None set'}\nStrix Points: ${user.strixPoints}\nMatches: ${user.matchHistory.length}\n\nUse /pingpair profile add [interest] to add interests`
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
      text: `Added "${interest}" to your interests! You now have ${user.strixPoints} Strix Points.`
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
  users.set(userId, user);
  
  return {
    text: "You'll skip the next match. Use /pingpair start to activate matching again."
  };
}

function handleStats(userId) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  
  return {
    text: `✨ **Your PingPair Stats**\n\nStrix Points: ${user.strixPoints}\nTotal Matches: ${user.matchHistory.length}\nActive: ${user.isActive ? 'Yes' : 'No'}\n\nKeep participating to earn more Strix Points!`
  };
}

function handleTimezone(userId, args) {
  if (!users.has(userId)) {
    return handleStart(userId);
  }
  
  const user = users.get(userId);
  
  if (!args || args.length === 0) {
    return {
      text: `Your current timezone is set to: ${user.timezone}\n\nUse /pingpair timezone [your timezone] to update it.`
    };
  }
  
  const timezone = args.join(' ');
  user.timezone = timezone;
  users.set(userId, user);
  
  return {
    text: `Your timezone has been updated to: ${timezone}`
  };
}

function handleHelp() {
  return {
    text: "**PingPair Bot Commands**\n\n/pingpair start - Begin receiving match pings\n/pingpair profile - View and update profile\n/pingpair skip - Skip current matching cycle\n/pingpair stats - View Strix points and match history\n/pingpair timezone - Update timezone preference"
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

// Status endpoint
app.get('/', (req, res) => {
  res.send('PingPair Bot is running! 🌍✨');
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
  res.send('pingpair-bot.onrender.com');
});

// OpenChat verification endpoint
app.get('/.well-known/canister-info', (req, res) => {
  const response = {
    canisters: {
      'ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe': {
        name: 'PingPair Bot',
        description: 'Connect people globally through themed cultural exchange meetups',
        frontend_url: 'https://pingpair-bot.onrender.com',
        icon_url: 'https://pingpair-bot.onrender.com/icon.png',
        module_hash: ''
      }
    }
  };
  res.json(response);
});

// Simple icon endpoint
app.get('/icon.png', (req, res) => {
  const iconPath = path.join(__dirname, 'public/pingpair-icon.png');
  
  // Check if the file exists
  if (fs.existsSync(iconPath)) {
    res.sendFile(iconPath);
  } else {
    // If no icon file exists, send a placeholder response
    res.setHeader('Content-Type', 'image/png');
    
    // Redirect to a placeholder image
    res.redirect('https://via.placeholder.com/256x256.png?text=PingPair');
  }
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PingPair Bot server running on port ${PORT}`);
}); 