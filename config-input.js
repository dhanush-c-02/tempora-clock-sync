/**
 * Configuration-based Input Example
 * 
 * This file shows how to load clock data from a JSON configuration file
 */

const fs = require('fs');
const path = require('path');
const { ClockSynchronizer } = require('./app.js');

function loadFromConfig(configPath = './config.json') {
    try {
        console.log('📁 Loading configuration from:', configPath);
        
        // Read and parse the JSON config file
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Create ClockSynchronizer with config data
        const clockSync = new ClockSynchronizer(
            configData.grandClockTower,
            configData.townClocks
        );
        
        console.log('✅ Configuration loaded successfully!');
        console.log(`Grand Clock Tower: ${configData.grandClockTower}`);
        console.log(`Number of town clocks: ${configData.townClocks.length}`);
        
        return clockSync;
        
    } catch (error) {
        console.error('❌ Error loading configuration:', error.message);
        console.log('🔄 Using default configuration instead...');
        return new ClockSynchronizer();
    }
}

function saveToConfig(clockSync, configPath = './config.json') {
    try {
        const configData = {
            grandClockTower: clockSync.grandClockTower,
            townClocks: clockSync.townClocks
        };
        
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
        console.log('✅ Configuration saved to:', configPath);
        
    } catch (error) {
        console.error('❌ Error saving configuration:', error.message);
    }
}

// Example usage
console.log('🕰️ CONFIGURATION-BASED INPUT EXAMPLE\n');

// Load from config file
const clockSync = loadFromConfig();

// Display the results
clockSync.displayResults();

// Example: Modify and save back
console.log('\n🔄 MODIFYING CONFIGURATION');
console.log('=' .repeat(40));

clockSync.setGrandClockTime("17:00");
clockSync.addClock({ id: 6, time: "16:55", name: "New Airport Clock" });

console.log('Modified configuration and saving...');
saveToConfig(clockSync, './modified-config.json');

// Load the modified config
console.log('\n📊 RESULTS WITH MODIFIED CONFIGURATION:');
console.log('=' .repeat(50));
const modifiedSync = loadFromConfig('./modified-config.json');
modifiedSync.displayResults();

module.exports = { loadFromConfig, saveToConfig };
