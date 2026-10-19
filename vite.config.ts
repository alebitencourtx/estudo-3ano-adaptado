import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        jogos: resolve(__dirname, 'jogos/index.html'),
        jogar: resolve(__dirname, 'jogos/jogar.html'),
        jogar3d: resolve(__dirname, 'jogos/jogar-3d.html'),
        pecuaria: resolve(__dirname, 'jogos/pecuaria/index.html'),
        fazenda3d: resolve(__dirname, 'jogos/pecuaria/fazenda-3d.html'),
        agricultura: resolve(__dirname, 'jogos/agricultura/index.html'),
        mineral: resolve(__dirname, 'jogos/mineral/index.html'),
        campoCidade: resolve(__dirname, 'jogos/campo-cidade/index.html'),
        impactos: resolve(__dirname, 'jogos/impactos/index.html'),
      },
    },
  },
});
