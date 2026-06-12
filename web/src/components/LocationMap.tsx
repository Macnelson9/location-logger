"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coords } from "@/lib/geo";
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

/**
 * Interactive Leaflet map. Client-only (touches `window`); load it via a
 * `dynamic(..., { ssr: false })` import. When `coords` is set, the map flies to
 * the point and drops a pin, giving the user a visual of what they captured.
 */
export function LocationMap({ coords }: { coords: Coords | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

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
    };
  }, []);

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
