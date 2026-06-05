import type { ApiLocation } from "./types";

export type SortKey = "newest" | "oldest" | "name";

export interface BrowseFilters {
  /** Case-insensitive substring matched against the location name. */
  query: string;
  /** A category id as a string, or "all"/"" for no category filter. */
  categoryId: string;
  sort: SortKey;
}

/**
 * Filter and sort the shared locations shown on the Browse page.
 *
 * Pure: never mutates the input array. This is the seam a future map view would
 * reuse to render the same filtered subset the list shows.
 */
export function filterAndSortLocations(
  locations: ApiLocation[],
  { query, categoryId, sort }: BrowseFilters,
): ApiLocation[] {
  const q = query.trim().toLowerCase();
  const byCategory = categoryId !== "" && categoryId !== "all";

  const filtered = locations.filter((loc) => {
    if (q && !loc.name.toLowerCase().includes(q)) return false;
    if (byCategory && loc.category_id !== Number(categoryId)) return false;
    return true;
  });

  // created_at is a fixed-width "YYYY-MM-DD HH:MM:SS" string, so a lexicographic
  // compare orders chronologically.
  return [...filtered].sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "oldest":
        return a.created_at.localeCompare(b.created_at);
      case "newest":
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
}
