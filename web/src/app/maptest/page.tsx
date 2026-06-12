"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "../log/log.module.css";
const LocationMap = dynamic(
  () => import("@/components/LocationMap").then((m) => m.LocationMap),
  { ssr: false, loading: () => <div className={styles.mapLoading}>Loading map…</div> },
);
export default function MapTest() {
  const [coords] = useState<{ lat: number; lng: number } | null>(null);
  return (
    <div className={styles.screen}>
      <div style={{ height: 64, background: "#222" }} />
      <main className={styles.body}>
        <section className={styles.formCard}><div style={{height:600}}>form</div></section>
        <section className={styles.mapPanel}>
          <div style={{ height: "100%", width: "100%" }}>
            <LocationMap coords={coords} />
          </div>
        </section>
      </main>
    </div>
  );
}
