use crate::model::types::{Country, PingPairState};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// Default countries with data
pub fn get_default_countries() -> HashMap<String, Country> {
    let mut countries = HashMap::new();
    
    // Add Kenya
    countries.insert(
        "Kenya".to_string(),
        Country {
            name: "Kenya".to_string(),
            fun_facts: vec![
                "Home to over 40 ethnic groups".to_string(),
                "Birthplace of marathon champions".to_string(),
                "Famous for wildlife safaris".to_string(),
                "Has the Great Rift Valley".to_string(),
                "Home to the Maasai Mara National Reserve".to_string(),
            ],
            continent: "Africa".to_string(),
            flag: "🇰🇪".to_string(),
            traditions: vec![
                "Maasai jumping dance".to_string(),
                "Kikuyu circumcision ceremonies".to_string(),
                "Samburu wedding ceremonies".to_string(),
            ],
            languages: vec!["Swahili".to_string(), "English".to_string()],
            available: true,
            population: 53_700_000,
            capital: "Nairobi".to_string(),
            currency: "Kenyan Shilling".to_string(),
        },
    );
    
    // Add India
    countries.insert(
        "India".to_string(),
        Country {
            name: "India".to_string(),
            fun_facts: vec![
                "World's largest democracy".to_string(),
                "Home to Bollywood".to_string(),
                "Known for diverse cuisine and spices".to_string(),
                "Birthplace of four major religions".to_string(),
                "Has the third-largest Muslim population".to_string(),
            ],
            continent: "Asia".to_string(),
            flag: "🇮🇳".to_string(),
            traditions: vec![
                "Diwali festival of lights".to_string(),
                "Holi color festival".to_string(),
                "Classical dance forms like Bharatanatyam".to_string(),
            ],
            languages: vec!["Hindi".to_string(), "English".to_string(), "Bengali".to_string(), "Tamil".to_string()],
            available: true,
            population: 1_380_000_000,
            capital: "New Delhi".to_string(),
            currency: "Indian Rupee".to_string(),
        },
    );
    
    // Add Brazil
    countries.insert(
        "Brazil".to_string(),
        Country {
            name: "Brazil".to_string(),
            fun_facts: vec![
                "Famous for Carnival and samba".to_string(),
                "Home to most of the Amazon rainforest".to_string(),
                "Soccer is a national passion".to_string(),
                "World's largest producer of coffee".to_string(),
                "Home to the Christ the Redeemer statue".to_string(),
            ],
            continent: "South America".to_string(),
            flag: "🇧🇷".to_string(),
            traditions: vec![
                "Carnival celebrations".to_string(),
                "Capoeira martial art".to_string(),
                "Festa Junina harvest festival".to_string(),
            ],
            languages: vec!["Portuguese".to_string()],
            available: true,
            population: 212_600_000,
            capital: "Brasília".to_string(),
            currency: "Brazilian Real".to_string(),
        },
    );
    
    countries
}

// Search for country information and add to the state
pub async fn search_country_info(country_name: &str, state: &mut PingPairState) -> Result<Country, String> {
    // Check if country already exists in our database
    if let Some(country) = state.countries.get(country_name) {
        return Ok(country.clone());
    }
    
    // In a real implementation, we would make an API call to get country data
    // For this example, we'll simulate with some hardcoded data for common countries
    let country = match country_name.to_lowercase().as_str() {
        "usa" | "united states" | "america" | "united states of america" => {
            Country {
                name: "United States".to_string(),
                fun_facts: vec![
                    "Has 50 states and numerous territories".to_string(),
                    "World's largest economy".to_string(),
                    "Home to Hollywood".to_string(),
                    "Known for diverse landscapes from deserts to forests".to_string(),
                ],
                continent: "North America".to_string(),
                flag: "🇺🇸".to_string(),
                traditions: vec![
                    "Thanksgiving celebrations".to_string(),
                    "Independence Day fireworks".to_string(),
                    "Super Bowl Sunday".to_string(),
                ],
                languages: vec!["English".to_string(), "Spanish".to_string()],
                available: true,
                population: 331_000_000,
                capital: "Washington, D.C.".to_string(),
                currency: "US Dollar".to_string(),
            }
        },
        "japan" => {
            Country {
                name: "Japan".to_string(),
                fun_facts: vec![
                    "Island nation with over 6,800 islands".to_string(),
                    "Home to Mount Fuji".to_string(),
                    "Known for anime, manga and video games".to_string(),
                    "Has the world's oldest company (founded 578 AD)".to_string(),
                ],
                continent: "Asia".to_string(),
                flag: "🇯🇵".to_string(),
                traditions: vec![
                    "Cherry blossom viewing (Hanami)".to_string(),
                    "Tea ceremonies".to_string(),
                    "Sumo wrestling".to_string(),
                ],
                languages: vec!["Japanese".to_string()],
                available: true,
                population: 126_300_000,
                capital: "Tokyo".to_string(),
                currency: "Japanese Yen".to_string(),
            }
        },
        // Add more hardcoded countries as needed
        _ => {
            // For unknown countries, create a generic entry
            // In a real implementation, this would call an external API
            Country {
                name: country_name.to_string(),
                fun_facts: vec![
                    "A wonderful country to discover!".to_string(),
                    "Has unique customs and traditions".to_string(),
                ],
                continent: "Unknown".to_string(), // Would be determined by API
                flag: "🏳️".to_string(), // Default flag
                traditions: vec![
                    "Various cultural traditions".to_string(),
                ],
                languages: vec!["Unknown".to_string()],
                available: true,
                population: 0, // Would be filled by API
                capital: "Unknown".to_string(), // Would be filled by API
                currency: "Unknown".to_string(), // Would be filled by API
            }
        }
    };
    
    // Add the country to our database
    state.countries.insert(country.name.clone(), country.clone());
    
    Ok(country)
}

// Update country availability based on user profiles
pub fn update_country_availability(state: &mut PingPairState) {
    // Get all countries that have users
    let countries_with_users: Vec<String> = state.users
        .values()
        .map(|user| user.country.clone())
        .collect();
    
    // Update availability status
    for (country_name, country) in state.countries.iter_mut() {
        country.available = countries_with_users.contains(country_name);
    }
}

// Get a list of available countries (those with users)
pub fn get_available_countries(state: &PingPairState) -> Vec<Country> {
    state.countries
        .values()
        .filter(|country| country.available)
        .cloned()
        .collect()
}

// Simulates getting country spotlight for ping time
pub fn get_country_spotlight(state: &PingPairState) -> Country {
    let available_countries = get_available_countries(state);
    
    if available_countries.is_empty() {
        // If no countries are available, use default ones
        let default_countries = get_default_countries();
        let default_keys: Vec<&String> = default_countries.keys().collect();
        let random_index = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as usize % default_keys.len();
        
        return default_countries[default_keys[random_index]].clone();
    }
    
    // Select a random available country
    let random_index = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize % available_countries.len();
    
    available_countries[random_index].clone()
} 