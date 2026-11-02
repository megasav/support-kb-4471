import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const layout = (p) => fileURLToPath(new URL(p, import.meta.url));

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: layout('./src/lib/layouts/runbook.svelte') } })],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, strict: false }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['*'], handleHttpError: 'warn' },
  },
};
