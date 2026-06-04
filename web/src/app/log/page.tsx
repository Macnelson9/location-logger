"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Check } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Dropdown } from "@/components/Dropdown";
import { CoordChip } from "@/components/CoordChip";
import { RecentRow } from "@/components/RecentRow";
import { LocationModal } from "@/components/LocationModal";
import { createLocation, getCategories, getLocations, getMe } from "@/lib/api";
import { getCurrentCoords, type Coords } from "@/lib/geo";
import type { ApiLocation, Category, User } from "@/lib/types";
import styles from "./log.module.css";

type CaptureStatus = "idle" | "locating" | "error";

export default function LogLocationPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recent, setRecent] = useState<ApiLocation[]>([]);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [editing, setEditing] = useState<ApiLocation | null>(null);

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

      const [cats, locs] = await Promise.all([getCategories(), getLocations()]);
      if (!active) return;
      if (cats.ok) setCategories(cats.data);
      if (locs.ok) setRecent(locs.data);
      if (!cats.ok || !locs.ok) {
        setLoadError("Couldn't load some data. Please refresh.");
      }
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
      setRecent((prev) => [res.data, ...prev]);
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

        <section className={styles.recentPanel}>
          <div className={styles.recentHead}>
            <h2 className={styles.recentTitle}>Recent locations</h2>
            <span className={styles.count}>{recent.length}</span>
          </div>
          {loadError && <span className={styles.error}>{loadError}</span>}
          <div className={styles.recentList}>
            {recent.map((loc) => (
              <RecentRow
                key={loc.id}
                location={loc}
                onClick={() => setEditing(loc)}
              />
            ))}
          </div>
        </section>
      </main>

      {editing && (
        <LocationModal
          location={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onUpdated={(updated) =>
            setRecent((prev) =>
              prev.map((l) => (l.id === updated.id ? updated : l)),
            )
          }
          onDeleted={(id) =>
            setRecent((prev) => prev.filter((l) => l.id !== id))
          }
        />
      )}
    </div>
  );
}
