# Development Notes

## Architecture Overview

### Core Components
1. **Server (server.js)**
   - Express.js server
   - OpenChat webhook handler
   - Command router
   - User management

2. **Command Handlers**
   - Core commands (start, profile, skip, stats)
   - Social features (achievements, leaderboard)
   - Blockchain news features

3. **Services**
   - Matching algorithm
   - User tracking
   - Achievement system
   - Blockchain news aggregation

### Data Structures

#### User Object
```javascript
{
  userId: string,
  strixPoints: number,
  isActive: boolean,
  timezone: string,
  interests: string[],
  matchHistory: Match[],
  lastActive: number,
  streak: number,
  achievements: Achievement[],
  favoriteCountries: string[],
  culturalFacts: Set<string>,
  traditions: Set<string>,
  badges: string[],
  level: number,
  xp: number
}
```

#### Match Object
```javascript
{
  matchId: string,
  user1Id: string,
  user2Id: string,
  country: string,
  meetingLink: string,
  createdAt: number,
  isCompleted: boolean,
  culturalFacts: string[],
  traditions: string[],
  iceBreakers: string[]
}
```

#### Announcement Object
```javascript
{
  id: number,
  title: string,
  content: string,
  type: string,
  createdAt: number,
  reactions: Map<string, Set<string>>,
  comments: Array<{
    id: number,
    userId: string,
    content: string,
    createdAt: number
  }>
}
```

## Technical Decisions

### 1. Matching Algorithm
- Timezone-based filtering (±2 hours)
- Interest matching with weighted scoring
- Cultural compatibility calculation
- Streak and time-based bonuses

### 2. Achievement System
- Progressive achievement unlocking
- Multiple achievement categories
- Point rewards for completion
- Badge system for visual feedback

### 3. Blockchain News Integration
- Country-specific news aggregation
- Daily digest generation
- Interactive quiz system
- Point rewards for engagement

### 4. Community Announcements
- In-memory storage for quick access
- Real-time reactions and comments
- Point rewards for engagement
- Chronological sorting
- Reaction aggregation

## Performance Considerations

1. **Memory Management**
   - User data stored in memory for quick access
   - Regular cleanup of inactive users
   - Efficient data structures for matching
   - Announcement caching for frequent access

2. **Response Time**
   - Optimized matching algorithm
   - Cached country data
   - Efficient command routing

3. **Scalability**
   - Stateless design where possible
   - Modular command handlers
   - Easy to add new features

## Security Measures

1. **User Data**
   - Minimal data storage
   - No sensitive information
   - Temporary match data

2. **API Security**
   - CORS configuration
   - Input validation
   - Rate limiting

## Future Improvements

1. **Technical**
   - Database integration
   - Real-time news updates
   - Enhanced matching algorithm
   - More blockchain sources

2. **Features**
   - More countries
   - Advanced achievements
   - Group matching
   - Language preferences

3. **User Experience**
   - Better error handling
   - More interactive commands
   - Enhanced feedback system
   - Customizable notifications 