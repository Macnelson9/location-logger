# Backend API Integration — Design

**Date:** 2026-06-03
**Status:** Approved

## Goal

Make the Location Logger live by wiring the Next.js frontend to the Goyin
Locations API (`http://localhost:5001/api`). Replace demo auth and sample data
with real session-based auth, API-driven categories, and persisted locations.

## Networking: same-origin proxy

The app runs on `:3000`, the API on `:5001`. Calling `:5001` directly would be
blocked by the strict `connect-src 'self'` CSP in `middleware.ts`, and the
session cookie would not flow reliably cross-origin.

Solution: a Next.js rewrite so `/api/:path*` → `${API_PROXY_TARGET}/api/:path*`
(`API_PROXY_TARGET` env var, default `http://localhost:5001`). The browser only
ever talks to its own origin: cookies just work, no CORS, CSP stays strict. No
middleware/CSP changes required.

## Modules

### `src/lib/types.ts` (new)
- `User` — `{ id, email, created_at }`
- `Category` — `{ id, name, slug }`
- `ApiLocation` — `{ id, name, category, category_id, user_id, lat, lng, address, created_at }`

### `src/lib/api.ts` (new)
Typed fetch client. All requests are same-origin to `/api/*`, JSON,
`credentials: "include"`. Returns a typed success/error result so callers can
render the API's own error messages.
- `login(email, password)` — POST /login (handles 401)
- `logout()` — POST /logout
- `getMe()` — GET /me (401 = not authed)
- `getCategories()` — GET /categories
- `getLocations()` — GET /locations
- `createLocation({ name, category_id, lat, lng, address? })` — POST /locations
  (handles 400 field errors)

`PUT`/`DELETE` are intentionally omitted — no edit/delete UI exists yet (YAGNI).

### `src/lib/recent.ts` (modified)
- Remove `LoggedLocation` (replaced by `ApiLocation`) and `SAMPLE_RECENT`.
- Keep `formatCoords`.

## UI changes

### `app/page.tsx` (login)
Real `POST /login` on submit: loading state, inline error on 401, redirect to
`/log` on success.

### `app/log/page.tsx`
On mount: `getMe()` (redirect to `/` if 401), then load categories and
locations. The building-type dropdown is populated from API categories (option
value = `category_id`). Save calls `createLocation` and prepends the returned
record. Loading and error states for the initial fetch and the save.

### `components/Topbar.tsx`
Receives the real email from `/me`. Logout button calls `POST /logout` then
redirects to `/`.

### `components/RecentRow.tsx`
Badge renders `location.category` (string from the API).

## Out of scope (this pass)
- Reverse-geocoding the optional `address` field (needs an external geocoder,
  which the strict CSP would block) — locations are created without `address`.
- `PUT`/`DELETE` location endpoints — no UI for them yet.

## README
Update the building-types list and the "demo-only auth" note to reflect real
auth and the API-driven categories (Restaurant, Cafe, Park, Museum, Hotel,
Hospital, School, Shopping Mall, Gas Station, Parking Lot).
