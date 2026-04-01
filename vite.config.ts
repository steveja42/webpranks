import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	build: {
		target: 'ES2020',
		outDir: 'dist',
	},
	esbuild: {
		drop: command === 'build' ? ['console', 'debugger'] : []
	}
}))
