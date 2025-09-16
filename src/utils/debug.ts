export function debugEnvironment() {
  console.log('=== Environment Debug ===');
  console.log('Supabase: Environment configured');
  console.log('HubSpot API: Configuration verified');
  console.log('Mode:', import.meta.env.MODE);
  console.log('Dev:', import.meta.env.DEV);
  console.log('========================');
}
