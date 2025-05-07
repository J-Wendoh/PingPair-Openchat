/**
 * CreateMatch action for PingPair ElizaOS integration
 * Creates a match between two users based on their interests and timezone compatibility
 */

const culturalProvider = require('../providers/cultural');
const timezoneProvider = require('../providers/timezone');

/**
 * Creates a match between two users
 * @param {Object} user1 - First user to match
 * @param {Object} user2 - Second user to match
 * @returns {Object} Match details
 */
async function createMatch(user1, user2) {
  // Validate inputs
  if (!user1 || !user2) {
    throw new Error('Both users are required to create a match');
  }
  
  // Check for required fields
  if (!user1.id || !user2.id) {
    throw new Error('Both users must have valid IDs');
  }
  
  // Calculate timezone compatibility
  let hoursOverlap = 0;
  if (user1.timezone && user2.timezone) {
    hoursOverlap = timezoneProvider.calculateWorkingHoursOverlap(user1, user2);
  }
  
  // Calculate cultural compatibility
  const { score: culturalScore, commonTopics } = 
    culturalProvider.calculateCompatibility(user1, user2);
  
  // Calculate overall match score based on timezone and cultural compatibility
  // Weight timezone compatibility higher as it's more important for scheduling
  const overallScore = (hoursOverlap / 8 * 0.7) + (culturalScore * 0.3);
  
  // Get conversation starters
  const conversationStarters = 
    culturalProvider.suggestConversationStarters(user1, user2);
  
  // Get suggested meeting times
  const meetingTimes = timezoneProvider.suggestMeetingTimes(user1, user2);
  
  // Create match object
  const match = {
    id: `match_${Date.now()}_${user1.id}_${user2.id}`,
    users: [user1.id, user2.id],
    created: new Date().toISOString(),
    score: {
      overall: overallScore,
      timezone: hoursOverlap / 8, // Normalize to 0-1 scale
      cultural: culturalScore
    },
    details: {
      commonTopics,
      conversationStarters,
      suggestedMeetingTimes: meetingTimes
    }
  };
  
  return match;
}

module.exports = createMatch; 