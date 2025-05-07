#!/bin/bash

echo "Setting up ElizaOS integration for PingPair..."

# Install dependencies
npm install || { echo "Failed to install dependencies"; exit 1; }

# Create necessary directories
mkdir -p data/providers
mkdir -p data/actions

# Set up configuration
if [ ! -f "pingpair.character.json" ]; then
  echo "Creating character configuration file..."
  cp template.character.json pingpair.character.json
fi

# Link to main project
echo "Linking ElizaOS integration to main project..."
cd ..
npm link ./elizaos

echo "ElizaOS setup complete!"
echo "To run the demo: node pingpair-eliza-demo.js" 