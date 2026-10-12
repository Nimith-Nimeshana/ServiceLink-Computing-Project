import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Configure Vite to process React components and Tailwind CSS classes.
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
});
``