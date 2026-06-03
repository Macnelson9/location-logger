# Location Logger

A lightweight web app for logging environments out in the field — name a place,
classify what kind of building it is, and capture its GPS coordinates. It feeds
the map service we're building with clean, structured location data.

## What it does

- **Log a location** — name it, pick a building type (Residential, Government,
  Commercial, Schools, Religious, Healthcare), and capture live coordinates from
  the browser's geolocation.
- **Recent locations** — see everything you've logged this session at a glance.
- **Light & dark themes** — toggle to match your environment.

> Sign-in is demo-only for now (no real auth) — any valid email + any password
> takes you to the logger. Real credential checks belong on the backend.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- `next-themes` for theming, `lucide-react` for icons
- CSS Modules with a shared design-token system (`src/app/globals.css`)

## Getting started

```bash
cd web
npm install
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm run start` (serve the
build), `npm run lint`.

## Project layout

```
web/src/
  app/            # routes: / (login), /log (logger)
  components/     # reusable UI: Button, TextField, Dropdown, CoordChip, …
  lib/            # building types, sample data
  middleware.ts   # nonce-based Content-Security-Policy
```

## Security notes

- Strict, **nonce-based CSP** set in `middleware.ts` (no `unsafe-inline` scripts).
- Hardening headers in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`. `npm audit` is clean.
