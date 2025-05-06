import { 
    Action, 
    IAgentRuntime, 
    Memory, 
    State, 
    elizaLogger,
    HandlerCallback
} from "@elizaos/core";

interface User {
    userId: string;
    username: string;
    country: string;
    timezone: string;
    interests: string[];
    skills: string[];
    isActive: boolean;
    lastPinged: number;
    lastMatched: number;
}

interface MatchResult {
    user1Id: string;
    user2Id: string;
    spotlightCountry: string;
    meetingLink: string;
    createdAt: number;
}

// Helper function to generate a meeting link
const generateMeetingLink = (): string => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://meet.pingpair.app/${meetingId}`;
};

// Helper function to calculate timezone proximity
const calculateTimezoneProximity = (tz1: string, tz2: string): number => {
    try {
        // Simple implementation - in production, use a proper timezone library
        const hours1 = parseInt(tz1.replace('UTC', ''), 10) || 0;
        const hours2 = parseInt(tz2.replace('UTC', ''), 10) || 0;
        return Math.abs(hours1 - hours2);
    } catch (error) {
        elizaLogger.error("Error calculating timezone proximity:", error);
        return 24; // Maximum difference as fallback
    }
};

// Main matching action for PingPair
export const matchUsersAction: Action = {
    name: "MATCH_USERS",
    similes: ["PAIR_USERS", "CREATE_MATCH", "FIND_PAIRS"],
    description: "Match users based on interests, cultural diversity, and timezone compatibility",
    
    validate: async (
        _runtime: IAgentRuntime,
        _message: Memory
    ): Promise<boolean> => {
        try {
            // In a real implementation, check if there are enough active users to match
            // Here we assume this is always true for simplicity
            return true;
        } catch (error) {
            elizaLogger.error("Error in matchUsersAction.validate:", error);
            return false;
        }
    },
    
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: any,
        callback?: HandlerCallback
    ): Promise<boolean> => {
        try {
            // In a real implementation, this would:
            // 1. Fetch active users from database
            // 2. Apply matching algorithm
            // 3. Store matches in database
            // 4. Notify matched users
            
            // Simulated implementation for demo purposes
            const simulatedMatch: MatchResult = {
                user1Id: "user123",
                user2Id: "user456",
                spotlightCountry: "Japan",
                meetingLink: generateMeetingLink(),
                createdAt: Date.now()
            };
            
            if (callback) {
                callback({
                    text: `Successfully matched users for cultural exchange! Spotlight country: ${simulatedMatch.spotlightCountry}`,
                    content: {
                        success: true,
                        match: simulatedMatch
                    }
                });
            }
            
            elizaLogger.success("Successfully matched users:", simulatedMatch);
            return true;
        } catch (error) {
            elizaLogger.error("Error in matchUsersAction.handler:", error);
            if (callback) {
                callback({
                    text: `Error matching users: ${error.message}`,
                    content: { 
                        success: false,
                        error: error.message 
                    }
                });
            }
            return false;
        }
    },
    
    examples: [
        {
            context: "Weekly matching process",
            messages: [
                {
                    user: "system",
                    content: {
                        text: "It's time for the weekly matching process"
                    }
                }
            ],
            outcome: "Match users based on interests and timezone compatibility"
        }
    ]
}; 