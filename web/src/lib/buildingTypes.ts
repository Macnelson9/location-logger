export const BUILDING_TYPES = [
  "Residential",
  "Government",
  "Commercial",
  "Schools",
  "Religious",
  "Healthcare",
  "Industrial",
  "Other",
] as const;

export type BuildingType = (typeof BUILDING_TYPES)[number];
