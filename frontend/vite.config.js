import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      ...(command === 'serve' ? [basicSsl()] : []),
    ],
    build: {
      outDir: 'build', 
    },
  };
});