# PingPair Bot File Structure

## Directory Structure
```
src/
├── api/
│   ├── handlers.rs - Command handlers
│   ├── country_service.rs - Country data handling
│   └── mod.rs - API exports
├── commands/
│   ├── echo.rs - Example command
│   ├── pingpair.rs - Main bot command
│   └── mod.rs - Command exports
├── model/
│   ├── types.rs - Data structures
│   ├── state.rs - State management
│   └── mod.rs - Model exports
├── config.rs - Configuration
├── integration.rs - Country service integration
└── lib.rs - Library exports

docs/
├── task-log.md - Implementation progress
├── dev-notes.md - Developer notes
└── file-tree.md - This file
```
