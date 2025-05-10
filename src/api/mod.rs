pub mod handlers;
pub mod country_service;

// Re-export key functions
pub use handlers::{handle_message, handle_command, get_help_menu};
pub use country_service::{
    search_country_info, 
    update_country_availability, 
    get_available_countries,
    get_country_spotlight
}; 