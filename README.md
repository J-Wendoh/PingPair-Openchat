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

# PingPair Bot

PingPair is a cultural exchange bot that connects people from around the world for themed, twice-weekly meetups. The bot helps users discover new perspectives by matching them with someone from a different culture or background.

## Features

- **Global Connections**: Match with users from different countries and cultural backgrounds
- **Cultural Spotlights**: Learn about featured countries and their traditions
- **Strix Points**: Earn points by participating in cultural exchange meetups
- **Profile Management**: Set your interests and timezone for better matches
- **Timezone Awareness**: Get matched with users at convenient times for both parties

## Commands

- `/pingpair start` - Begin receiving match notifications
- `/pingpair profile` - View and update your profile
- `/pingpair skip` - Skip the current matching cycle
- `/pingpair stats` - View your Strix points and match history
- `/pingpair timezone` - Update your timezone preference
- `/pingpair help` - Show available commands

## Setup

### Prerequisites

- Node.js 18.x or higher
- Internet Computer (IC) setup (for canister deployment)
- PEM identity file

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/pingpair-bot.git
   cd pingpair-bot
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy .env.example to .env and configure your environment variables
   ```bash
   cp .env.example .env
   ```

4. Run the server
   ```bash
   npm start
   ```

### OpenChat Registration

To register your bot with OpenChat:

1. Ensure your server is running and publicly accessible
2. In OpenChat, use the command: `/register_bot PingPair https://your-server-url.com`

## Development

### Project Structure

- `server.js` - Main Express server with bot logic
- `src/` - Rust implementation for IC canister
- `public/` - Static files
- `config.toml` - Configuration settings

### Testing

```bash
node test_server.js
```

## License

This project is licensed under the AGPL-3.0 License. See the LICENSE file for details.

## Acknowledgements

- Developed for the OpenChat Botathon
- Uses the OpenChat Bot SDK 