use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk::api::time;

use crate::model::types::{UserProfile, Pairing, PairingStatus, Session, IcebreakerQuestion};

// Global state storage
thread_local! {
    static STATE: RefCell<PingPairState> = RefCell::new(PingPairState::default());
}

#[derive(Clone, Debug, Default, CandidType, Serialize, Deserialize)]
pub struct PingPairState {
    pub users: HashMap<String, UserProfile>,
    pub current_session: Option<Session>,
    pub past_sessions: Vec<Session>,
    pub active_pairings: HashMap<String, Pairing>,
    pub completed_pairings: Vec<Pairing>,
    pub spotlight_countries: Vec<(String, String, Vec<String>)>, // (country, emoji, facts)
}

// User management
pub fn get_user(user_id: &str) -> Option<UserProfile> {
    STATE.with(|state| {
        state.borrow().users.get(user_id).cloned()
    })
}

pub fn create_user(user_id: String, username: String) -> UserProfile {
    let profile = UserProfile {
        user_id: Principal::from_text(user_id.clone()).unwrap(),
        name: username,
        country: "Unknown".to_string(),
        interests: Vec::new(),
        bio: "".to_string(),
        net_worth: 5, // Starting points
        badges: Vec::new(),
        countries_visited: Vec::new(),
    };
    
    STATE.with(|state| {
        state.borrow_mut().users.insert(user_id, profile.clone());
    });
    
    profile
}

pub fn update_user(user_id: &str, profile: UserProfile) {
    STATE.with(|state| {
        state.borrow_mut().users.insert(user_id.to_string(), profile);
    });
}

// Pairing management
pub fn create_pairing(user1: &str, user2: &str, country: &str) -> Pairing {
    let pairing = Pairing {
        id: format!("pairing-{}", time()),
        user1: Principal::from_text(user1).unwrap(),
        user2: Principal::from_text(user2).unwrap(),
        country: country.to_string(),
        date_created: time(),
        status: PairingStatus::Active,
    };
    
    STATE.with(|state| {
        state.borrow_mut().active_pairings.insert(pairing.id.clone(), pairing.clone());
    });
    
    pairing
}

pub fn complete_pairing(pairing_id: &str) -> Option<Pairing> {
    STATE.with(|state| {
        let mut state_mut = state.borrow_mut();
        
        if let Some(mut pairing) = state_mut.active_pairings.remove(pairing_id) {
            pairing.status = PairingStatus::Completed;
            state_mut.completed_pairings.push(pairing.clone());
            Some(pairing)
        } else {
            None
        }
    })
}

// Session management
pub fn create_new_session() -> Session {
    let featured_countries = get_random_countries(3);
    
    let session = Session {
        id: format!("session-{}", time()),
        date: time(),
        featured_countries,
        pairings: Vec::new(),
    };
    
    STATE.with(|state| {
        let mut state_mut = state.borrow_mut();
        
        // Archive previous session if exists
        if let Some(prev_session) = state_mut.current_session.take() {
            state_mut.past_sessions.push(prev_session);
        }
        
        // Set new session
        state_mut.current_session = Some(session.clone());
    });
    
    session
}

// Helper functions
fn get_random_countries(count: usize) -> Vec<String> {
    STATE.with(|state| {
        let state_ref = state.borrow();
        let spotlights = &state_ref.spotlight_countries;
        
        // If we don't have enough countries, return what we have
        if spotlights.len() <= count {
            return spotlights.iter()
                .map(|(country, _, _)| country.clone())
                .collect();
        }
        
        // Otherwise, select random countries
        let mut selected = Vec::new();
        let mut indices: Vec<usize> = (0..spotlights.len()).collect();
        
        for _ in 0..count {
            let random_index = (time() as usize) % indices.len();
            let spotlight_index = indices.remove(random_index);
            selected.push(spotlights[spotlight_index].0.clone());
        }
        
        selected
    })
}

// Initialize spotlight countries
pub fn initialize_spotlight_countries() {
    let countries = vec![
        ("Kenya".to_string(), "🇰🇪".to_string(), vec![
            "Home to over 40 ethnic groups".to_string(),
            "Birthplace of marathon champions".to_string(),
            "Famous for wildlife safaris".to_string(),
        ]),
        ("India".to_string(), "🇮🇳".to_string(), vec![
            "World's largest democracy".to_string(),
            "Home to Bollywood".to_string(),
            "Known for diverse cuisine and spices".to_string(),
        ]),
        ("Brazil".to_string(), "🇧🇷".to_string(), vec![
            "Famous for Carnival and samba".to_string(),
            "Home to most of the Amazon rainforest".to_string(),
            "Soccer is a national passion".to_string(),
        ]),
        ("Japan".to_string(), "🇯🇵".to_string(), vec![
            "Known for advanced technology and anime".to_string(),
            "Has over 6,800 islands".to_string(),
            "Home to the world's oldest company (1,400+ years)".to_string(),
        ]),
        ("Egypt".to_string(), "🇪🇬".to_string(), vec![
            "Home to the ancient pyramids".to_string(),
            "The Nile is the longest river in the world".to_string(),
            "Has a history spanning over 6,000 years".to_string(),
        ]),
    ];
    
    STATE.with(|state| {
        state.borrow_mut().spotlight_countries = countries;
    });
} 