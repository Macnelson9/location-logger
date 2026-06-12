"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LocateFixed, Check } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Dropdown } from "@/components/Dropdown";
import { CoordChip } from "@/components/CoordChip";
import { createLocation, getCategories, getLocations, getMe } from "@/lib/api";
import { getCurrentCoords, type Coords } from "@/lib/geo";
import type { Category, User } from "@/lib/types";
import styles from "./log.module.css";

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
function MapPanel({ coords }: { coords: Coords | null }) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <LocationMap coords={coords} />
    </div>
  );
}

type CaptureStatus = "idle" | "locating" | "error";

export default function LogLocationPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

      const cats = await getCategories();
      if (!active) return;
      if (cats.ok) setCategories(cats.data);
      else setLoadError("Couldn't load categories. Please refresh.");
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function confirmLocation() {
    setStatus("locating");
    setErrorMsg("");
    try {
      setCoords(await getCurrentCoords());
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Could not get location.");
    }
  }

  const canSave =
    name.trim() !== "" && categoryId !== "" && coords !== null && !saving;

  async function handleSave() {
    if (!canSave || !coords) return;
    setSaving(true);
    setSaveError("");
    const res = await createLocation({
      name: name.trim(),
      category_id: Number(categoryId),
      lat: coords.lat,
      lng: coords.lng,
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setCategoryId("");
      setCoords(null);
      setStatus("idle");
    } else {
      const fields = res.fieldErrors ? Object.values(res.fieldErrors) : [];
      setSaveError(fields.length ? fields.join(" ") : res.error);
    }
  }

  if (!user) {
    return (
      <div className={styles.screen}>
        <main
          className={styles.body}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <span className={styles.formSub}>Loading…</span>
        </main>
      </div>
    );
  }

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <div className={styles.screen}>
      <Topbar email={user.email} />

      <main className={styles.body}>
        <section className={styles.formCard}>
          <div className={styles.formHead}>
            <h1 className={styles.formTitle}>Log a location</h1>
            <p className={styles.formSub}>
              Name it, classify it, and capture the coordinates.
            </p>
            {loadError && <span className={styles.error}>{loadError}</span>}
          </div>

          <TextField
            label="Name of location"
            placeholder="e.g. Central Park"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <Dropdown
              label="Category"
              placeholder="Select category"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
            />
            <p className={styles.typeHelp} style={{ marginTop: 7 }}>
              Choose the category that best fits this place.
            </p>
          </div>

          <div className={styles.locationBlock}>
            <span className={styles.locLabel}>Current location</span>
            <Button
              variant="tonal"
              icon={LocateFixed}
              fullWidth
              onClick={confirmLocation}
              disabled={status === "locating"}
            >
              {status === "locating" ? "Locating…" : "Confirm location"}
            </Button>
            {coords && (
              <CoordChip
                lat={coords.lat}
                lng={coords.lng}
                onRecapture={confirmLocation}
              />
            )}
            {status === "error" && <span className={styles.error}>{errorMsg}</span>}
          </div>

          <Button icon={Check} fullWidth onClick={handleSave} disabled={!canSave}>
            {saving ? "Saving…" : "Save location"}
          </Button>
          {saveError && <span className={styles.error}>{saveError}</span>}
        </section>

        <section className={styles.mapPanel}>
          <MapPanel coords={coords} />
        </section>
      </main>
    </div>
  );
}
