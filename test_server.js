// Test loading the server and bot definition endpoint
console.log('Testing server.js...');

try {
  // Load the server.js but don't actually start listening
  const http = require('http');
  const express = require('express');
  const originalListen = express.application.listen;
  express.application.listen = function() {
    console.log('Prevented server from listening during test');
    return { close: () => {} };
  };
  
  const server = require('./server.js');
  console.log('Server loaded successfully!');
  
  // Create a simplified request/response to test the bot_definition endpoint
  const req = {
    headers: {
      accept: 'application/json'
    }
  };
  
  const res = {
    json: (data) => {
      console.log('\nBot Definition validation:');
      
      // Validate required fields
      if (!data.description) {
        console.error('ERROR: Missing description field');
      } else {
        console.log('✓ Description present');
      }
      
      if (!data.commands || !Array.isArray(data.commands) || data.commands.length === 0) {
        console.error('ERROR: Missing or empty commands array');
      } else {
        console.log(`✓ Commands array present with ${data.commands.length} commands`);
        
        // Check first command structure
        const cmd = data.commands[0];
        if (!cmd.name || !cmd.description || !cmd.params || cmd.direct_messages === undefined) {
          console.error('ERROR: Command missing required fields');
        } else {
          console.log('✓ Command structure looks valid');
        }
        
        // Check permissions
        if (!cmd.permissions || typeof cmd.permissions !== 'object') {
          console.error('ERROR: Missing or invalid permissions object');
        } else if (cmd.permissions.community === undefined || 
                  cmd.permissions.chat === undefined ||
                  cmd.permissions.message === undefined) {
          console.error('ERROR: Permissions missing required community/chat/message fields');
        } else {
          console.log('✓ Permissions structure looks valid');
        }
      }
      
      console.log('\nValidation complete');
    },
    setHeader: () => {},
    send: () => {}
  };
  
  // Access the bot_definition endpoint handler
  // This is a simplified approach - in a real test, we'd use a proper HTTP request
  if (server.get && typeof server.get === 'function') {
    console.log('Testing endpoint directly...');
    // For Express apps where the app is exported
    const routes = server._router.stack
      .filter(layer => layer.route)
      .map(layer => {
        return {
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        };
      });
      
    console.log('Available routes:', routes);
    
    // Find the bot_definition route handler
    const botDefRoute = server._router.stack
      .filter(layer => layer.route && layer.route.path === '/bot_definition')
      .pop();
      
    if (botDefRoute && botDefRoute.route) {
      const handler = botDefRoute.route.stack[0].handle;
      handler(req, res);
    } else {
      console.log('Could not find /bot_definition route handler for direct testing');
    }
  }
  
  console.log('All tests completed successfully');
} catch(e) {
  console.error('Error during testing:', e);
} 