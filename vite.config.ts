import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => {
  // Validate required environment variables in production build
  if (mode === 'production') {
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables for production build:');
      missingVars.forEach((varName) => {
        console.error(`   - ${varName}`);
      });
      console.error('Please configure these variables in your deployment environment.');
      console.error('See .env.example for reference.');
      // Don't fail the build, just warn - let deployment platform handle it
      console.warn('⚠️  Build continuing with fallback values...');
    }
  }

  return {
    plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 8080,
      host: '::', // Required for Lovable compatibility
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
