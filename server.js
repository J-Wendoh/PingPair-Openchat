const express = require('express');
const fs = require('fs');
require('dotenv').config();

const app = express();
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
    const eventData = JSON.parse(event);
    
    // Handle command
    if (eventData.type === 'command') {
      const { initiator, text } = eventData;
      
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
    if (eventData.type === 'message') {
      return { text: "Use /pingpair commands to interact with PingPair bot!" };
    }
    
    return { text: "Unknown event type" };
  } catch (error) {
    console.error('Error parsing event:', error);
    return { error: 'Failed to process event' };
  }
}

// Set up webhook to receive events from OpenChat
app.post('/openchat-webhook', (req, res) => {
  try {
    const response = handleBotEvent(JSON.stringify(req.body));
    res.json(response);
  } catch (error) {
    console.error('Error handling event:', error);
    res.status(500).json({ error: 'Failed to process event' });
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PingPair Bot server running on port ${PORT}`);
}); 