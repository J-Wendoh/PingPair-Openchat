/**
 * PingPair ElizaOS Integration
 * Main entry point for the ElizaOS integration
 */

const fs = require('fs');
const path = require('path');
const culturalProvider = require('./data/providers/cultural');
const timezoneProvider = require('./data/providers/timezone');
const createMatch = require('./data/actions/createMatch');
const scheduleSession = require('./data/actions/scheduleSession');

// Load character configuration
let characterConfig = {};
try {
  const configPath = path.join(__dirname, 'pingpair.character.json');
  if (fs.existsSync(configPath)) {
    characterConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    console.warn('Character configuration file not found');
  }
} catch (error) {
  console.error('Error loading character configuration:', error);
}

/**
 * ElizaOS integration class for PingPair
 */
class PingPairElizaOS {
  constructor() {
    this.culturalProvider = culturalProvider;
    this.timezoneProvider = timezoneProvider;
    this.createMatch = createMatch;
    this.scheduleSession = scheduleSession;
    this.character = characterConfig;
  }

  /**
   * Gets the character configuration
   */
  getCharacterConfig() {
    return this.character;
  }

  /**
   * Creates a user object compatible with ElizaOS
   */
  createUser(userData) {
    return {
      id: userData.id || `user_${Date.now()}`,
      name: userData.name || 'Anonymous',
      country: userData.country || 'Unknown',
      timezone: userData.timezone || 'UTC',
      interests: userData.interests || []
    };
  }

  /**
   * Gets suggested conversation starters for two users
   */
  getConversationStarters(user1, user2) {
    return this.culturalProvider.suggestConversationStarters(user1, user2);
  }

  /**
   * Gets cultural information for a country
   */
  getCulturalInfo(country) {
    return this.culturalProvider.getCulturalInfo(country);
  }

  /**
   * Gets timezone information for a timezone code
   */
  getTimezoneInfo(timezone) {
    return {
      code: timezone,
      offset: this.timezoneProvider.getTimezoneOffset(timezone)
    };
  }

  /**
   * Creates a match between two users
   */
  async matchUsers(user1, user2) {
    const u1 = typeof user1 === 'object' ? user1 : { id: user1 };
    const u2 = typeof user2 === 'object' ? user2 : { id: user2 };
    
    return await this.createMatch(u1, u2);
  }

  /**
   * Schedules a session for a match
   */
  async scheduleMatchSession(match, options = {}) {
    return await this.scheduleSession(match, options);
  }

  /**
   * Calculates timezone compatibility between two users
   */
  getTimezoneCompatibility(user1, user2) {
    const hoursOverlap = this.timezoneProvider.calculateWorkingHoursOverlap(user1, user2);
    const hourDifference = this.timezoneProvider.getHourDifference(
      user1.timezone || 'UTC',
      user2.timezone || 'UTC'
    );
    
    return {
      hoursOverlap,
      hourDifference,
      compatibilityScore: hoursOverlap / 8 // Normalize to 0-1
    };
  }

  /**
   * Calculates cultural compatibility between two users
   */
  getCulturalCompatibility(user1, user2) {
    return this.culturalProvider.calculateCompatibility(user1, user2);
  }

  /**
   * Suggests optimal meeting times for two users
   */
  suggestMeetingTimes(user1, user2) {
    return this.timezoneProvider.suggestMeetingTimes(user1, user2);
  }
}

// Export singleton instance
module.exports = new PingPairElizaOS(); 