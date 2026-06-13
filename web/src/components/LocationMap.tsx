"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coords } from "@/lib/geo";
import type { ApiLocation } from "@/lib/types";
import styles from "./LocationMap.module.css";

// A neutral starting view until the user captures a point.
const DEFAULT_CENTER: L.LatLngTuple = [9.082, 8.6753];
const DEFAULT_ZOOM = 5;
const FOCUS_ZOOM = 16;

// Leaflet's default marker pulls PNGs from a CDN and breaks under bundlers, so
// we draw our own pin as an inline-SVG divIcon — same-origin, no asset, no CSP hole.
const pinIcon = L.divIcon({
  className: styles.pinWrap,
  html: `
    <svg viewBox="0 0 24 24" width="34" height="34" fill="var(--accent)"
         stroke="white" stroke-width="1.5" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
    </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 32],
});

// Escape user-supplied text before it goes into a popup's HTML string.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Popup markup for a saved location: name, then lat / lng.
function locationPopup(loc: ApiLocation): string {
  return `
    <div class="${styles.popup}">
      <strong class="${styles.popupName}">${escapeHtml(loc.name)}</strong>
      <span class="${styles.popupCoord}">Lat ${loc.lat.toFixed(5)}</span>
      <span class="${styles.popupCoord}">Lng ${loc.lng.toFixed(5)}</span>
    </div>`;
}

/**
 * Interactive Leaflet map. Client-only (touches `window`); load it via a
 * `dynamic(..., { ssr: false })` import.
 *
 * - `coords` (used on /log): flies to a single just-captured point and drops a
 *   pin, giving the user a visual of what they captured.
 * - `locations` (used on /map): renders one pin per saved location, each with a
 *   popup showing its name and coordinates.
 * - `focusId`: when set, flies to that location's pin and opens its popup.
 */
export function LocationMap({
  coords,
  locations,
  focusId,
}: {
  coords?: Coords | null;
  locations?: ApiLocation[];
  focusId?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  // Pins for saved locations, keyed by location id so `focusId` can find them.
  const locationMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // React StrictMode unmounts/remounts effects; Leaflet leaves a _leaflet_id
    // on the container after map.remove(), which causes "already initialized"
    // on the second mount. Clear it before re-initialising.
    const container = containerRef.current as HTMLDivElement & { _leaflet_id?: number };
    delete container._leaflet_id;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Invalidate after first paint so Leaflet measures the real container size.
    const raf = requestAnimationFrame(() => map.invalidateSize());

    // The map mounts inside a flex column; its size isn't final on first paint.
    const resize = () => map.invalidateSize();
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      locationMarkersRef.current.clear();
    };
  }, []);

  // Render a pin per saved location, re-syncing whenever the set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !locations) return;

    const markers = locationMarkersRef.current;
    for (const marker of markers.values()) marker.remove();
    markers.clear();

    for (const loc of locations) {
      const marker = L.marker([loc.lat, loc.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(locationPopup(loc));
      markers.set(loc.id, marker);
    }
  }, [locations]);

  // Fly to a specific location's pin and open its popup.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || focusId == null) return;

    const marker = locationMarkersRef.current.get(focusId);
    if (!marker) return;

    map.flyTo(marker.getLatLng(), FOCUS_ZOOM, { duration: 1.1 });
    marker.openPopup();
  }, [focusId, locations]);

  // Fly to / drop the pin whenever coordinates change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coords) return;

    const point: L.LatLngTuple = [coords.lat, coords.lng];
    map.flyTo(point, FOCUS_ZOOM, { duration: 1.1 });

    if (markerRef.current) {
      markerRef.current.setLatLng(point);
    } else {
      markerRef.current = L.marker(point, { icon: pinIcon }).addTo(map);
    }
  }, [coords]);

  return <div ref={containerRef} className={styles.map} aria-label="Map" />;
}
