"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, LocateFixed, Trash2, X } from "lucide-react";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Dropdown } from "./Dropdown";
import { deleteLocation, updateLocation, type NewLocation } from "@/lib/api";
import { getCurrentCoords } from "@/lib/geo";
import { formatCoords } from "@/lib/recent";
import type { ApiLocation, Category } from "@/lib/types";
import styles from "./LocationModal.module.css";

interface LocationModalProps {
  location: ApiLocation;
  categories: Category[];
  onClose: () => void;
  onUpdated: (location: ApiLocation) => void;
  onDeleted: (id: number) => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function LocationModal({
  location,
  categories,
  onClose,
  onUpdated,
  onDeleted,
}: LocationModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(location.name);
  const [categoryId, setCategoryId] = useState(String(location.category_id));
  const [coords, setCoords] = useState({ lat: location.lat, lng: location.lng });

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState("");

  // Lock body scroll while the modal is open, and restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    // Trap focus within the dialog.
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function recapture() {
    setLocating(true);
    setGeoError("");
    try {
      setCoords(await getCurrentCoords());
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : "Could not get location.");
    } finally {
      setLocating(false);
    }
  }

  const trimmedName = name.trim();
  const changes: Partial<NewLocation> = {};
  if (trimmedName !== location.name) changes.name = trimmedName;
  if (Number(categoryId) !== location.category_id) changes.category_id = Number(categoryId);
  if (coords.lat !== location.lat) changes.lat = coords.lat;
  if (coords.lng !== location.lng) changes.lng = coords.lng;
  const hasChanges = Object.keys(changes).length > 0;
  const canUpdate = trimmedName !== "" && hasChanges && !saving && !deleting;

  async function handleUpdate() {
    if (!canUpdate) return;
    setSaving(true);
    setError("");
    const res = await updateLocation(location.id, changes);
    setSaving(false);
    if (res.ok) {
      onUpdated(res.data);
      onClose();
    } else {
      const fields = res.fieldErrors ? Object.values(res.fieldErrors) : [];
      setError(fields.length ? fields.join(" ") : res.error);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    const res = await deleteLocation(location.id);
    setDeleting(false);
    if (res.ok) {
      onDeleted(location.id);
      onClose();
    } else {
      setError(res.error);
      setConfirmingDelete(false);
    }
  }

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            Edit location
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.fields}>
          <TextField
            label="Name of location"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Dropdown
            label="Category"
            placeholder="Select category"
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
          />
          <div className={styles.coordsBlock}>
            <span className={styles.coordsLabel}>Coordinates</span>
            <span className={styles.coordsValue}>
              {formatCoords(coords.lat, coords.lng)}
            </span>
            <Button
              variant="tonal"
              icon={LocateFixed}
              fullWidth
              onClick={recapture}
              disabled={locating}
            >
              {locating ? "Locating…" : "Re-capture location"}
            </Button>
            {geoError && <span className={styles.error}>{geoError}</span>}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="tonal" onClick={onClose} disabled={saving || deleting}>
            Cancel
          </Button>
          <Button icon={Check} onClick={handleUpdate} disabled={!canUpdate}>
            {saving ? "Updating…" : "Update"}
          </Button>
        </div>

        <div className={styles.dangerZone}>
          {confirmingDelete ? (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Delete this location?</span>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDelete}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => setConfirmingDelete(true)}
              disabled={saving}
            >
              <Trash2 size={15} strokeWidth={2} />
              Delete location
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
