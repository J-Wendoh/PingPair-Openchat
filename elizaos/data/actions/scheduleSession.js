/**
 * ScheduleSession action for PingPair ElizaOS integration
 * Schedules a session between matched users
 */

const timezoneProvider = require('../providers/timezone');

/**
 * Generates a meeting link
 * @param {string} sessionId - Session ID to include in link
 * @returns {string} Meeting link
 */
function generateMeetingLink(sessionId) {
  return `https://meet.pingpair.com/${sessionId}`;
}

/**
 * Formats a time for display
 * @param {number} hour - Hour in 24-hour format
 * @param {string} timezone - Timezone code
 * @returns {string} Formatted time string
 */
function formatTime(hour, timezone) {
  const isPM = hour >= 12;
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${hour12}:00 ${isPM ? 'PM' : 'AM'} ${timezone}`;
}

/**
 * Schedules a session between matched users
 * @param {Object} match - Match object from createMatch
 * @param {Object} options - Scheduling options
 * @returns {Object} Scheduled session details
 */
async function scheduleSession(match, options = {}) {
  if (!match || !match.users || match.users.length !== 2) {
    throw new Error('Valid match with two users is required');
  }
  
  const [user1Id, user2Id] = match.users;
  
  // Validate users exist in the system
  if (!user1Id || !user2Id) {
    throw new Error('Valid user IDs are required');
  }
  
  // Use suggested meeting time from match, or get a new suggestion
  let meetingTime;
  
  if (options.selectedTimeIndex !== undefined && 
      match.details.suggestedMeetingTimes && 
      match.details.suggestedMeetingTimes[options.selectedTimeIndex]) {
    // Use the selected time from the suggestions
    meetingTime = match.details.suggestedMeetingTimes[options.selectedTimeIndex];
  } else if (match.details.suggestedMeetingTimes && match.details.suggestedMeetingTimes.length > 0) {
    // Default to the first suggested time
    meetingTime = match.details.suggestedMeetingTimes[0];
  } else {
    throw new Error('No suitable meeting time available');
  }
  
  // Generate a unique session ID
  const sessionId = `session_${Date.now()}_${user1Id}_${user2Id}`;
  
  // Generate meeting link
  const meetingLink = generateMeetingLink(sessionId);
  
  // Create the session object
  const session = {
    id: sessionId,
    matchId: match.id,
    users: [user1Id, user2Id],
    scheduled: {
      utc: meetingTime.utc,
      user1Local: meetingTime.user1Local,
      user2Local: meetingTime.user2Local
    },
    meetingLink,
    created: new Date().toISOString(),
    status: 'scheduled'
  };
  
  // Add formatted time strings for display
  session.displayTimes = {
    user1: formatTime(meetingTime.user1Local, options.user1?.timezone || 'UTC'),
    user2: formatTime(meetingTime.user2Local, options.user2?.timezone || 'UTC'),
  };
  
  // Include conversation starters if available
  if (match.details && match.details.conversationStarters) {
    session.conversationStarters = match.details.conversationStarters;
  }
  
  return session;
}

module.exports = scheduleSession; 