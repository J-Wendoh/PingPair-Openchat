# Project Structure

```
ping-pair-bot/
├── src/
│   ├── commands/           # Command handlers
│   │   ├── core.js        # Core commands (start, profile, etc.)
│   │   ├── social.js      # Social features (achievements, leaderboard)
│   │   └── blockchain.js  # Blockchain news features
│   │
│   ├── services/          # Business logic
│   │   ├── matching.js    # Matching algorithm
│   │   ├── user.js        # User management
│   │   └── news.js        # Blockchain news service
│   │
│   └── utils/            # Utility functions
│       ├── timezone.js   # Timezone handling
│       └── validation.js # Input validation
│
├── public/               # Static files
│   ├── icon.png         # Bot icon
│   └── styles/          # CSS styles
│
├── docs/                # Documentation
│   ├── dev-notes.md    # Development notes
│   ├── task-log.md     # Task tracking
│   └── file-tree.md    # This file
│
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env               # Environment variables
└── README.md          # Project documentation
```

## Key Components

### Source Code (`src/`)
- **commands/**: Command handlers for different bot features
- **services/**: Core business logic and algorithms
- **utils/**: Helper functions and utilities

### Static Files (`public/`)
- Bot icon and other static assets
- CSS styles for web interface

### Documentation (`docs/`)
- Development notes and technical details
- Task tracking and progress
- Project structure documentation

### Root Files
- `server.js`: Main application entry point
- `package.json`: Project dependencies and scripts
- `.env`: Environment configuration
- `README.md`: Project overview and setup instructions

## File Descriptions

### Command Handlers
- `core.js`: Basic bot commands (start, profile, skip, stats)
- `social.js`: Social features (achievements, leaderboard)
- `blockchain.js`: Blockchain news and quiz features

### Services
- `matching.js`: User matching algorithm
- `user.js`: User management and tracking
- `news.js`: Blockchain news aggregation

### Utilities
- `timezone.js`: Timezone conversion and validation
- `validation.js`: Input validation and sanitization

### Documentation
- `dev-notes.md`: Technical implementation details
- `task-log.md`: Feature tracking and progress
- `file-tree.md`: Project structure documentation 