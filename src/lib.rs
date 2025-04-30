use candid::CandidType;
use ic_cdk::{query, update};
use serde::{Deserialize, Serialize};

// Import our modules
mod api;
mod model;

// Main message handler endpoint
#[update]
pub async fn handle_message(message: api::handlers::Message, context: api::handlers::Context) -> String {
    api::handlers::handle_message(message, context).await
}

// Main command handler endpoint
#[update]
pub async fn process_command(
    message: api::handlers::Message,
    context: api::handlers::Context,
    command: String,
    args: Vec<String>,
) -> String {
    api::handlers::handle_command(message, context, command, args).await
}

// Simulate ping time for testing
#[update]
pub async fn simulate_ping_time() -> String {
    // Get available countries
    let spotlights = vec![
        ("Kenya", "🇰🇪", vec!["Home to over 40 ethnic groups", "Birthplace of marathon champions", "Famous for wildlife safaris"]),
        ("India", "🇮🇳", vec!["World's largest democracy", "Home to Bollywood", "Known for diverse cuisine and spices"]),
        ("Brazil", "🇧🇷", vec!["Famous for Carnival and samba", "Home to most of the Amazon rainforest", "Soccer is a national passion"]),
    ];
    
    // Select a random country
    let spotlight_index = (ic_cdk::api::time() as usize) % spotlights.len();
    let (country, emoji, facts) = &spotlights[spotlight_index];
    
    // Format facts as bullet points
    let facts_formatted = facts.iter()
        .map(|fact| format!("- {}", fact))
        .collect::<Vec<String>>()
        .join("\n");
    
    format!(r#"
# It's Ping Time! 🌍

### Global Spotlight: {} {}

**Fun Facts:**
{}

Would you love to meet someone from {} or someone interested in exploring {}?

Reply with `yes` to be matched with someone for a cultural exchange!
    "#, 
    country, 
    emoji,
    facts_formatted,
    country,
    country)
}

// Simple info and version endpoints required by OpenChat Bot SDK
#[query]
fn get_info() -> String {
    "PingPair Bot - Connect with people globally through themed meetups".to_string()
}

#[query]
fn get_version() -> String {
    "1.0.0".to_string()
}

// Instead of using export_candid, we'll use a different approach
// Manually define the Candid interface if needed later 