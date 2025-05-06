# PingPair Bot - Development Notes

## System Architecture

### Technology Stack
- Framework: OpenChat Bot SDK (Rust-based canister)
- Storage: Internet Computer canister state
- Matching: Custom algorithm based on user preferences and timezones
- Scheduling: Timers for periodic ping messages

### Core Components
- Bot Canister: Main canister handling commands and interactions
- User Manager: Handles user profiles and preferences
- Match Engine: Pairs users based on preferences and timezones
- Ping Scheduler: Manages periodic ping messages
- Strix System: Tracks and awards network points

## Implementation Decisions

### Data Structures

#### User
```rust
pub struct User {
    user_id: String,
    username: String,
    country: Option<String>,
    timezone: String,
    interests: Vec<String>,
    skills: Vec<String>,
    favorites: Vec<String>,
    bio: Option<String>,
    strix_points: u32,
    is_active: bool,
    last_pinged: Option<u64>,
    last_matched: Option<u64>,
    match_history: Vec<MatchRecord>,
    skip_next_cycle: bool,
}
```

#### Match
```rust
pub struct Match {
    match_id: String,
    user1_id: String,
    user2_id: String,
    spotlight_country: String,
    meeting_link: String,
    created_at: u64,
    is_completed: bool,
}
```

### Matching Algorithm Design
- Group users by timezone (±2 hours)
- Filter by availability and active status
- Prioritize users who haven't been matched recently
- Match based on country preferences or interests
- Avoid repeated matches with same users

### Ping Message Scheduling
- Use Internet Computer timers to schedule pings every 3-4 days
- Consider timezone differences when sending pings
- Randomize spotlight countries for cultural diversity

## Configuration Details

### Build and Run
```bash
# Build the project
cargo build

# Run locally
cargo run

# Deploy to IC
dfx deploy
```

### Command Structure
- `/pingpair start` - Begin receiving match pings
- `/pingpair profile` - View and update profile
- `/pingpair skip` - Skip current matching cycle
- `/pingpair stats` - View Strix points and match history
- `/pingpair timezone` - Update timezone preference

## Implementation Notes

### Strix Points System
- +5 points for completing a profile
- +10 points for accepting a match
- +25 points for completing a video chat
- +5 bonus points for matching with someone from a different continent

### Deployment Process
Follow the registration instructions at: https://www.npmjs.com/package/create-openchat-bot 

## Troubleshooting

### OpenChat Bot SDK Compatibility Issues

#### Context field in BotCommandContext
When implementing the CommandHandler trait, we encountered issues with the context object structure. The solution was to access the user information through the command context as follows:

```rust
// Incorrect way that led to compilation errors
let user_id = ctx.sender.user_id.to_string();
let username = ctx.sender.username.to_string();

// Correct way to access user information
let user_id = ctx.command.initiator.to_string();
let username = "user"; // Default placeholder since username isn't directly available
```

This was due to the OpenChat Bot SDK structure where user information is in the command context rather than a separate sender field.

#### Module Structure for Binary Access
To enable binary files to access the library functionality, we created a lib.rs file that exports all necessary modules:

```rust
pub mod api;
pub mod commands;
pub mod model;
pub mod config;
```

This allowed our test binaries to properly import and use the project's functionality.

### Testing Binary Resolution
For binary files that couldn't access the main crate directly, we created self-contained implementations that don't rely on imports from the main crate. This approach provides better isolation for testing specific components. 

## ElizaOS Integration

### Overview
PingPair can be enhanced with ElizaOS to create a more powerful AI-driven matching experience. ElizaOS will provide advanced conversational capabilities, personalized matching algorithms, and the ability to understand user preferences more deeply.

### Integration Approach
1. **Add ElizaOS as a dependency**:
   - Install ElizaOS core module
   - Configure character profile for PingPair bot
   - Set up conversation memory storage

2. **Create Custom Actions**:
   - Matching action for finding compatible users
   - Profile setup and enhancement actions
   - Cultural exchange facilitation

3. **Set Up Providers**:
   - Time and location context provider
   - Cultural information provider for country spotlights
   - User preference tracking provider

4. **Implement Evaluators**:
   - User interest evaluator for improved matching
   - Conversation quality evaluator
   - Engagement measurement

### Implementation Plan
1. **Initial Setup** (Phase 1):
   - Install ElizaOS dependencies
   - Create basic character configuration
   - Test simple conversations

2. **Core Features** (Phase 2):
   - Implement matching actions
   - Set up cultural information providers
   - Create basic evaluators

3. **Advanced Features** (Phase 3):
   - Voice chat integration
   - Multi-language support
   - Contextual conversation memory

### Technical Details
The integration will use ElizaOS's action system to enhance our existing command handlers. Each PingPair command will have a corresponding ElizaOS action that provides more intelligent responses and suggestions.

```typescript
// Example action for profile enhancement
const profileEnhancementAction: Action = {
    name: "ENHANCE_PROFILE",
    description: "Suggests improvements to user profiles based on conversation context",
    handler: async (runtime, message, state) => {
        // Implementation logic
    }
};
```

The character configuration will maintain the friendly, connection-focused tone of PingPair while adding more conversational depth:

```json
{
    "name": "PingPair",
    "bio": [
        "PingPair helps people connect across cultures and borders",
        "Creates meaningful conversations through shared interests and cultural exchange",
        "Facilitates video chat meetings between matched users"
    ],
    "style": {
        "all": [
            "Friendly and encouraging tone",
            "Clear and concise explanations",
            "Culturally sensitive and inclusive language"
        ]
    }
}
```

### Integration with OpenChat
The ElizaOS-enhanced PingPair bot will be registered with OpenChat following the standard registration process, with additional capabilities highlighted in the bot description and documentation. 

## ElizaOS Demonstration Approach

For the initial phase, we've developed a simplified demonstration of ElizaOS concepts rather than a full integration. This approach allows us to:

1. **Showcase Core Concepts**: Demonstrate how ElizaOS features would enhance PingPair without requiring a complex setup
2. **Provide Easy Testing**: Enable quick testing with minimal dependencies
3. **Illustrate Potential**: Show the potential of a full integration without implementing the entire system

### Demo Implementation

The demonstration consists of:

1. **A Standalone JavaScript Demo Script**: `elizaos/pingpair-eliza-demo.js`
   - Runs with Node.js without additional dependencies
   - Simulates key ElizaOS features for PingPair

2. **Character Configuration**: `elizaos/pingpair.character.json`
   - Defines PingPair's personality and behavior
   - Sets matching rules and cultural topics

3. **Setup Script**: `elizaos/setup.sh`
   - Creates necessary files and configuration
   - Makes the demo script executable

### Running the Demo

To run the demonstration:

```bash
# Set up the demo
bash elizaos/setup.sh

# Run the demo
node elizaos/pingpair-eliza-demo.js
```

### Demo Features

The demo showcases these key ElizaOS concepts:

1. **Character-Driven Behavior**: Using a defined character configuration to guide bot responses
2. **Cultural Information Provider**: Providing rich information about countries for cultural exchange
3. **Match Action Simulation**: Demonstrating how matching would be enhanced with country spotlights
4. **Natural Language Processing**: Showing how the bot responds to user queries about countries

### Full Integration Path

To move from this demonstration to a full integration:

1. Install the complete ElizaOS framework
2. Implement actual providers and actions using the ElizaOS API
3. Connect to the PingPair core functionality
4. Add advanced features like contextual memory and personalization

This demonstration serves as a proof of concept and blueprint for the eventual complete integration. 