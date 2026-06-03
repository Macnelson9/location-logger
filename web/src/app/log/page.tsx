"use client";

import { useState } from "react";
import { LocateFixed, Check } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Dropdown } from "@/components/Dropdown";
import { CoordChip } from "@/components/CoordChip";
import { RecentRow } from "@/components/RecentRow";
import { BUILDING_TYPES, type BuildingType } from "@/lib/buildingTypes";
import { SAMPLE_RECENT, type LoggedLocation } from "@/lib/recent";
import styles from "./log.module.css";

type Coords = { lat: number; lng: number };
type CaptureStatus = "idle" | "locating" | "error";

export default function LogLocationPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [recent, setRecent] = useState<LoggedLocation[]>(SAMPLE_RECENT);

  function confirmLocation() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setErrorMsg("Geolocation is not supported by this browser.");
      return;
    }
    setStatus("locating");
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("idle");
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it to capture coordinates."
            : "Could not determine your location. Please try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  const canSave = name.trim() !== "" && type !== "" && coords !== null;

  function handleSave() {
    if (!canSave || !coords) return;
    const entry: LoggedLocation = {
      id: crypto.randomUUID(),
      name: name.trim(),
      lat: coords.lat,
      lng: coords.lng,
      type: type as BuildingType,
    };
    // Payload that a real backend would receive: { name, type, lat, lng }
    setRecent((prev) => [entry, ...prev]);
    setName("");
    setType("");
    setCoords(null);
    setStatus("idle");
  }

  return (
    <div className={styles.screen}>
      <Topbar />

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
            placeholder="e.g. Central Mosque, Ikeja"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <Dropdown
              label="Building type"
              placeholder="Select building type"
              value={type}
              onChange={setType}
              options={BUILDING_TYPES}
            />
            <p className={styles.typeHelp} style={{ marginTop: 7 }}>
              Residential · Government · Commercial · Schools · Religious · Healthcare
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
            Save location
          </Button>
        </section>

        <section className={styles.recentPanel}>
          <div className={styles.recentHead}>
            <h2 className={styles.recentTitle}>Recent locations</h2>
            <span className={styles.count}>{recent.length}</span>
          </div>
          <div className={styles.recentList}>
            {recent.map((loc) => (
              <RecentRow key={loc.id} location={loc} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
