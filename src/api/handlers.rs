use candid::{CandidType, Principal};
use ic_cdk::{api::time, query, update};
use serde::{Deserialize, Serialize};

use crate::model::types::{
    UserProfile, Pairing, PairingStatus, Session, CommandResponse, BotCommand, IcebreakerQuestion
};

// OpenChat bot types - similar to lib.rs but using model types
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Message {
    pub text: Option<String>,
    pub sender: User,
    pub timestamp: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub id: String,
    pub username: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Context {
    pub mentioned: bool,
}

// Message Handler
#[update]
pub async fn handle_message(
    message: Message,
    context: Context,
) -> String {
    let text = message.text.unwrap_or_default();
    
    if text.to_lowercase() == "hi" || text.to_lowercase() == "hello" {
        return get_welcome_message();
    }
    
    "Hello! Use `/pingpair` to see available commands.".to_string()
}

// Command Handler
#[update]
pub async fn handle_command(
    message: Message,
    context: Context,
    command: String,
    args: Vec<String>,
) -> String {
    let user_id = message.sender.id;
    let username = message.sender.username;
    
    if command != "pingpair" {
        return "Unknown command. Try `/pingpair` for help.".to_string();
    }
    
    if args.is_empty() {
        return get_help_menu();
    }
    
    let subcommand = args[0].to_lowercase();
    
    match subcommand.as_str() {
        "start" => handle_start_command(user_id, username),
        "profile" => handle_profile_command(user_id, username, args),
        "skip" => handle_skip_command(user_id, username),
        "stats" => handle_stats_command(user_id, username),
        "timezone" => handle_timezone_command(user_id, username, args),
        _ => "Unknown subcommand. Try `/pingpair` for help.".to_string(),
    }
}

// Helper functions
pub fn get_welcome_message() -> String {
    r#"
# Welcome to PingPair! 🌍✨

Connect with amazing people from around the world through themed, twice-weekly meetups!

**How it works:**
- Every 3-4 days, you'll receive a "Ping Time" message
- We'll spotlight a global location with fun facts
- You'll be matched with someone who shares your interests
- Chat via video and grow your international network!

### Commands:
- `/pingpair start` - Begin receiving match pings
- `/pingpair profile` - Update your profile
- `/pingpair skip` - Skip a match cycle
- `/pingpair stats` - Check your Strix network score
- `/pingpair timezone` - Set your timezone

Ready to make global connections? Type `/pingpair start` to begin!
    "#.to_string()
}

pub fn get_help_menu() -> String {
    r#"
# PingPair Help Menu 🌍✨

- `/pingpair start` - Begin receiving match pings
- `/pingpair profile` - View and update your profile
- `/pingpair skip` - Skip a match cycle
- `/pingpair stats` - Check your Strix network score
- `/pingpair timezone` - Set your timezone
    "#.to_string()
}

// Command implementations
pub fn handle_start_command(user_id: String, username: String) -> String {
    // Implementation will be moved from lib.rs to here
    format!(r#"
# Welcome to PingPair! 🌍✨

Great news, {}! You've successfully joined PingPair and earned 5 Strix points! 

You'll receive your first Ping notification in the next matching cycle.

### Next Step: Complete Your Profile

Tell us about yourself! This helps create better matches and more meaningful connections.

Type `/pingpair profile` to set up your profile now!
    "#, username)
}

pub fn handle_profile_command(user_id: String, username: String, args: Vec<String>) -> String {
    // Implementation will be moved from lib.rs to here
    if args.len() > 1 && args[1] == "update" {
        return r#"
# Update Your Profile 📝

To update your profile, please provide the following information:

1. **Country:** Where are you from?
2. **Timezone:** What timezone are you in? (e.g., UTC, GMT+1, EST)
3. **Interests:** What are your main interests? (comma-separated)
4. **Skills:** What skills or talents do you have? (comma-separated)
5. **Favorites:** What are some of your favorite things? (comma-separated)
6. **Bio:** Write a short bio about yourself.

Respond to each prompt to update your profile.
        "#.to_string();
    }
    
    format!(r#"
# Your PingPair Profile 👤

**Name:** {}
**Country:** {}
**Timezone:** {}
**Bio:** {}

**Interests:** {}
**Skills:** {}
**Favorites:** {}

To update your profile, type `/pingpair profile update`
    "#, 
    username,
    "Not set",
    "UTC",
    "Not set",
    "None set",
    "None set",
    "None set")
}

pub fn handle_skip_command(user_id: String, username: String) -> String {
    // Implementation will be moved from lib.rs to here
    r#"
# Cycle Skipped ⏭️

You'll skip the next matching cycle. You'll be automatically included in future cycles.

To rejoin sooner, just type `/pingpair start` again!
    "#.to_string()
}

pub fn handle_stats_command(user_id: String, username: String) -> String {
    // Implementation will be moved from lib.rs to here
    format!(r#"
# Your PingPair Stats 📊

### Strix Network Score: {} ⭐

**Match History:** {} connections made
**Status:** {}
**Last Match:** {}

{}

Keep making connections to increase your score!
    "#, 
    5,
    0,
    "Active",
    "None yet",
    "**Tier:** Newcomer 🌱 (0-10 points)")
}

pub fn handle_timezone_command(user_id: String, username: String, args: Vec<String>) -> String {
    // Implementation will be moved from lib.rs to here
    if args.len() > 1 {
        let timezone = args[1..].join(" ");
        return format!(r#"
# Timezone Updated ✅

Your timezone has been set to: {}

This will help us match you with people in compatible time zones!
        "#, timezone);
    }
    
    format!(r#"
# Your Timezone

Your current timezone is set to: {}

To update your timezone, type `/pingpair timezone [your timezone]`
Example: `/pingpair timezone UTC+3`
    "#, "UTC")
}

// Matching algorithm - new functionality
pub fn match_users() -> Vec<Pairing> {
    // Placeholder for matching algorithm
    // In a real implementation, this would:
    // 1. Group users by timezone
    // 2. Filter by interests
    // 3. Create optimal pairings
    // 4. Generate meeting links
    Vec::new()
}

// Video chat link generation
pub fn generate_meeting_link() -> String {
    // In a real implementation, this would integrate with a video platform API
    let meeting_id = format!("pingpair-{}", time());
    format!("https://meet.jit.si/{}", meeting_id)
}

// Strix points calculator
pub fn calculate_strix_tier(points: u32) -> String {
    if points < 10 {
        "**Tier:** Newcomer 🌱 (0-10 points)".to_string()
    } else if points < 50 {
        "**Tier:** Explorer 🔍 (10-50 points)".to_string()
    } else if points < 100 {
        "**Tier:** Connector 🤝 (50-100 points)".to_string()
    } else if points < 200 {
        "**Tier:** Networker 🌐 (100-200 points)".to_string()
    } else {
        "**Tier:** Global Ambassador 🌟 (200+ points)".to_string()
    }
} 