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

PingPair is a social bot that connects people globally through themed, twice-weekly meetups. The bot aims to foster cross-cultural understanding and create an engaged community of globally-minded individuals.

## Features

- **Global Spotlights**: Every 3-4 days, users receive a "Ping Time" message highlighting a different country with cultural facts
- **Interest-Based Matching**: Users are matched based on shared interests in exploring different cultures
- **AI-Generated Profiles**: Brief snapshots of match information to facilitate conversation
- **Video Chat**: Temporary links for real-time connection
- **Strix Points**: A network value system that grows with each completed connection

## Commands

- `/pingpair start` - Begin receiving match pings
- `/pingpair profile` - View and update profile
- `/pingpair skip` - Skip current matching cycle
- `/pingpair stats` - View Strix points and match history
- `/pingpair timezone` - Update timezone preference

## ElizaOS Integration Demo

PingPair includes a demonstration of how ElizaOS concepts can enhance its functionality. The demo showcases:

- Enhanced cultural information
- Improved matching algorithms
- More natural conversation capabilities

### Running the ElizaOS Demo

```bash
# Run the setup script
bash elizaos/setup.sh

# Run the demo
node elizaos/pingpair-eliza-demo.js
```

## Deployment on Render

This bot can be deployed to Render for free using the Node.js environment.

### Prerequisites

1. A Render account
2. DFX installed locally to create an identity

### Deployment Steps

1. Create an identity:
   ```bash
   dfx identity new pingpair_identity
   dfx identity use pingpair_identity
   dfx identity export pingpair_identity > identity.pem
   ```

2. Get your Principal ID:
   ```bash
   dfx identity get-principal
   # Principal ID: ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe
   ```

3. Deploy to Render:
   - Create a new Web Service on Render
   - Connect your repository
   - Use the following settings:
     - Name: `pingpair-bot`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add the following environment variables:
     - `PEM_FILE`: Paste the contents of your identity.pem file
     - `PORT`: 3000

4. After deployment, use your Render URL (e.g., `https://pingpair-bot.onrender.com`) as the bot endpoint.

## OpenChat Registration

To register with OpenChat, you'll need:

1. **Principal ID**: `ovisk-nbx7l-fjqw2-kgmmx-2qlia-s6qcu-yvloi-ejji5-hw5bv-lmcak-dqe`
2. **Bot Name**: `pingpair_bot` (or another unique name with only alphanumeric and underscore)
3. **Bot Endpoint**: Your Render URL (e.g., `https://pingpair-bot.onrender.com`)

Use the `/register_bot` command in OpenChat with these details.

## Development

For development notes, see [docs/dev-notes.md](docs/dev-notes.md).
For task progress, see [docs/task-log.md](docs/task-log.md).

## License

MIT License 