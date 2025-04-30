use oc_bots_sdk::api::command::CommandHandler;
use oc_bots_sdk::api::command::{SuccessResult, CommandResponse};
use oc_bots_sdk::api::definition::BotCommandDefinition;
use oc_bots_sdk::oc_api::client::Client;
use oc_bots_sdk::types::BotCommandContext;
use oc_bots_sdk_offchain::AgentRuntime;
use std::sync::OnceLock;
use async_trait::async_trait;

use crate::api;

pub struct PingPairCommand;

static DEFINITION: OnceLock<BotCommandDefinition> = OnceLock::new();

#[async_trait]
impl CommandHandler<AgentRuntime> for PingPairCommand {
    fn name(&self) -> &'static str {
        "pingpair"
    }

    fn definition(&self) -> &BotCommandDefinition {
        DEFINITION.get_or_init(|| {
            BotCommandDefinition {
                name: String::from("pingpair"),
                description: Some(String::from("Connect with people globally through themed meetups")),
                placeholder: Some(String::from("command")),
                params: vec![],
                permissions: Default::default(),
                default_role: None,
                direct_messages: Some(true),
            }
        })
    }

    async fn execute(&self, oc_client: Client<AgentRuntime, BotCommandContext>) -> Result<SuccessResult, String> {
        let ctx = oc_client.context();
        let user_id = ctx.sender.user_id.to_string();
        let username = ctx.sender.username.to_string();
        let args = &ctx.command.args;
        
        let result = if args.is_empty() {
            api::handlers::get_help_menu()
        } else {
            let subcommand = &args[0].name;
            
            match subcommand.as_str() {
                "start" => api::handlers::handle_start_command(user_id, username),
                "profile" => api::handlers::handle_profile_command(user_id, username, args.iter().map(|a| a.name.clone()).collect()),
                "skip" => api::handlers::handle_skip_command(user_id, username),
                "stats" => api::handlers::handle_stats_command(user_id, username),
                "timezone" => api::handlers::handle_timezone_command(user_id, username, args.iter().map(|a| a.name.clone()).collect()),
                "ping" => simulate_ping_time(),
                _ => "Unknown subcommand. Try `/pingpair` for help.".to_string(),
            }
        };
        
        Ok(SuccessResult {
            text_response: Some(result),
            ..Default::default()
        })
    }
}

// Test function to simulate ping time
fn simulate_ping_time() -> String {
    // Get available countries
    let spotlights = vec![
        ("Kenya", "🇰🇪", vec!["Home to over 40 ethnic groups", "Birthplace of marathon champions", "Famous for wildlife safaris"]),
        ("India", "🇮🇳", vec!["World's largest democracy", "Home to Bollywood", "Known for diverse cuisine and spices"]),
        ("Brazil", "🇧🇷", vec!["Famous for Carnival and samba", "Home to most of the Amazon rainforest", "Soccer is a national passion"]),
    ];
    
    // Select a random country
    let spotlight_index = (std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize) % spotlights.len();
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