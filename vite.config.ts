import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';
import { componentTagger } from 'lovable-tagger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ConfigEnv {
  mode: string;
  command: string;
}

export default defineConfig(({ mode }: ConfigEnv) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  return {
    plugins: [react(), isDevelopment && componentTagger()].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@integrations': path.resolve(__dirname, './src/integrations'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@lib': path.resolve(__dirname, './src/lib'),
      },
    },

    server: {
      port: 5173,
      host: 'localhost',
      strictPort: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            utils: ['clsx', 'tailwind-merge', 'date-fns'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        '@supabase/supabase-js',
      ],
      exclude: ['lucide-react'],
    },

    define: {
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || '1.0.0'
      ),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
  };
});
