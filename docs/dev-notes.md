# PingPair Bot - Development Notes

## System Architecture

### Technology Stack
- Framework: OpenChat Bot SDK (Rust-based canister)
- Storage: Internet Computer canister state
- Matching: Enhanced algorithm based on online status, timezone, and interests
- Scheduling: Real-time matching with online status tracking
- Integration: OpenChat meeting system

### Core Components
- Bot Canister: Main canister handling commands and interactions
- User Manager: Handles user profiles, preferences, and online status
- Match Engine: Real-time pairing based on multiple factors
- Meeting System: OpenChat meeting integration
- Strix System: Enhanced gamification with cultural rewards

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
    last_active: u64,
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
    cultural_facts: Vec<String>,
    traditions: Vec<String>,
}
```

#### Country
```rust
pub struct Country {
    name: String,
    flag: String,
    facts: Vec<String>,
    traditions: Vec<String>,
    landmarks: Vec<String>,
    cuisine: Vec<String>,
}
```

### Enhanced Matching Algorithm Design
- Track user online status in real-time
- Group users by timezone (±2 hours)
- Filter by availability and active status
- Score matches based on:
  - Common interests (weighted)
  - Timezone compatibility
  - Recent match history
  - Random factor for diversity
- Avoid repeated matches with same users
- Prioritize users who haven't been matched recently

### Meeting System
- Generate unique OpenChat meeting links
- Track meeting status and completion
- Award Strix points for completed meetings
- Store cultural information for each match
- Enable easy reconnection if meeting fails

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
- +2 points for each interest added
- +15 points for cultural exchange completion

### Cultural Database
- Detailed country information
- Facts and traditions
- Landmarks and cuisine
- Random selection for match notifications
- Dynamic updates based on user feedback

### OpenChat Integration
- Proper bot definition endpoint
- Meeting link generation
- Community-specific features
- Enhanced user experience
- Emoji-rich responses

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

### OpenChat Registration
To register the bot with OpenChat:

1. Principal ID: `ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe`
2. Bot Name: `pingpair_bot`
3. Endpoint: `https://pingpair-bot.onrender.com`
4. Community: OpenChat Botathon

Required endpoints:
- `/.well-known/canister-info`
- `/.well-known/ic-domains`
- `/bot_definition`
- `/openchat-webhook`
- `/icon.png` 