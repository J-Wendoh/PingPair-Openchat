#[cfg(test)]
mod tests {
    use crate::commands::pingpair::simulate_ping_time;

    #[test]
    fn test_ping_command() {
        // Call the ping simulation function
        let result = simulate_ping_time();
        
        // Validate the result contains expected elements
        assert!(result.contains("It's Ping Time! 🌍"));
        assert!(result.contains("Global Spotlight:"));
        assert!(result.contains("Fun Facts:"));
        assert!(result.contains("Reply with `yes`"));
        
        println!("Test passed! Ping command output:\n{}", result);
    }
} 