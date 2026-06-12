import { NextRequest, NextResponse } from "next/server";

/**
 * Nonce-based Content-Security-Policy.
 *
 * A strict `script-src 'self'` (no `'unsafe-inline'`) blocks Next.js's own
 * inline bootstrap/hydration scripts, which breaks client-side hydration
 * entirely. The secure way to keep a strict policy while still allowing those
 * legitimate inline scripts is a per-request nonce: Next.js automatically reads
 * the nonce from the request's CSP header and stamps it onto every script tag
 * it emits.
 *
 * Note: this middleware does NOT perform auth (the class of bug behind
 * CVE-2025-29927). It only generates a nonce and sets response security headers.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    // OpenStreetMap raster tiles load as <img>; allow that one host only.
    "img-src 'self' data: https://*.tile.openstreetmap.org",
    // next/font injects an inline <style>; allow inline styles.
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  // Pass the nonce (and the CSP) forward on the request so Next can apply the
  // nonce to its generated scripts and so server components can read it.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Run on page/document requests; skip Next static assets and the favicon.
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
