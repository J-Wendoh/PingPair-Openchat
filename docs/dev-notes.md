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