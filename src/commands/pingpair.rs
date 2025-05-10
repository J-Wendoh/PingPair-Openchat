use oc_bots_sdk::api::command::CommandHandler;
use oc_bots_sdk::api::command::SuccessResult;
use oc_bots_sdk::api::command::EphemeralMessageBuilder;
use oc_bots_sdk::api::definition::*;
use oc_bots_sdk::oc_api::client::Client;
use oc_bots_sdk::types::{BotCommandContext, MessageContentInitial, MessageId, TextContent};
use oc_bots_sdk_offchain::AgentRuntime;
use std::sync::LazyLock;
use async_trait::async_trait;

use crate::api;

pub struct PingPairCommand;

static DEFINITION: LazyLock<BotCommandDefinition> = LazyLock::new(PingPairCommand::definition);

#[async_trait]
impl CommandHandler<AgentRuntime> for PingPairCommand {
    fn definition(&self) -> &BotCommandDefinition {
        &DEFINITION
    }

    async fn execute(
        &self,
        oc_client: Client<AgentRuntime, BotCommandContext>,
    ) -> Result<SuccessResult, String> {
        let ctx = oc_client.context();
        let user_id = ctx.command.initiator.to_string();
        let username = "user"; // Default placeholder since we can't get the actual username
        let args = &ctx.command.args;
        
        let result = if args.is_empty() {
            api::handlers::get_help_menu()
        } else {
            let subcommand = &args[0].name;
            
            match subcommand.as_str() {
                "start" => api::handlers::handle_start_command(user_id.clone(), username.to_string()),
                "profile" => api::handlers::handle_profile_command(user_id.clone(), username.to_string(), args.iter().map(|a| a.name.clone()).collect()),
                "skip" => api::handlers::handle_skip_command(user_id.clone(), username.to_string()),
                "stats" => api::handlers::handle_stats_command(user_id.clone(), username.to_string()),
                "timezone" => api::handlers::handle_timezone_command(user_id.clone(), username.to_string(), args.iter().map(|a| a.name.clone()).collect()),
                "ping" => simulate_ping_time(),
                _ => "Unknown subcommand. Try `/pingpair` for help.".to_string(),
            }
        };
        
        // Create a text content
        let content = MessageContentInitial::Text(TextContent { 
            text: result 
        });
        
        // Create a default message ID
        let message_id: MessageId = 0.into();
        
        // Use the builder to create the message
        let message = EphemeralMessageBuilder::new(content, message_id)
            .with_block_level_markdown(true)
            .build();
        
        // Return the success result with the message
        Ok(SuccessResult {
            message: Some(message),
        })
    }
}

impl PingPairCommand {
    fn definition() -> BotCommandDefinition {
        BotCommandDefinition {
            name: String::from("pingpair"),
            description: Some(String::from("Connect with people globally through themed meetups")),
            placeholder: Some(String::from("command")),
            params: vec![
                BotCommandParam {
                    name: "subcommand".to_string(),
                    description: Some("The subcommand to execute".to_string()),
                    placeholder: Some("Choose a command".to_string()),
                    required: true,
                    param_type: BotCommandParamType::StringParam(StringParam {
                        min_length: 1,
                        max_length: 50,
                        choices: vec![
                            CommandOptionChoiceString {
                                name: "Start".to_string(),
                                value: "start".to_string(),
                            },
                            CommandOptionChoiceString {
                                name: "Profile".to_string(),
                                value: "profile".to_string(),
                            },
                            CommandOptionChoiceString {
                                name: "Skip".to_string(),
                                value: "skip".to_string(),
                            },
                            CommandOptionChoiceString {
                                name: "Stats".to_string(),
                                value: "stats".to_string(),
                            },
                            CommandOptionChoiceString {
                                name: "Timezone".to_string(),
                                value: "timezone".to_string(),
                            },
                        ],
                        multi_line: false,
                    }),
                },
            ],
            permissions: Default::default(),
            default_role: None,
            direct_messages: Some(true),
        }
    }
}

// Test function to simulate ping time
pub fn simulate_ping_time() -> String {
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