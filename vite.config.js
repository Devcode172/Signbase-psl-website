import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { authApiPlugin } from './server/authPlugin.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), authApiPlugin(env)],
    base: './',
  };
});
