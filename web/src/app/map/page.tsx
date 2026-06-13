"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { getMapLocations, getMe } from "@/lib/api";
import type { ApiLocation, User } from "@/lib/types";
import styles from "./map.module.css";

// Leaflet touches `window`, so the map is client-only.
const LocationMap = dynamic(
  () => import("@/components/LocationMap").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Loading map…</div>,
  },
);

// `dynamic()` wraps the component in an unsized div, breaking `height: 100%`
// on the map canvas. This thin wrapper restores the full-height chain.
function MapPanel({
  locations,
  focusId,
}: {
  locations: ApiLocation[];
  focusId: number | null;
}) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <LocationMap locations={locations} focusId={focusId} />
    </div>
  );
}

function MapView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusParam = searchParams.get("focus");
  const focusId = focusParam ? Number(focusParam) : null;

  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await getMe();
      if (!active) return;
      if (!me.ok) {
        router.replace("/");
        return;
      }
      setUser(me.data);

      const locs = await getMapLocations();
      if (!active) return;
      if (locs.ok) setLocations(locs.data);
      else setLoadError("Couldn't load the map. Please refresh.");
    })();
    return () => {
      active = false;
    };
  }, [router]);

  if (!user) {
    return (
      <div className={styles.screen}>
        <main
          className={styles.body}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <span className={styles.sub}>Loading…</span>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <Topbar email={user.email} />

      <main className={styles.body}>
        <div className={styles.head}>
          <h1 className={styles.title}>Map</h1>
          <p className={styles.sub}>
            Every logged location. Tap a pin to see its name and coordinates.
          </p>
          {loadError && <span className={styles.error}>{loadError}</span>}
        </div>

        <section className={styles.mapPanel}>
          <MapPanel locations={locations} focusId={focusId} />
        </section>
      </main>
    </div>
  );
}

export default function MapPage() {
  // useSearchParams() requires a Suspense boundary during prerender.
  return (
    <Suspense fallback={null}>
      <MapView />
    </Suspense>
  );
}
