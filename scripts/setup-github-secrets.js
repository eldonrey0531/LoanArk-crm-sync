#!/usr/bin/env node

/**
 * GitHub Secrets Setup Helper
 * Generates commands to set up required GitHub secrets for CI/CD
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 GitHub Secrets Setup Helper');
console.log('==============================\n');

console.log('📋 Required GitHub Secrets:');
console.log('---------------------------');

const secrets = [
  {
    name: 'VITE_SUPABASE_URL',
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co'
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous/public key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    name: 'VITE_HUBSPOT_CLIENT_ID',
    description: 'HubSpot OAuth client ID',
    example: '12345678-1234-1234-1234-123456789012'
  },
  {
    name: 'VITE_HUBSPOT_CLIENT_SECRET',
    description: 'HubSpot OAuth client secret',
    example: 'your-hubspot-client-secret'
  },
  {
    name: 'VITE_API_BASE_URL',
    description: 'API base URL for production',
    example: 'https://your-api-domain.com'
  },
  {
    name: 'SUPABASE_ACCESS_TOKEN',
    description: 'Supabase service role key for database operations',
    example: 'your-supabase-service-role-key'
  },
  {
    name: 'SUPABASE_PROJECT_REF',
    description: 'Supabase project reference ID',
    example: 'your-project-ref'
  },
  {
    name: 'NETLIFY_AUTH_TOKEN',
    description: 'Netlify authentication token',
    example: 'your-netlify-auth-token'
  },
  {
    name: 'NETLIFY_SITE_ID',
    description: 'Netlify site ID',
    example: 'your-netlify-site-id'
  },
  {
    name: 'SLACK_WEBHOOK_URL',
    description: 'Slack webhook URL for notifications (optional)',
    example: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
  }
];

secrets.forEach((secret, index) => {
  console.log(`${index + 1}. ${secret.name}`);
  console.log(`   Description: ${secret.description}`);
  console.log(`   Example: ${secret.example}`);
  console.log('');
});

console.log('🚀 Setup Commands:');
console.log('------------------');
console.log('Run these commands in your terminal (replace with actual values):');
console.log('');

secrets.forEach(secret => {
  console.log(`# ${secret.description}`);
  console.log(`gh secret set ${secret.name} --body "YOUR_${secret.name}_VALUE"`);
  console.log('');
});

console.log('📖 Additional Setup Steps:');
console.log('-------------------------');
console.log('1. Install GitHub CLI: https://cli.github.com/');
console.log('2. Authenticate: gh auth login');
console.log('3. Ensure you have admin access to the repository');
console.log('4. Run the commands above with your actual secret values');
console.log('');

console.log('🔗 Useful Links:');
console.log('---------------');
console.log('• Supabase Project Settings: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api');
console.log('• HubSpot Developer Portal: https://developers.hubspot.com/');
console.log('• Netlify Site Settings: https://app.netlify.com/sites/YOUR_SITE/settings/general');
console.log('• GitHub Secrets Documentation: https://docs.github.com/en/actions/security-guides/encrypted-secrets');
console.log('');

console.log('✅ After setting up secrets, your CI/CD pipeline will be fully functional!');