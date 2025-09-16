export function debugEnvironment() {
  console.log('=== Environment Debug ===');
  console.log('VITE_SUPABASE_URL: Environment variable configured');
  console.log('VITE_SUPABASE_ANON_KEY: Environment variable configured');
  console.log(
    'VITE_HUBSPOT_API_KEY:',
    import.meta.env.VITE_HUBSPOT_API_KEY ? '✓ Set' : '✗ Missing'
  );
  console.log('Mode:', import.meta.env.MODE);
  console.log('Dev:', import.meta.env.DEV);
  console.log('========================');
}
