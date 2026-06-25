<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shea Allnaturals — project build notes

This repo is **Next.js 16.2.9 / React 19.2 / Tailwind v4 (no config file — tokens live in `app/globals.css` `@theme` blocks) / Turbopack by default**. Use `npm`/`npx` only (pnpm is broken in this environment).

Next.js 16 gotchas that apply here (verified against `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`):
- **Async request APIs:** `cookies()`, `headers()`, `draftMode()` MUST be awaited. `params` and `searchParams` in `page.tsx`/`layout.tsx` are **Promises** — `await props.params`. Use `npx next typegen` for `PageProps`/`LayoutProps` helpers.
- **`next/dynamic` with `ssr:false`** is only allowed inside a **Client Component** (`"use client"`). The 3D hero must be dynamically imported from a client wrapper, never a Server Component.
- **`next/image`:** default `images.qualities` is now `[75]` only — if you pass a `quality` other than 75, add it to `images.qualities` in `next.config`. `images.domains` is deprecated → use `images.remotePatterns`. Local images with query strings need `images.localPatterns`.
- **`next lint` is removed** (`next build` no longer lints). Run ESLint directly. ESLint uses flat config.
- **Redirects/middleware:** the `middleware` convention is renamed to **`proxy`** (`proxy.ts`, export `proxy`). Relevant when we add the 301 redirect map later.
- **Smooth scroll:** Next 16 no longer overrides `scroll-behavior` during navigation unless `<html data-scroll-behavior="smooth">`.

Brand hard rule: **never introduce blue.** Warm "Sun & Soil" palette only (cream/marigold/orange/clay/green/espresso/leaf). Honor `prefers-reduced-motion` on every animation.
