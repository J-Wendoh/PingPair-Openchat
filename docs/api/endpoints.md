# API Endpoints

## Bot Schema Endpoints

### Root Endpoint
```
GET /
```
Returns the bot schema in JSON format when requested with `Accept: application/json` header.

### Schema Endpoint
```
GET /api/v1/schema
```
Returns the bot schema in JSON format.

### Canister Info
```
GET /.well-known/canister-info
```
Returns the OpenChat principal ID.

### IC Domains
```
GET /.well-known/ic-domains
```
Returns the domain name for OpenChat verification.

## Webhook Endpoint

### OpenChat Webhook
```
POST /openchat-webhook
```
Handles incoming messages from OpenChat.

#### Request Format
```json
{
  "type": "message",
  "content": {
    "text": "/pingpair command [args]"
  },
  "sender": {
    "userId": "user123"
  }
}
```

#### Response Format
```json
{
  "text": "Response message",
  "error": null
}
```

## Command Endpoints

### Core Commands
- `/pingpair start` - Begin receiving match pings
- `/pingpair profile` - View and update profile
- `/pingpair skip` - Skip current matching cycle
- `/pingpair stats` - View stats and match history
- `/pingpair timezone` - Update timezone

### Social Features
- `/pingpair achievements` - View achievements
- `/pingpair leaderboard` - View top users
- `/pingpair announce` - Community announcements
- `/pingpair announce create [title] [content]` - Create announcement
- `/pingpair announce view [id]` - View announcement
- `/pingpair announce comment [id] [content]` - Add comment
- `/pingpair announce react [id] [reaction]` - Add reaction

### Blockchain News
- `/pingpair blockchain [country]` - Get blockchain news
- `/pingpair digest` - Get daily digest
- `/pingpair quiz` - Take blockchain quiz

## Response Codes

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user

## Authentication

No authentication required for public endpoints. OpenChat handles user authentication.

## CORS

- Allowed Origins: `*`
- Allowed Methods: `GET, POST, OPTIONS`
- Allowed Headers: `Content-Type, Accept` 