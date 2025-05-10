use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// User Profile
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct UserProfile {
    pub user_id: Principal,
    pub name: String,
    pub country: String,
    pub interests: Vec<String>,
    pub bio: String,
    pub net_worth: u32,
    pub badges: Vec<Badge>,
    pub countries_visited: Vec<String>,
    pub timezone: String,
    pub languages: Vec<String>,
    pub join_date: u64,
}

// Country Information
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Country {
    pub name: String,
    pub fun_facts: Vec<String>,
    pub continent: String,
    pub flag: String,
    pub traditions: Vec<String>,
    pub languages: Vec<String>,
    pub available: bool,
    pub population: u64,
    pub capital: String,
    pub currency: String,
}

// Badge System
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Badge {
    pub id: String,
    pub name: String,
    pub description: String,
    pub date_earned: u64,
}

// Pairing Information
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Pairing {
    pub id: String,
    pub user1: Principal,
    pub user2: Principal,
    pub country: String,
    pub date_created: u64,
    pub status: PairingStatus,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize, PartialEq)]
pub enum PairingStatus {
    Active,
    Completed,
    Cancelled,
}

// Session Information
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub date: u64,
    pub featured_countries: Vec<String>,
    pub pairings: Vec<Pairing>,
}

// Command Response
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct CommandResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<CustomData>,
}

// Using a simpler type instead of serde_json::Value for Candid compatibility
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct CustomData {
    pub value: String,
}

// State Management
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct PingPairState {
    pub users: HashMap<Principal, UserProfile>,
    pub countries: HashMap<String, Country>,
    pub current_session: Option<Session>,
    pub past_sessions: Vec<Session>,
    pub leaderboard: Vec<(Principal, u32)>, // (user_id, net_worth)
}

// Bot Command Requests
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum BotCommand {
    Map,
    Pick { country: String },
    Pair,
    Bio,
    Unpair,
    Info,
    NetWorth,
}

// Icebreaker Questions
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct IcebreakerQuestion {
    pub id: String,
    pub question: String,
    pub country_specific: bool,
} 