/**
 * TimezoneProvider for PingPair ElizaOS integration
 * Handles timezone calculations and compatibility
 */

class TimezoneProvider {
  constructor() {
    this.timezones = {
      'UTC': 0,
      'EST': -5,
      'CST': -6,
      'MST': -7,
      'PST': -8,
      'GMT': 0,
      'CET': 1,
      'EET': 2,
      'IST': 5.5,
      'JST': 9,
      'AEST': 10,
      'NZST': 12
    };
    
    // Map countries to their primary timezone
    this.countryTimezones = {
      'US-East': 'EST',
      'US-Central': 'CST',
      'US-Mountain': 'MST',
      'US-West': 'PST',
      'UK': 'GMT',
      'Germany': 'CET',
      'France': 'CET',
      'India': 'IST',
      'Japan': 'JST',
      'Australia': 'AEST',
      'New Zealand': 'NZST'
    };
  }
  
  /**
   * Gets timezone offset in hours for a given timezone
   */
  getTimezoneOffset(timezone) {
    return this.timezones[timezone] || 0;
  }
  
  /**
   * Gets the primary timezone for a country
   */
  getCountryTimezone(country) {
    return this.countryTimezones[country] || 'UTC';
  }
  
  /**
   * Calculates the hour difference between two timezones
   */
  getHourDifference(timezone1, timezone2) {
    const offset1 = this.getTimezoneOffset(timezone1);
    const offset2 = this.getTimezoneOffset(timezone2);
    
    return Math.abs(offset1 - offset2);
  }
  
  /**
   * Calculates working hours overlap between two users
   * Returns hours of overlap in a standard 9-5 workday
   */
  calculateWorkingHoursOverlap(user1, user2) {
    if (!user1.timezone || !user2.timezone) {
      return 0;
    }
    
    const tz1 = user1.timezone;
    const tz2 = user2.timezone;
    
    const offset1 = this.getTimezoneOffset(tz1);
    const offset2 = this.getTimezoneOffset(tz2);
    
    // Calculate working hours in UTC
    const user1WorkStart = 9 + offset1;  // 9 AM in user1's timezone
    const user1WorkEnd = 17 + offset1;   // 5 PM in user1's timezone
    
    const user2WorkStart = 9 + offset2;  // 9 AM in user2's timezone
    const user2WorkEnd = 17 + offset2;   // 5 PM in user2's timezone
    
    // Calculate overlap
    const overlapStart = Math.max(user1WorkStart, user2WorkStart);
    const overlapEnd = Math.min(user1WorkEnd, user2WorkEnd);
    
    const hoursOverlap = Math.max(0, overlapEnd - overlapStart);
    
    return hoursOverlap;
  }
  
  /**
   * Suggests optimal meeting times for two users
   */
  suggestMeetingTimes(user1, user2) {
    if (!user1.timezone || !user2.timezone) {
      return [];
    }
    
    const tz1 = user1.timezone;
    const tz2 = user2.timezone;
    
    const offset1 = this.getTimezoneOffset(tz1);
    const offset2 = this.getTimezoneOffset(tz2);
    
    const hourDiff = this.getHourDifference(tz1, tz2);
    
    // Calculate working hours in UTC
    const user1WorkStart = 9 + offset1;  // 9 AM in user1's timezone
    const user1WorkEnd = 17 + offset1;   // 5 PM in user1's timezone
    
    const user2WorkStart = 9 + offset2;  // 9 AM in user2's timezone
    const user2WorkEnd = 17 + offset2;   // 5 PM in user2's timezone
    
    // Calculate overlap
    const overlapStart = Math.max(user1WorkStart, user2WorkStart);
    const overlapEnd = Math.min(user1WorkEnd, user2WorkEnd);
    
    const suggestedTimes = [];
    
    if (overlapStart < overlapEnd) {
      // We have a working hours overlap
      const midpoint = Math.floor((overlapStart + overlapEnd) / 2);
      
      // Suggest the middle of the overlap
      suggestedTimes.push({
        utc: midpoint,
        user1Local: midpoint - offset1,
        user2Local: midpoint - offset2
      });
    } else {
      // No working hours overlap
      // Suggest times that might work outside normal hours
      
      // Option 1: User1 stays late
      suggestedTimes.push({
        utc: user2WorkStart,
        user1Local: user2WorkStart - offset1,
        user2Local: 9 // 9 AM for user2
      });
      
      // Option 2: User2 stays late
      suggestedTimes.push({
        utc: user1WorkStart,
        user1Local: 9, // 9 AM for user1
        user2Local: user1WorkStart - offset2
      });
    }
    
    return suggestedTimes;
  }
}

module.exports = new TimezoneProvider(); 