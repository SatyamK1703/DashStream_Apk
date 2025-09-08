#!/usr/bin/env node

/**
 * This script is a workaround for the TypeScript file extension error
 * It creates a temporary package.json in the expo-modules-core directory
 * to force it to be treated as a CommonJS module
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

// Path to the problematic module
const modulePath = path.resolve(
  __dirname,
  '../node_modules/expo-modules-core'
);

const packageJsonPath = path.join(modulePath, 'package.json');
let originalPackageJson = null;

// Backup the original package.json if it exists
if (fs.existsSync(packageJsonPath)) {
  console.log('Backing up original package.json...');
  originalPackageJson = fs.readFileSync(packageJsonPath, 'utf8');
}

// Create a temporary package.json to force CommonJS
const tempPackageJson = {
  name: 'expo-modules-core',
  type: 'commonjs'
};

console.log('Creating temporary package.json to fix TypeScript loading...');
fs.writeFileSync(packageJsonPath, JSON.stringify(tempPackageJson, null, 2));

// Function to restore the original package.json
function restorePackageJson() {
  if (originalPackageJson) {
    console.log('Restoring original package.json...');
    fs.writeFileSync(packageJsonPath, originalPackageJson);
  } else {
    console.log('Removing temporary package.json...');
    fs.unlinkSync(packageJsonPath);
  }
}

// Handle process exit to ensure cleanup
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Cleaning up...');
  restorePackageJson();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Cleaning up...');
  restorePackageJson();
  process.exit(0);
});

// Start Expo
console.log('Starting Expo...');
try {
  // Use spawnSync instead of execSync to properly handle signals
  const result = spawnSync('npx', ['expo', 'start'], { 
    stdio: 'inherit',
    shell: true
  });
  
  // Cleanup before exit
  restorePackageJson();
  
  if (result.status !== 0) {
    console.error(`Expo exited with code ${result.status}`);
    process.exit(result.status);
  }
} catch (error) {
  console.error('Error starting Expo:', error.message);
  restorePackageJson();
  process.exit(1);
}