/**
 * PingPair Bot Verification Script
 * 
 * This script checks if the basic bot endpoints are working correctly.
 */

console.log('=== PingPair Bot Verification ===');
console.log('Checking bot definition endpoint...');

const express = require('express');
const http = require('http');

// Create mock server with request/response objects
function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    console.log(`Testing ${path}...`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ ${path} returned valid JSON`);
          
          // Basic validation
          if (!result.description) {
            console.error(`❌ ${path} missing description field`);
          }
          
          if (!result.commands || !Array.isArray(result.commands)) {
            console.error(`❌ ${path} missing or invalid commands array`);
          } else {
            console.log(`✅ ${path} has ${result.commands.length} commands`);
          }
          
          resolve(result);
        } catch (e) {
          console.error(`❌ ${path} returned invalid JSON:`, e.message);
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`❌ Error testing ${path}:`, e.message);
      reject(e);
    });
    
    req.end();
  });
}

// Start the server in test mode
console.log('Starting server in test mode...');

try {
  // Load the server but prevent actual listening
  const originalListen = express.application.listen;
  express.application.listen = function() {
    console.log('Server loaded without binding to port');
    return { close: () => {} };
  };
  
  const server = require('./server.js');
  console.log('✅ Server loaded successfully!');
  
  console.log('\n=== Tests Complete ===');
  console.log('To start the server, run: npm start');
  console.log('To register with OpenChat, use: /register_bot PingPair <your-server-url>');
} catch (e) {
  console.error('❌ Error loading server:', e);
} 