#!/bin/bash

echo "=== Setting up PingPair ElizaOS Demo ==="

# Create dist directory if it doesn't exist
mkdir -p elizaos

# Copy character configuration
if [ ! -f elizaos/pingpair.character.json ]; then
  echo "Creating character configuration file..."
  cat > elizaos/pingpair.character.json << 'EOF'
{
  "name": "PingPair",
  "system": "Connect people globally through themed cultural exchange meetups",
  "culturalTopics": ["cuisine", "traditions", "language", "art", "history"],
  "matchingRules": {
    "preferDifferentTimezones": true,
    "preferDifferentContinents": true,
    "preferSharedInterests": true
  }
}
EOF
  echo "Character configuration created."
fi

# Make the demo script executable
chmod +x elizaos/pingpair-eliza-demo.js

echo
echo "=== Setup Complete ==="
echo
echo "To run the demo, use:"
echo "  node elizaos/pingpair-eliza-demo.js"
echo
echo "This will demonstrate how ElizaOS concepts would integrate with PingPair." 