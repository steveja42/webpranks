## Package manager
Use pnpm for all installs and scripts.

## Language
TypeScript throughout — no .js files.

## Framework
Next.js 16.2.1 App Router. No Pages Router patterns (no getServerSideProps, getStaticProps, getInitialProps).

## Routing
File-based App Router under `app/`. Dynamic routes: `app/[prank]/page.tsx`, `app/[prank]/[url]/page.tsx`, `app/[prank]/[url]/[isRunning]/page.tsx`. Use `next/navigation` (`useRouter`, `usePathname`) — not react-router-dom.

## Client components
All components use `'use client'` — this is a fully browser-side app (Phaser, Matter.js, html2canvas require the DOM). Browser-only modules are loaded via `dynamic(() => import(...), { ssr: false })`.

## Environment variables
Use `NEXT_PUBLIC_` prefix for client-side env vars (e.g. `NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY`).

## Static assets
Static files go in `public/`. Reference them as absolute paths (e.g. `/jesterhead-200.png`).

## Deployment
Netlify. Build config is in netlify.toml. Plugin: @netlify/plugin-nextjs. Domain is https://webfun.click/

## TypeScript
TypeScript errors in pre-existing Phaser game code are suppressed via `ignoreBuildErrors: true` in next.config.ts. Fix new code properly — don't add new type errors.
