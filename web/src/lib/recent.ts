import type { BuildingType } from "./buildingTypes";

export interface LoggedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: BuildingType;
}

export const SAMPLE_RECENT: LoggedLocation[] = [
  { id: "1", name: "Central Mosque", lat: 6.5244, lng: 3.3792, type: "Religious" },
  { id: "2", name: "City Hall Annex", lat: 6.45531, lng: 3.3958, type: "Government" },
  { id: "3", name: "Bright Future Academy", lat: 6.6012, lng: 3.3511, type: "Schools" },
  { id: "4", name: "Marina Plaza Mall", lat: 6.4507, lng: 3.4041, type: "Commercial" },
  { id: "5", name: "12 Adeola Estate", lat: 6.4321, lng: 3.4219, type: "Residential" },
  { id: "6", name: "St. Luke Clinic", lat: 6.5188, lng: 3.3645, type: "Healthcare" },
];

/** Format coordinates the way the design shows them: 5 decimal places. */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
