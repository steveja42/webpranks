## Package manager
Use pnpm for all installs and scripts.

## Language
TypeScript throughout — no .js files.

## Framework
Vite + React. No SSR — this is a fully client-side app.

## Routing
React Router v6 under `src/pages/`. Dynamic routes use URL params (`:prank`, `:url`, `:isRunning`). Use `useNavigate`, `useParams` from `react-router-dom`.

## Client components
All components are client-side — Phaser, Matter.js, html2canvas require the DOM. No SSR workarounds needed.

## Environment variables
Use `VITE_` prefix for client-side env vars (e.g. `VITE_GOOGLE_RECAPTCHA_SITE_KEY`). Access via `import.meta.env.VITE_*`.

## Static assets
Static files go in `public/`. Reference them as absolute paths (e.g. `/jesterhead-200.png`).

## Deployment
Netlify. Build config is in netlify.toml. Build command: `pnpm build`. Publish dir: `dist`. Domain is https://webfun.click/

## TypeScript
TypeScript errors in pre-existing Phaser game code are suppressed via `skipLibCheck` and loose settings in `tsconfig.json`. Fix new code properly — don't add new type errors.
