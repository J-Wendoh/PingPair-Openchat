use axum::{
    body::Bytes,
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use oc_bots_sdk::api::command::{CommandHandlerRegistry, CommandResponse, CommandHandler};
use oc_bots_sdk::api::definition::BotDefinition;
use oc_bots_sdk::oc_api::client::ClientFactory;
use oc_bots_sdk_offchain::{env, AgentRuntime};
use std::net::{Ipv4Addr, SocketAddr};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing::{info, error};
use tracing_subscriber::fmt::format::FmtSpan;

mod config;
mod commands;
mod model;
mod api;

// Structure to hold application state
struct AppState {
    oc_public_key: String,
    commands: CommandHandlerRegistry<AgentRuntime>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load .env file if present
    dotenv().ok();

    // Check for test command line arguments
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 {
        match args[1].as_str() {
            "--test-ping" => {
                test_ping();
                return Ok(());
            },
            "--test-help" => {
                test_help();
                return Ok(());
            },
            "--test-server" => {
                test_server().await?;
                return Ok(());
            }
            _ => {}
        }
    }

    // Get config file path from env - if not set, use default
    let config_file_path = std::env::var("CONFIG_FILE").unwrap_or("./config.toml".to_string());
    println!("Config file path: {:?}", config_file_path);

    // Load & parse config
    let config = config::Config::from_file(&config_file_path)?;
    println!("Config: {:?}", config);

    // Setup logging
    tracing_subscriber::fmt()
        .with_max_level(config.log_level)
        .with_span_events(FmtSpan::CLOSE)
        .init();

    info!("Starting PingPair bot proxy");

    // Initialize app state
    model::state::initialize_state();
    
    // Initialize spotlight countries
    model::state::initialize_spotlight_countries();

    // Build agent for OpenChat communication
    let agent = oc_bots_sdk_offchain::build_agent(config.ic_url.clone(), &config.pem_file).await;

    // Create runtime and client factory
    let runtime = AgentRuntime::new(agent, tokio::runtime::Runtime::new()?);
    let client_factory = Arc::new(ClientFactory::new(runtime));

    // Create command registry and register PingPair commands
    let commands = CommandHandlerRegistry::new(client_factory)
        .register(commands::pingpair::PingPairCommand);

    let app_state = AppState {
        oc_public_key: config.oc_public_key,
        commands,
    };

    // Create router with endpoints
    let app = Router::new()
        .route("/", get(bot_definition))
        .route("/bot_definition", get(bot_definition))
        .route("/execute", post(execute_command))
        .route("/execute_command", post(execute_command))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(Arc::new(app_state));

    // Start HTTP server
    let socket_addr = SocketAddr::new(Ipv4Addr::UNSPECIFIED.into(), config.port);
    info!("Starting HTTP server on {}", socket_addr);
    
    let listener = tokio::net::TcpListener::bind(socket_addr).await?;
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}

// Bot definition endpoint
async fn bot_definition(State(state): State<Arc<AppState>>) -> (StatusCode, HeaderMap, Bytes) {
    let commands = state.commands.definitions();
    
    // Ensure each command has permissions set correctly
    let commands_with_permissions = commands.into_iter()
        .map(|mut cmd| {
            if cmd.permissions.is_none() {
                cmd.permissions = Some(serde_json::json!({
                    "community": 0,
                    "chat": 0,
                    "message": 0
                }));
            }
            cmd
        })
        .collect();
    
    let definition = BotDefinition {
        description: "Connect people globally through themed cultural exchange meetups".to_string(),
        commands: commands_with_permissions,
        autonomous_config: None,
    };
    
    let mut headers = HeaderMap::new();
    headers.insert(
        axum::http::header::CONTENT_TYPE,
        "application/json".parse().unwrap(),
    );

    (
        StatusCode::OK,
        headers,
        Bytes::from(serde_json::to_vec(&definition).unwrap()),
    )
}

// Command execution endpoint
async fn execute_command(
    State(state): State<Arc<AppState>>, 
    headers: HeaderMap,
) -> (StatusCode, Bytes) {
    info!("=== Command Execution Start ===");
    info!("Headers: {:?}", headers);
    
    // Get JWT from x-oc-jwt header
    let jwt = match headers.get("x-oc-jwt") {
        Some(jwt_header) => {
            match jwt_header.to_str() {
                Ok(jwt) => {
                    info!("Found JWT in x-oc-jwt header");
                    jwt.to_string()
                },
                Err(e) => {
                    error!("Invalid JWT header value: {}", e);
                    return (
                        StatusCode::BAD_REQUEST,
                        Bytes::from("Invalid JWT header value"),
                    );
                }
            }
        },
        None => {
            error!("No JWT found in x-oc-jwt header");
            return (
                StatusCode::BAD_REQUEST,
                Bytes::from("Missing JWT header"),
            );
        }
    };

    info!("JWT length: {}", jwt.len());
    
    // Parse command data from the JWT payload
    let result = state
        .commands
        .execute(&jwt, &state.oc_public_key, env::now())
        .await;
        
    info!("Command execution result: {:?}", result);
    info!("=== Command Execution End ===");
    
    match result {
        CommandResponse::Success(r) => {
            info!("Command executed successfully");
            (StatusCode::OK, Bytes::from(serde_json::to_vec(&r).unwrap()))
        }
        CommandResponse::BadRequest(r) => {
            error!("Bad request: {:?}", r);
            (
                StatusCode::BAD_REQUEST,
                Bytes::from(serde_json::to_vec(&r).unwrap()),
            )
        }
        CommandResponse::InternalError(err) => {
            error!("Internal error: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Bytes::from(format!("{err:?}")),
            )
        }
        CommandResponse::TooManyRequests => {
            error!("Too many requests");
            (StatusCode::TOO_MANY_REQUESTS, Bytes::new())
        }
    }
}

// Simple function to test the ping command
fn test_ping() {
    use crate::commands::pingpair::simulate_ping_time;
    
    println!("Running ping test...");
    
    // Call the ping simulation function
    let result = simulate_ping_time();
    
    // Print the result
    println!("\nPing command output:\n{}", result);
    
    // Validate the result contains expected elements
    assert!(result.contains("It's Ping Time! 🌍"));
    assert!(result.contains("Global Spotlight:"));
    assert!(result.contains("Fun Facts:"));
    assert!(result.contains("Reply with `yes`"));
    
    println!("\n✅ Test passed successfully!");
}

// Simple function to test the help menu
fn test_help() {
    use crate::api::handlers::get_help_menu;
    
    println!("Running help menu test...");
    
    // Call the help menu function
    let result = get_help_menu();
    
    // Print the result
    println!("\nHelp menu output:\n{}", result);
    
    // Validate the result contains expected elements
    assert!(result.contains("PingPair Help Menu"));
    assert!(result.contains("/pingpair start"));
    assert!(result.contains("/pingpair profile"));
    
    println!("\n✅ Test passed successfully!");
}

// Simple function to test the server functionality
async fn test_server() -> Result<(), Box<dyn std::error::Error>> {
    println!("Running server test...");
    
    // Initialize app state
    model::state::initialize_state();
    
    // Get command definition directly from the PingPairCommand impl
    let cmd = commands::pingpair::PingPairCommand;
    let definition = <commands::pingpair::PingPairCommand as CommandHandler<AgentRuntime>>::definition(&cmd);
    
    // Validate the bot definition
    assert_eq!(definition.name, "pingpair");
    assert!(definition.description.is_some());
    assert_eq!(
        definition.description.as_ref().unwrap(), 
        "Connect with people globally through themed meetups"
    );
    
    println!("\n✅ Test passed successfully!");
    Ok(())
}