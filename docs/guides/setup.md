# Setup Guide

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Git
- OpenChat account
- Render.com account (for deployment)

## Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/J-Wendoh/PingPair-Openchat.git
   cd ping-pair-bot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   OPENCHAT_PRINCIPAL=your-principal-id
   BOT_NAME=PingPair
   BOT_DESCRIPTION="Connect globally through cultural exchange"
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## OpenChat Integration

1. **Get Principal ID**
   - Deploy to Render.com
   - Access `/.well-known/canister-info` endpoint
   - Copy the principal ID

2. **Register Bot**
   - Go to OpenChat
   - Use the following details:
     - Principal ID: From canister-info
     - Bot Name: "PingPair"
     - Endpoint: Your deployed URL
     - Community: "Social & Cultural Exchange"

3. **Verify Integration**
   - Test the bot with `/pingpair start`
   - Check webhook responses
   - Verify schema endpoint

## Deployment

1. **Render.com Setup**
   - Create new Web Service
   - Connect GitHub repository
   - Set environment variables
   - Deploy

2. **Environment Variables**
   ```env
   PORT=3000
   NODE_ENV=production
   OPENCHAT_PRINCIPAL=your-principal-id
   BOT_NAME=PingPair
   BOT_DESCRIPTION="Connect globally through cultural exchange"
   ```

3. **Verify Deployment**
   - Check health endpoint
   - Test bot commands
   - Monitor logs

## Testing

1. **Run Tests**
   ```bash
   npm test
   ```

2. **Test Commands**
   ```bash
   # Test core commands
   curl -X POST http://localhost:3000/openchat-webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"message","content":{"text":"/pingpair start"},"sender":{"userId":"test123"}}'
   ```

## Troubleshooting

### Common Issues

1. **Webhook Not Working**
   - Check OpenChat configuration
   - Verify endpoint URL
   - Check server logs

2. **Schema Error**
   - Verify schema endpoint
   - Check JSON format
   - Clear OpenChat cache

3. **Deployment Issues**
   - Check Render logs
   - Verify environment variables
   - Check build process

### Support

For additional help:
- Check [API Documentation](api/endpoints.md)
- Review [Command Guide](commands.md)
- Open an issue on GitHub 