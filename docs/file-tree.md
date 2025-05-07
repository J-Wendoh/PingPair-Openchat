# PingPair Bot - File Structure

## Directory Structure

```
PingPair/
│
├── src/               # Source code
│   ├── lib.rs         # Library exports for binaries
│   ├── main.rs        # Main entry point for the bot
│   ├── config.rs      # Configuration handling
│   │
│   ├── api/           # API endpoints and handlers
│   │   ├── mod.rs     # API module exports
│   │   ├── handlers.rs # Command and message handlers
│   │   └── webhook.rs # OpenChat webhook handler
│   │
│   ├── commands/      # Bot command implementations
│   │   ├── mod.rs     # Command module exports
│   │   ├── pingpair.rs # Primary PingPair command handler
│   │   └── echo.rs    # Simple echo command for testing
│   │
│   ├── model/         # Data models and state management
│   │   ├── mod.rs     # Model module exports
│   │   ├── state.rs   # Application state management
│   │   ├── types.rs   # Data type definitions
│   │   └── country.rs # Country database and cultural info
│   │
│   ├── matching/      # Matching system
│   │   ├── mod.rs     # Matching module exports
│   │   ├── engine.rs  # Matching algorithm
│   │   └── scoring.rs # Match scoring system
│   │
│   ├── meeting/       # Meeting system
│   │   ├── mod.rs     # Meeting module exports
│   │   ├── generator.rs # Meeting link generator
│   │   └── tracker.rs # Meeting status tracker
│   │
│   └── bin/           # Binary executables
│       └── test_ping.rs # Test tool for ping functionality
│
├── tests/             # Test files
│   └── integration/   # Integration tests
│
├── docs/              # Documentation
│   ├── task-log.md    # Task tracking and progress
│   ├── dev-notes.md   # Development notes
│   ├── file-tree.md   # File structure documentation
│   ├── pitch-deck.md  # Project pitch document
│   └── partner-update.md # Updates for partners
│
├── scripts/           # Helper scripts
│   └── deploy.sh      # Deployment script
│
├── target/            # Build artifacts (generated)
│
├── Cargo.toml         # Rust package manifest
├── Cargo.lock         # Dependency lock file
├── config.toml        # Application configuration
└── README.md          # Project overview
```

## Component Relationships

### Main Component Flow

```
main.rs
  │
  ├── config.rs (Load configuration)
  │
  ├── commands/mod.rs
  │   └── pingpair.rs (Command implementations)
  │
  ├── api/handlers.rs (API endpoints)
  │   │
  │   ├── model/state.rs (State management)
  │   │   └── model/types.rs (Data structures)
  │   │
  │   ├── matching/engine.rs (Matching system)
  │   │   └── matching/scoring.rs (Match scoring)
  │   │
  │   └── meeting/generator.rs (Meeting system)
  │
  └── model/state.rs (Initialize state)
```

### Command Structure

```
commands/pingpair.rs
  │
  ├── CommandHandler trait implementation
  │   └── execute() method
  │       │
  │       └── api/handlers.rs (Command handlers)
  │           │
  │           ├── model/state.rs (User & match management)
  │           │
  │           ├── matching/engine.rs (Matching system)
  │           │
  │           └── meeting/generator.rs (Meeting system)
  │
  └── simulate_ping_time() function
```

## File Sizes

- Main application code: ~15KB
- Command implementations: ~6KB
- API handlers: ~8KB
- Models and state: ~7KB
- Matching system: ~5KB
- Meeting system: ~4KB
- Configuration: ~1KB
- Documentation: ~12KB

## Key File Descriptions

### src/lib.rs
Exports all necessary modules for binary files to access the library functionality.

### src/main.rs
Main application entry point that initializes the bot, loads configuration, and starts the HTTP server for bot communication.

### src/commands/pingpair.rs
Core command implementation for the PingPair bot that handles all user commands.

### src/api/handlers.rs
Handlers for various bot commands and messages, implementing the business logic for user interactions.

### src/model/state.rs
State management functions for users, matches, and sessions. Provides persistent storage for the bot operation.

### src/matching/engine.rs
Enhanced matching algorithm that considers online status, timezone compatibility, and shared interests.

### src/meeting/generator.rs
Meeting system that generates and tracks OpenChat meeting links for user matches. 