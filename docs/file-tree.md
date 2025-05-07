# Project Structure

```
ping-pair-bot/
├── src/                      # Source code
│   ├── commands/            # Bot command handlers
│   │   ├── core/           # Core commands (start, profile, etc.)
│   │   ├── social/         # Social features (announcements, etc.)
│   │   └── blockchain/     # Blockchain news features
│   ├── services/           # Business logic services
│   │   ├── matching/       # Matching algorithm
│   │   ├── achievements/   # Achievement system
│   │   └── blockchain/     # Blockchain news service
│   ├── utils/              # Utility functions
│   │   ├── timezone.js     # Timezone handling
│   │   ├── points.js       # Points calculation
│   │   └── validation.js   # Input validation
│   └── config/             # Configuration files
│       ├── constants.js    # Bot constants
│       └── countries.js    # Country data
├── public/                 # Static files
│   ├── images/            # Bot images and icons
│   └── assets/            # Other static assets
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   │   ├── endpoints.md   # API endpoints
│   │   └── schemas.md     # Data schemas
│   ├── guides/            # User guides
│   │   ├── setup.md       # Setup guide
│   │   └── commands.md    # Command guide
│   ├── dev/               # Developer documentation
│   │   ├── architecture.md # System architecture
│   │   └── contributing.md # Contributing guide
│   └── project/           # Project documentation
│       ├── roadmap.md     # Project roadmap
│       └── changelog.md   # Version history
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── scripts/              # Utility scripts
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Node.js dependencies
├── README.md           # Project overview
└── server.js           # Main server file
```

## Key Components

### Source Code (`src/`)
- **Commands**: Bot command handlers organized by feature
- **Services**: Core business logic and algorithms
- **Utils**: Reusable utility functions
- **Config**: Configuration and constant definitions

### Documentation (`docs/`)
- **API**: API documentation and schemas
- **Guides**: User and setup guides
- **Dev**: Developer documentation
- **Project**: Project management docs

### Static Files (`public/`)
- Bot images and icons
- Static assets for web interface

### Tests (`tests/`)
- Unit tests for individual components
- Integration tests for features

## File Purposes

### Core Files
- `server.js`: Main application entry point
- `package.json`: Project dependencies and scripts
- `.env.example`: Environment variable template
- `README.md`: Project overview and setup guide

### Documentation
- `docs/api/`: API documentation and schemas
- `docs/guides/`: User guides and tutorials
- `docs/dev/`: Developer documentation
- `docs/project/`: Project management docs

### Configuration
- `src/config/`: Application configuration
- `.env`: Environment variables (not in repo)
- `render.yaml`: Deployment configuration 