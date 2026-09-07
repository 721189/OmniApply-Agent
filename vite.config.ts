import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          // Prevent tree-shaking issues by being explicit about exports
          preserveModules: false,
        },
        // Disable treeshake warnings that cause build to fail
        onwarn(warning, warn) {
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            // Allow circular dependencies; don't fail the build
            return;
          }
          // Use default warning handler for everything else
          warn(warning);
        },
      },
      // Increase chunk size warning threshold
      chunkSizeWarningLimit: 1000,
      // Enable source maps for debugging
      sourcemap: false,
    },
  };
});
