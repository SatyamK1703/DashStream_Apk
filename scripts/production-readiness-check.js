/**
 * Production Readiness Check Script
 * 
 * This script performs various checks to ensure the application is ready for production deployment:
 * - Verifies environment variables
 * - Checks for production dependencies
 * - Validates configuration files
 * - Performs basic security checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Configuration
const config = {
  requiredFiles: [
    'app.config.js',
    'babel.config.js',
    'metro.config.js',
    '.env',
  ],
  requiredEnvVars: [
    'API_URL',
    'GOOGLE_MAPS_API_KEY',
    'FIREBASE_API_KEY',
  ],
  securityChecks: [
    { pattern: /console\.log/g, message: 'Console logs should be removed in production' },
    { pattern: /debugger;/g, message: 'Debugger statements should be removed' },
    { pattern: /TODO|FIXME/g, message: 'TODO or FIXME comments should be addressed' },
  ],
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
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    return error.message;
  }
}

/**
 * Checks if required files exist
 */
function checkRequiredFiles() {
  log('\n📋 Checking required files...', colors.bright + colors.cyan);
  
  let allFilesExist = true;
  
  config.requiredFiles.forEach(file => {
    const filePath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file} exists`, colors.green);
    } else {
      log(`❌ ${file} is missing`, colors.red);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

/**
 * Checks if .env file contains required variables
 */
function checkEnvironmentVariables() {
  log('\n🔐 Checking environment variables...', colors.bright + colors.cyan);
  
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', colors.red);
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  let allVarsExist = true;
  
  config.requiredEnvVars.forEach(envVar => {
    if (envContent.includes(`${envVar}=`)) {
      const value = envContent.match(new RegExp(`${envVar}=(.*)`))?.[1];
      if (value && value.trim() && value !== 'undefined') {
        log(`✅ ${envVar} is set`, colors.green);
      } else {
        log(`⚠️ ${envVar} is empty`, colors.yellow);
        allVarsExist = false;
      }
    } else {
      log(`❌ ${envVar} is missing`, colors.red);
      allVarsExist = false;
    }
  });
  
  return allVarsExist;
}

/**
 * Performs basic security checks on the codebase
 */
function performSecurityChecks() {
  log('\n🔒 Performing security checks...', colors.bright + colors.cyan);
  
  let allChecksPassed = true;
  const srcDir = path.resolve(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcDir)) {
    log('⚠️ src directory not found, skipping security checks', colors.yellow);
    return true;
  }
  
  // Get all JS/TS files
  const files = execute(`dir /s /b "${srcDir}\\*.js" "${srcDir}\\*.jsx" "${srcDir}\\*.ts" "${srcDir}\\*.tsx"`);
  const fileList = files.split('\n').filter(Boolean);
  
  fileList.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    config.securityChecks.forEach(check => {
      const matches = content.match(check.pattern);
      if (matches && matches.length > 0) {
        log(`⚠️ ${path.relative(path.resolve(__dirname, '..'), file)}: ${check.message}`, colors.yellow);
        allChecksPassed = false;
      }
    });
  });
  
  if (allChecksPassed) {
    log('✅ All security checks passed', colors.green);
  }
  
  return allChecksPassed;
}

/**
 * Checks for production dependencies
 */
function checkProductionDependencies() {
  log('\n📦 Checking production dependencies...', colors.bright + colors.cyan);
  
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found', colors.red);
    return false;
  }
  
  const packageJson = require(packageJsonPath);
  const requiredProdDeps = [
    'expo',
    'react',
    'react-native',
  ];
  
  let allDepsExist = true;
  
  requiredProdDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log(`✅ ${dep} is installed (${packageJson.dependencies[dep]})`, colors.green);
    } else {
      log(`❌ ${dep} is missing from dependencies`, colors.red);
      allDepsExist = false;
    }
  });
  
  // Check for development dependencies in production
  const devDepsInProd = [
    'eslint',
    'jest',
    'prettier',
  ];
  
  devDepsInProd.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log(`⚠️ ${dep} should be in devDependencies, not dependencies`, colors.yellow);
    }
  });
  
  return allDepsExist;
}

/**
 * Main function to run all checks
 */
async function main() {
  log('🔍 Starting production readiness check...', colors.bright + colors.green);
  
  const fileChecks = checkRequiredFiles();
  const envChecks = checkEnvironmentVariables();
  const securityChecks = performSecurityChecks();
  const dependencyChecks = checkProductionDependencies();
  
  log('\n📊 Results Summary:', colors.bright);
  log(`Required Files: ${fileChecks ? '✅ PASSED' : '❌ FAILED'}`, fileChecks ? colors.green : colors.red);
  log(`Environment Variables: ${envChecks ? '✅ PASSED' : '⚠️ WARNING'}`, envChecks ? colors.green : colors.yellow);
  log(`Security Checks: ${securityChecks ? '✅ PASSED' : '⚠️ WARNING'}`, securityChecks ? colors.green : colors.yellow);
  log(`Dependencies: ${dependencyChecks ? '✅ PASSED' : '❌ FAILED'}`, dependencyChecks ? colors.green : colors.red);
  
  const overallResult = fileChecks && dependencyChecks; // Env and security are warnings only
  
  log('\n🏁 Overall Result:', colors.bright);
  if (overallResult) {
    log('✅ READY FOR PRODUCTION', colors.bright + colors.green);
    log('Run `npm run optimize` to prepare for production deployment');
  } else {
    log('❌ NOT READY FOR PRODUCTION', colors.bright + colors.red);
    log('Please fix the issues above before deploying to production');
  }
}

// Run the main function
main().catch(error => {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});