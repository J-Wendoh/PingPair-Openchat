use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use openchat_rust_sdk::{
    bot_api::{
        BotEvent,
        BotResponse,
        CommandFunction,
        MessageFunction,
        InitBotRequestArgs,
        AcceptP2PRequestArgs,
        RejectP2PRequestArgs,
    },
    handler::Handler,
    models::{
        Command,
        Message,
        ChatId,
        UserId,
    },
};
use serde_json::json;
use std::collections::HashMap;
use std::cell::RefCell;

type UserStore = HashMap<String, User>;
type MatchStore = HashMap<String, MatchInfo>;

thread_local! {
    static USERS: RefCell<UserStore> = RefCell::new(HashMap::new());
    static MATCHES: RefCell<MatchStore> = RefCell::new(HashMap::new());
}

#[derive(Clone, Debug)]
struct User {
    user_id: String,
    strix_points: u32,
    is_active: bool,
    timezone: String,
    interests: Vec<String>,
    match_history: Vec<String>,
    skip_next_match: bool,
}

#[derive(Clone, Debug)]
struct MatchInfo {
    match_id: String,
    user1_id: String,
    user2_id: String,
    spotlight_country: String,
    meeting_link: String,
    created_at: u64,
    is_completed: bool,
}

// Countries database for spotlights
fn get_country_info(country_name: &str) -> Option<CountryInfo> {
    match country_name {
        "Japan" => Some(CountryInfo {
            name: "Japan".to_string(),
            flag: "🇯🇵".to_string(),
            facts: vec![
                "Island nation in East Asia".to_string(),
                "Population of about 125 million".to_string(),
                "Known for technological innovation and ancient traditions".to_string(),
            ],
            traditions: Some(vec![
                "Tea ceremonies (Chado)".to_string(),
                "Cherry blossom (Sakura) viewing".to_string(),
                "Traditional arts like origami and calligraphy".to_string(),
            ]),
        }),
        "Kenya" => Some(CountryInfo {
            name: "Kenya".to_string(),
            flag: "🇰🇪".to_string(),
            facts: vec![
                "East African nation known for wildlife and scenery".to_string(),
                "Population of about 54 million".to_string(),
                "Home to the Great Rift Valley and Lake Victoria".to_string(),
            ],
            traditions: Some(vec![
                "Safari tourism".to_string(),
                "Maasai cultural traditions".to_string(),
                "Kenyan long-distance running excellence".to_string(),
            ]),
        }),
        "Brazil" => Some(CountryInfo {
            name: "Brazil".to_string(),
            flag: "🇧🇷".to_string(),
            facts: vec![
                "Largest country in South America".to_string(),
                "Population of about 213 million".to_string(),
                "Home to a significant portion of the Amazon rainforest".to_string(),
            ],
            traditions: Some(vec![
                "Carnival celebrations".to_string(),
                "Samba music and dance".to_string(),
                "Soccer (football) culture".to_string(),
            ]),
        }),
        _ => None,
    }
}

struct CountryInfo {
    name: String,
    flag: String,
    facts: Vec<String>,
    traditions: Option<Vec<String>>,
}

// Command handler function
fn handle_pingpair_command(command: Command) -> BotResponse {
    let user_id = command.initiator.to_string();
    let args = command.args;
    
    let subcommand = if args.is_empty() {
        "help"
    } else {
        &args[0]
    };
    
    match subcommand {
        "start" => handle_start(user_id),
        "profile" => handle_profile(user_id, args.get(1..).unwrap_or(&[])),
        "skip" => handle_skip(user_id),
        "stats" => handle_stats(user_id),
        "timezone" => handle_timezone(user_id, args.get(1..).unwrap_or(&[])),
        _ => handle_help(),
    }
}

// Message handler function
fn handle_message(_message: Message) -> BotResponse {
    BotResponse::Text("Use /pingpair commands to interact with PingPair bot!".to_string())
}

// Command handlers
fn handle_start(user_id: String) -> BotResponse {
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        if !users_map.contains_key(&user_id) {
            users_map.insert(user_id.clone(), User {
                user_id: user_id.clone(),
                strix_points: 5,
                is_active: true,
                timezone: "UTC".to_string(),
                interests: Vec::new(),
                match_history: Vec::new(),
                skip_next_match: false,
            });
            
            return BotResponse::Text(
                "Welcome to PingPair! 🌍✨\n\nI'll connect you with someone from a different part of the world twice a week for cultural exchange meetups.\n\nUse /pingpair profile to set up your profile and start getting matched!".to_string()
            );
        }
        
        let mut user = users_map.get_mut(&user_id).unwrap();
        user.is_active = true;
        
        BotResponse::Text(
            "Welcome back to PingPair! You're now active and will receive match notifications. Use /pingpair profile to update your profile.".to_string()
        )
    })
}

fn handle_profile(user_id: String, args: &[String]) -> BotResponse {
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        if !users_map.contains_key(&user_id) {
            return handle_start(user_id);
        }
        
        let user = users_map.get_mut(&user_id).unwrap();
        
        // If no arguments, show current profile
        if args.is_empty() {
            return BotResponse::Text(
                format!(
                    "🌟 **Your PingPair Profile**\n\nTimezone: {}\nInterests: {}\nStrix Points: {}\nMatches: {}\n\nUse /pingpair profile add [interest] to add interests",
                    user.timezone,
                    user.interests.join(", "),
                    user.strix_points,
                    user.match_history.len()
                )
            );
        }
        
        // Handle profile subcommands
        let subcommand = &args[0];
        
        if subcommand == "add" && args.len() > 1 {
            let interest = args[1..].join(" ");
            if !user.interests.contains(&interest) {
                user.interests.push(interest.clone());
                user.strix_points += 1;
            }
            
            return BotResponse::Text(
                format!("Added \"{}\" to your interests! You now have {} Strix Points.", interest, user.strix_points)
            );
        }
        
        BotResponse::Text("To update your profile, use:\n/pingpair profile add [interest]".to_string())
    })
}

fn handle_skip(user_id: String) -> BotResponse {
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        if !users_map.contains_key(&user_id) {
            return handle_start(user_id);
        }
        
        let user = users_map.get_mut(&user_id).unwrap();
        user.skip_next_match = true;
        
        BotResponse::Text("You'll skip the next match. Use /pingpair start to activate matching again.".to_string())
    })
}

fn handle_stats(user_id: String) -> BotResponse {
    USERS.with(|users| {
        let users_map = users.borrow();
        
        if !users_map.contains_key(&user_id) {
            return handle_start(user_id);
        }
        
        let user = users_map.get(&user_id).unwrap();
        
        BotResponse::Text(
            format!(
                "✨ **Your PingPair Stats**\n\nStrix Points: {}\nTotal Matches: {}\nActive: {}\n\nKeep participating to earn more Strix Points!",
                user.strix_points,
                user.match_history.len(),
                if user.is_active { "Yes" } else { "No" }
            )
        )
    })
}

fn handle_timezone(user_id: String, args: &[String]) -> BotResponse {
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        if !users_map.contains_key(&user_id) {
            return handle_start(user_id);
        }
        
        let user = users_map.get_mut(&user_id).unwrap();
        
        if args.is_empty() {
            return BotResponse::Text(
                format!("Your current timezone is set to: {}\n\nUse /pingpair timezone [your timezone] to update it.", user.timezone)
            );
        }
        
        let timezone = args.join(" ");
        user.timezone = timezone.clone();
        
        BotResponse::Text(format!("Your timezone has been updated to: {}", timezone))
    })
}

fn handle_help() -> BotResponse {
    BotResponse::Text(
        "**PingPair Bot Commands**\n\n/pingpair start - Begin receiving match pings\n/pingpair profile - View and update profile\n/pingpair skip - Skip current matching cycle\n/pingpair stats - View Strix points and match history\n/pingpair timezone - Update timezone preference".to_string()
    )
}

#[update]
async fn handle_event(args: EventArgs) -> String {
    ic_cdk::println!("Received event: {}", args.event);

    let handler = Handler::new()
        .with_command("/pingpair", CommandFunction::new(handle_pingpair_command))
        .with_message(MessageFunction::new(handle_message));

    match handler.handle_event(&args.event).await {
        Ok(response) => json!(response).to_string(),
        Err(err) => json!({ "error": format!("{:?}", err) }).to_string(),
    }
}

#[derive(CandidType, Deserialize)]
struct EventArgs {
    event: String,
} 