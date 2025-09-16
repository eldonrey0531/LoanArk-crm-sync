#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * Validates that all required environment variables are set
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required environment variables
const requiredVars = {
  // Supabase
  VITE_SUPABASE_URL: 'Supabase project URL',
  VITE_SUPABASE_ANON_KEY: 'Supabase anonymous key',

  // HubSpot (optional for development)
  VITE_HUBSPOT_CLIENT_ID: 'HubSpot OAuth client ID (optional)',
  VITE_HUBSPOT_CLIENT_SECRET: 'HubSpot OAuth client secret (optional)',

  // Application
  VITE_APP_ENV: 'Application environment',
  VITE_API_BASE_URL: 'API base URL',
};

// Optional but recommended variables
const recommendedVars = {
  JWT_SECRET: 'JWT signing secret',
  LOG_LEVEL: 'Logging level',
  VITE_APP_NAME: 'Application name',
};

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');

  const envPath = path.join(__dirname, '..', '.env');
  let envExists = false;

  try {
    if (fs.existsSync(envPath)) {
      envExists = true;
      console.log('✅ .env file found');
    } else {
      console.log('❌ .env file not found');
      console.log('💡 Copy .env.example to .env and configure your values');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking .env file:', error.message);
    return false;
  }

  // Load environment variables
  dotenv.config({ path: envPath });

  let allValid = true;
  const warnings = [];

  console.log('\n📋 Checking required variables:');

  for (const [varName, description] of Object.entries(requiredVars)) {
    const value = process.env[varName];

    if (!value || value.includes('your-') || value.includes('YOUR_')) {
      console.log(`❌ ${varName}: Not configured (${description})`);
      allValid = false;
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  }

  console.log('\n📋 Checking recommended variables:');

  for (const [varName, description] of Object.entries(recommendedVars)) {
    const value = process.env[varName];

    if (!value || value.includes('your-') || value.includes('YOUR_')) {
      console.log(`⚠️  ${varName}: Not configured (${description})`);
      warnings.push(`${varName} is not configured`);
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allValid) {
    console.log('🎉 Environment configuration is valid!');
    console.log('🚀 You can now start the development server');
  } else {
    console.log('❌ Environment configuration is incomplete');
    console.log('📝 Please configure the missing variables in your .env file');
    console.log('📖 Refer to .env.example for guidance');
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Configure any missing environment variables');
  console.log('   2. Run: npm run dev (frontend)');
  console.log('   3. Run: npm run server (backend API)');

  return allValid;
}

// Run validation if this script is executed directly
// Normalize paths for Windows compatibility
const normalizedArgv = process.argv[1].replace(/\\/g, '/');
const expectedUrl = `file:///${normalizedArgv}`;

if (import.meta.url === expectedUrl) {
  const isValid = validateEnvironment();
  process.exit(isValid ? 0 : 1);
}

export { validateEnvironment };
