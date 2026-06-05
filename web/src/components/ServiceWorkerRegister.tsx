"use client";

import { useEffect } from "react";

/**
 * Registers the service worker. Renders nothing.
 *
 * Production-only: a service worker caching assets in dev fights Turbopack's
 * hot reload. Registration runs in bundled JS (not an inline script), so it
 * satisfies the strict `script-src 'self'` CSP.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal; the app still works online.
      });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
