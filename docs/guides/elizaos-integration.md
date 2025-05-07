# ElizaOS Integration Guide

This guide explains how to use and extend the ElizaOS integration with PingPair to enhance the bot with autonomous agent capabilities.

## What is ElizaOS?

ElizaOS is an autonomous agent framework that allows you to create intelligent bots with natural language capabilities, custom actions, and data providers. It enables PingPair to have more natural conversations, better cultural understanding, and improved matching capabilities.

## Setup

1. **Make sure you have DFX installed**
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Create and export an identity**
   ```bash
   dfx identity new pingpair_identity
   dfx identity export pingpair_identity > identity.pem
   ```

3. **Configure the environment**
   ```bash
   # Add to your .env file
   PEM_FILE=./identity.pem
   ```

4. **Run the ElizaOS setup**
   ```bash
   cd elizaos
   npm install
   bash setup.sh
   ```

## Key Components

### Character Configuration

The `pingpair.character.json` file defines the bot's personality, behavior, and capabilities:

- **Name and Identity**: Basic information about the bot
- **System Prompt**: Core instructions for the bot's behavior
- **Example Messages**: Examples of how the bot should respond
- **Topics and Style**: Guides the tone and subjects the bot discusses

Customize this file to adjust how PingPair communicates and interacts with users.

### Cultural Provider

The `cultural-provider.ts` file implements a data provider that supplies cultural information:

- Provides country-specific facts, traditions, and language information
- Enhances cultural exchange by offering rich information about different cultures
- Supports the bot's country spotlight feature

Extend this provider to add more countries or cultural dimensions.

### Match Action

The `match-action.ts` file implements the matching functionality:

- Defines the logic for pairing users based on interests, timezones, and cultural backgrounds
- Creates matches and generates meeting links
- Tracks matching history and preferences

Modify this to change how users are matched or add new matching criteria.

## Integration with OpenChat

The ElizaOS agent can be integrated with OpenChat through:

1. **Direct API Integration**: The agent responds to OpenChat commands
2. **Internet Computer Deployment**: The agent can run as a canister on IC

## Testing the Integration

Run the demo script to see how ElizaOS enhances PingPair:

```bash
node elizaos/pingpair-eliza-demo.js
```

This demonstrates:
- Cultural information provision
- Matching process
- Natural language interactions

## Extending the Integration

### Adding New Countries

Modify `cultural-provider.ts` to add more countries:

```typescript
const countryData: Record<string, CountryInfo> = {
  "ExistingCountry": { ... },
  "NewCountry": {
    name: "NewCountry",
    flag: "🏴",
    facts: [ ... ],
    traditions: [ ... ],
    languages: [ ... ],
    funFacts: [ ... ]
  }
};
```

### Adding New Actions

Create a new action file based on the match-action pattern:

```typescript
export const newAction: Action = {
  name: "ACTION_NAME",
  similes: ["SIMILAR_TERMS"],
  description: "Description of what the action does",
  
  validate: async (...) => { ... },
  handler: async (...) => { ... },
  examples: [ ... ]
};
```

### Improving the Character

Enhance the character definition in `pingpair.character.json` by:

1. Adding more example conversations
2. Expanding the list of topics
3. Refining the system prompt
4. Adding specialized personality traits

## Deployment

For production deployment:

1. Deploy the ElizaOS agent to the Internet Computer
2. Connect it to the Express server using middleware
3. Ensure the bot's identity and PEM file are properly configured
4. Test thoroughly with a limited set of users before full deployment

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check that the PEM file is correctly specified
   - Make sure DFX identity is properly created

2. **Integration Errors**
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

3. **Character File Issues**
   - Validate JSON structure
   - Check for missing required fields

4. **OpenChat Connection Problems**
   - Verify Principal ID
   - Check webhook configuration 