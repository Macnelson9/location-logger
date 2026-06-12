# Location Logger

A lightweight web app for logging environments out in the field — name a place,
classify what kind of building it is, and capture its GPS coordinates. It feeds
the map service we're building with clean, structured location data.

## What it does

- **Log a location** — name it, pick a category (Restaurant, Cafe, Park, Museum,
  Hotel, Hospital, School, Shopping Mall, Gas Station, Parking Lot — served by
  the API), and capture live coordinates from the browser's geolocation.
- **Recent locations** — see every location you've saved, loaded from the API.
- **Light & dark themes** — toggle to match your environment.

> Sign-in uses real session-based auth against the backend API. The session
> cookie is set on login and cleared on logout.

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

The frontend talks to the **Goyin Locations API**, expected at
`http://localhost:5001` — start it before signing in. Calls to `/api/*` are
proxied there (see `next.config.ts`), so the browser stays same-origin (the
session cookie is first-party and the strict CSP holds). Point at a different
backend with the `API_PROXY_TARGET` env var.

Other scripts: `npm run build` (production build), `npm run start` (serve the
build).

## Project layout

```
web/src/
  app/            # routes: / (login), /log (logger)
  components/     # reusable UI: Button, TextField, Dropdown, CoordChip, …
  lib/            # api.ts (API client), types.ts, coord formatting
  middleware.ts   # nonce-based Content-Security-Policy
```

## Security notes

- Strict, **nonce-based CSP** set in `middleware.ts` (no `unsafe-inline` scripts).
- Hardening headers in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`. `npm audit` is clean.
