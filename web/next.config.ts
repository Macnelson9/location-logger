import type { NextConfig } from "next";

/**
 * Security-conscious config.
 * - `poweredByHeader: false` removes the `X-Powered-By` version fingerprint.
 * - Static security headers are applied to every route here. The
 *   Content-Security-Policy is set in `middleware.ts` instead, because it needs
 *   a per-request nonce (a static `script-src 'self'` would block Next.js's own
 *   inline hydration scripts and break the app). Auth is intentionally NOT
 *   handled in middleware (avoids the class of bug behind CVE-2025-29927).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // geolocation is needed by the app on its own origin only
    value: "geolocation=(self), camera=(), microphone=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Pin the workspace root to this app (a stray lockfile exists in $HOME).
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Proxy API calls to the backend so the browser only ever talks to its own
  // origin: the session cookie stays first-party, there's no CORS, and the
  // strict `connect-src 'self'` CSP in middleware.ts keeps holding.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? "http://localhost:5001";
    return [{ source: "/api/:path*", destination: `${target}/api/:path*` }];
  },
};

export default nextConfig;
