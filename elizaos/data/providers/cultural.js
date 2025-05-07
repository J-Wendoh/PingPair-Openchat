/**
 * CulturalProvider for PingPair ElizaOS integration
 * Provides cultural information and compatibility metrics
 */

class CulturalProvider {
  constructor() {
    this.cultures = {
      'US': {
        timeFormat: '12h',
        greeting: 'Hi there!',
        topics: ['technology', 'sports', 'movies', 'business', 'politics']
      },
      'UK': {
        timeFormat: '24h',
        greeting: 'Hello!',
        topics: ['literature', 'sports', 'travel', 'current events', 'music']
      },
      'Japan': {
        timeFormat: '24h',
        greeting: 'こんにちは (Konnichiwa)!',
        topics: ['anime', 'technology', 'food', 'travel', 'arts']
      },
      'India': {
        timeFormat: '12h',
        greeting: 'Namaste!',
        topics: ['cricket', 'technology', 'food', 'cinema', 'business']
      },
      'Brazil': {
        timeFormat: '24h',
        greeting: 'Olá!',
        topics: ['football', 'music', 'food', 'travel', 'arts']
      }
    };
  }

  /**
   * Gets cultural information for a specific country
   */
  getCulturalInfo(country) {
    return this.cultures[country] || null;
  }

  /**
   * Calculates cultural compatibility between two users
   */
  calculateCompatibility(user1, user2) {
    if (!user1.country || !user2.country) {
      return { score: 0.5, commonTopics: [] };
    }

    const culture1 = this.cultures[user1.country];
    const culture2 = this.cultures[user2.country];

    if (!culture1 || !culture2) {
      return { score: 0.5, commonTopics: [] };
    }

    // Find common topics
    const commonTopics = culture1.topics.filter(topic => 
      culture2.topics.includes(topic)
    );

    // Calculate compatibility score (0-1)
    const score = commonTopics.length / Math.max(culture1.topics.length, culture2.topics.length);

    return {
      score,
      commonTopics
    };
  }

  /**
   * Suggests conversation starters based on cultural backgrounds
   */
  suggestConversationStarters(user1, user2) {
    const { commonTopics } = this.calculateCompatibility(user1, user2);
    
    const starters = [];
    
    if (commonTopics.includes('technology')) {
      starters.push("What's your favorite tech gadget you've used recently?");
    }
    
    if (commonTopics.includes('food')) {
      starters.push("What's a traditional dish from your country that you'd recommend trying?");
    }
    
    if (commonTopics.includes('travel')) {
      starters.push("What's one place in your country that you'd recommend visiting?");
    }
    
    if (commonTopics.includes('sports')) {
      starters.push("What sports are popular in your country?");
    }
    
    // Add general starters if we don't have enough topic-specific ones
    if (starters.length < 3) {
      starters.push("How does your typical workday differ from others around the world?");
      starters.push("What's something about your culture that you wish more people knew about?");
      starters.push("What holidays or festivals are most important in your culture?");
    }
    
    return starters;
  }
}

module.exports = new CulturalProvider(); 