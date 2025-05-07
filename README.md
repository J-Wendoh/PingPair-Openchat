# Create OpenChat Bot

A CLI tool for instantly creating OpenChat bots.

[![npm version](https://img.shields.io/npm/v/create-openchat-bot.svg)](https://www.npmjs.com/package/create-openchat-bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Registering Your Bot](#registering-your-bot)
- [SDK Documentation for Rust bots](#sdk-documentation-for-rust-bots)
- [Bot Types](#bot-types)
- [SDKs](#sdks)
- [Overview](#overview)
- [License](#license)

## Prerequisites

For both onchain and offchain bot, you need to have installed the following tools: 
- [Rust](https://www.rust-lang.org/tools/install)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (for identity management)

## Installation

```bash
npm install -g create-openchat-bot
```

## Usage

```bash
npx create-openchat-bot
```

This will:
1. Ask you which type of bot you want to create (offchain or onchain)
2. Ask for your bot's name
3. Create a new directory with the template
4. Set up the necessary configuration
5. Run the appropriate setup script

## Registering Your Bot

Follow the instructions [here](https://github.com/ICP-HUBS-DevRels-Syndicate/openchat-bots/blob/main/REGISTER-BOT.md) to register your bot with OC and test it out.

> **Note:** This package is in beta mode and currently only supports the Rust SDK. The Motoko and TypeScript SDKs are in the pipeline.

## SDK Documentation for Rust bots: 
You can now check out the SDK documentation for rust bots [here](https://github.com/open-chat-labs/open-chat-bots/tree/main/rs/sdk)

## Bot Types

### Offchain Bot
- Runs on your local machine
- Good for development and testing
- No Internet Computer deployment needed
- Quick setup and iteration

### Onchain Bot
- Deploys to the Internet Computer
- Runs on the blockchain
- More complex setup
- Requires DFX and Internet Computer tools

## SDKs

SDKs are available in different languages: 
- Rust SDK, see the documentation [here](https://github.com/open-chat-labs/open-chat-bots/blob/main/rs/README.md)
- Typescript SDK, see the documentation [here](https://github.com/open-chat-labs/open-chat-bots/blob/main/ts/README.md)
- Motoko SDK, see the documentation [here](https://github.com/open-chat-labs/open-chat-bots/blob/main/motoko/README.md)

## License

MIT License

Copyright (c) 2025 ICP-HUBS-DevRels-Syndicate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# PingPair Bot 🌍✨

A social bot that connects people globally through cultural exchange and blockchain news.

## 🌟 Features

### Core Features
- 🌍 Cultural exchange matching
- ⏰ Timezone-based matching
- 🎯 Interest-based pairing
- 💫 Strix Points reward system
- 🏆 Achievements and badges
- 📊 Leaderboards

### Community Features
- 📢 Community announcements
- 💬 Comment system
- 👍 Reaction support
- 🎯 Point rewards for engagement
- 📋 Announcement sorting

### Blockchain News
- 📰 Country-specific blockchain news
- 📅 Daily blockchain digest
- 🎯 Blockchain knowledge quizzes
- 🔍 Latest blockchain developments

### ElizaOS Integration
- 🤖 Autonomous agent capabilities
- 🧠 Character-driven interactions
- 🔄 Cultural provider integration
- 🔗 Internet Computer deployment
- 🛠️ Custom action handlers

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/J-Wendoh/PingPair-Openchat.git
   cd ping-pair-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. For ElizaOS integration:
   ```bash
   cd elizaos
   npm install
   # Run ElizaOS setup
   bash setup.sh
   ```

## 📚 Documentation

### User Guides
- [Setup Guide](docs/guides/setup.md)
- [Command Guide](docs/guides/commands.md)
- [API Documentation](docs/api/endpoints.md)

### Developer Resources
- [Architecture Overview](docs/dev/architecture.md)
- [Contributing Guide](docs/dev/contributing.md)
- [Project Roadmap](docs/project/roadmap.md)
- [ElizaOS Integration](docs/dev/dev-notes.md)

## 🤖 Commands

### Core Commands
- `/pingpair start` - Begin receiving match pings
- `/pingpair profile` - View and update your profile
- `/pingpair skip` - Skip current matching cycle
- `/pingpair stats` - View your stats and match history
- `/pingpair timezone` - Update your timezone

### Social Features
- `/pingpair achievements` - View available achievements
- `/pingpair leaderboard` - View top users
- `/pingpair announce` - Community announcements
- `/pingpair announce create [title] [content]` - Create new announcement
- `/pingpair announce view [id]` - View announcement details
- `/pingpair announce comment [id] [content]` - Add a comment
- `/pingpair announce react [id] [reaction]` - Add a reaction

### Blockchain News
- `/pingpair blockchain [country]` - Get blockchain news
- `/pingpair digest` - Get daily blockchain digest
- `/pingpair quiz` - Test your blockchain knowledge

## 🏗️ Project Structure

```
ping-pair-bot/
├── src/                      # Source code
│   ├── commands/            # Bot command handlers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── elizaos/                # ElizaOS integration
│   ├── src/                # ElizaOS source code
│   ├── pingpair.character.json # Character definition
│   ├── cultural-provider.ts # Cultural data provider
│   └── match-action.ts     # Match action handler
├── public/                 # Static files
├── docs/                   # Documentation
├── tests/                 # Test files
└── scripts/              # Utility scripts
```

See [File Tree](docs/file-tree.md) for detailed structure.

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `OPENCHAT_PRINCIPAL` - OpenChat principal ID
- `BOT_NAME` - Bot display name
- `BOT_DESCRIPTION` - Bot description
- `PEM_FILE` - Path to identity PEM file for OpenChat authentication

### Deployment
- [Render](https://render.com) configuration in `render.yaml`
- Environment variables in `.env`
- Static files in `public/`
- ElizaOS deployment via Internet Computer

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [Contributing Guide](docs/dev/contributing.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenChat for the platform
- ElizaOS for the autonomous agent framework
- Community contributors
- All our users 