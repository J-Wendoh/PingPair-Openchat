pub mod handlers;

// Re-export key handlers for use in main.rs
pub use handlers::{
    handle_message,
    handle_command,
    get_welcome_message,
    get_help_menu,
    match_users,
    generate_meeting_link
}; 