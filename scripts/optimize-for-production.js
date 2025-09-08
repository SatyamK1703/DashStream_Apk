/**
 * Production Optimization Script
 * 
 * This script performs various optimizations for production builds:
 * - Cleans build caches
 * - Optimizes images
 * - Runs production build with optimized settings
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Directories to clean before build
  cleanDirs: [
    '.expo',
    'node_modules/.cache',
  ],
  // Commands to run in sequence
  commands: [
    'npm run clean',
    'NODE_ENV=production expo export',
  ],
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Logs a message with optional color
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Executes a shell command and returns the output
 */
function execute(command) {
  log(`\n> ${command}`, colors.cyan);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    log(error.message, colors.red);
    process.exit(1);
  }
}

/**
 * Cleans specified directories
 */
function cleanDirectories() {
  log('\n🧹 Cleaning build caches...', colors.bright + colors.yellow);
  
  config.cleanDirs.forEach(dir => {
    const dirPath = path.resolve(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      log(`Removing ${dir}...`);
      try {
        if (process.platform === 'win32') {
          execute(`rmdir /s /q "${dirPath}"`);
        } else {
          execute(`rm -rf "${dirPath}"`);
        }
      } catch (error) {
        log(`Warning: Could not remove ${dir}`, colors.yellow);
      }
    }
  });
}

/**
 * Main function to run the optimization process
 */
async function main() {
  log('🚀 Starting production optimization...', colors.bright + colors.green);
  
  // Clean directories
  cleanDirectories();
  
  // Set environment variables for production
  process.env.NODE_ENV = 'production';
  
  // Run each command in sequence
  for (const command of config.commands) {
    execute(command);
  }
  
  log('\n✅ Production optimization completed!', colors.bright + colors.green);
  log('\nTo build for specific platforms:');
  log('  npm run build:android - Build Android app');
  log('  npm run build:ios     - Build iOS app');
  log('  npm run build:all     - Build for all platforms');
}

// Run the main function
main().catch(error => {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});