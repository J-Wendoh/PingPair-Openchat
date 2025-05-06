import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger
} from "@elizaos/core";

interface CountryInfo {
    name: string;
    flag: string;
    facts: string[];
    traditions: string[];
    languages: string[];
    funFacts: string[];
}

// Sample country data - in a real implementation, this would come from a database or API
const countryData: Record<string, CountryInfo> = {
    "Japan": {
        name: "Japan",
        flag: "🇯🇵",
        facts: [
            "Island nation in East Asia",
            "Population of about 125 million",
            "Known for technological innovation and ancient traditions"
        ],
        traditions: [
            "Tea ceremonies (Chado)",
            "Cherry blossom (Sakura) viewing",
            "Traditional arts like origami and calligraphy"
        ],
        languages: ["Japanese"],
        funFacts: [
            "There are more than 200 volcanoes in Japan",
            "Japan has one of the world's lowest crime rates",
            "Slurping noodles is considered polite and shows appreciation"
        ]
    },
    "Kenya": {
        name: "Kenya",
        flag: "🇰🇪",
        facts: [
            "East African nation known for wildlife and scenery",
            "Population of about 54 million",
            "Home to the Great Rift Valley and Lake Victoria"
        ],
        traditions: [
            "Maasai traditional jumping dance (Adumu)",
            "Elaborate beadwork and jewelry crafting",
            "Storytelling as a form of preserving history"
        ],
        languages: ["Swahili", "English", "and over 60 local languages"],
        funFacts: [
            "Kenya is home to over 50 national parks and reserves",
            "The word 'safari' originated from the Swahili word for journey",
            "Kenya has produced many of the world's greatest long-distance runners"
        ]
    },
    "Brazil": {
        name: "Brazil",
        flag: "🇧🇷",
        facts: [
            "Largest country in South America",
            "Population of about 213 million",
            "Home to a significant portion of the Amazon rainforest"
        ],
        traditions: [
            "Carnival celebrations",
            "Capoeira - a martial art combining elements of dance and music",
            "Samba music and dance"
        ],
        languages: ["Portuguese"],
        funFacts: [
            "Brazil is the world's largest coffee producer",
            "The Amazon River discharges more water than the next eight largest rivers combined",
            "Brazil has more species of monkeys than anywhere else in the world"
        ]
    }
};

// Get a random country from the dataset
const getRandomCountry = (): CountryInfo => {
    const countries = Object.keys(countryData);
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countryData[countries[randomIndex]];
};

// Get country information based on name
const getCountryInfo = (countryName: string): CountryInfo | null => {
    // Case-insensitive search
    const normalizedName = countryName.toLowerCase();
    
    for (const key in countryData) {
        if (key.toLowerCase() === normalizedName) {
            return countryData[key];
        }
    }
    
    return null;
};

// Format country information as a string
const formatCountryInfo = (country: CountryInfo): string => {
    return `
# Country Spotlight: ${country.name} ${country.flag}

## Fun Facts
${country.funFacts.map(fact => `- ${fact}`).join('\n')}

## Traditions
${country.traditions.map(tradition => `- ${tradition}`).join('\n')}

## Languages
${country.languages.join(', ')}

This information can be shared with users during cultural exchange conversations to spark discussion and learning.
    `.trim();
};

// The Cultural Information Provider
export const culturalProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string | null> => {
        try {
            // Check if there's a specific country mentioned in the message
            const messageText = _message.content.text.toLowerCase();
            
            // Extract country names from the message
            let countryInfo: CountryInfo | null = null;
            
            for (const country in countryData) {
                if (messageText.includes(country.toLowerCase())) {
                    countryInfo = countryData[country];
                    break;
                }
            }
            
            // If no specific country is mentioned, get a random one
            if (!countryInfo) {
                countryInfo = getRandomCountry();
            }
            
            return formatCountryInfo(countryInfo);
        } catch (error) {
            elizaLogger.error("Error in culturalProvider:", error);
            return "Unable to retrieve cultural information at this time.";
        }
    }
}; 