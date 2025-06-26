<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Tempora Clock Synchronization System

This project is a JavaScript-based clock synchronization system that analyzes and synchronizes various clocks around town with a Grand Clock Tower.

## Project Structure
- `app.js` - Core clock synchronization logic and analysis
- `index.html` - Web interface with visual clock representations
- `server.js` - Express server to serve the web application
- `test.js` - Test suite for validating functionality
- `package.json` - Project dependencies and scripts

## Key Features
- Time difference calculation between town clocks and Grand Clock Tower
- Visual clock representations using HTML5 Canvas
- Interactive web interface with real-time updates
- Comprehensive analysis and recommendations
- RESTful API endpoints for clock data

## Development Guidelines
- Follow ES6+ JavaScript standards
- Use consistent naming conventions (camelCase for variables/functions)
- Include comprehensive error handling
- Maintain responsive design principles for the web interface
- Write descriptive comments for complex logic
- Ensure cross-browser compatibility

## Core Classes and Functions
- `ClockSynchronizer` - Main class for clock analysis
- `timeToMinutes()` - Converts HH:MM format to minutes
- `calculateTimeDifferences()` - Computes time differences array
- `analyzeClocks()` - Performs comprehensive clock analysis
- `generateRecommendations()` - Creates synchronization recommendations

## Time Format
- All times use 24-hour format (HH:MM)
- Grand Clock Tower reference time: 15:00
- Time differences: positive = ahead, negative = behind

## Testing
- Run `npm test` to execute the test suite
- Test file validates core functionality and edge cases
- Includes time conversion, analysis, and recommendation tests
