"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { TextField } from "@/components/TextField";
import { Dropdown } from "@/components/Dropdown";
import { RecentRow } from "@/components/RecentRow";
import { getCategories, getMapLocations, getMe } from "@/lib/api";
import { filterAndSortLocations, type SortKey } from "@/lib/browse";
import type { ApiLocation, Category, User } from "@/lib/types";
import styles from "./browse.module.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name (A–Z)" },
];

export default function BrowsePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

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

      const [locs, cats] = await Promise.all([
        getMapLocations(),
        getCategories(),
      ]);
      if (!active) return;
      if (locs.ok) setLocations(locs.data);
      if (cats.ok) setCategories(cats.data);
      if (!locs.ok) setLoadError("Couldn't load locations. Please refresh.");
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const visible = useMemo(
    () => filterAndSortLocations(locations, { query, categoryId, sort }),
    [locations, query, categoryId, sort],
  );

  if (!user) {
    return (
      <div className={styles.screen}>
        <main
          className={styles.body}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <span className={styles.sub}>Loading…</span>
        </main>
      </div>
    );
  }

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className={styles.screen}>
      <Topbar email={user.email} />

      <main className={styles.body}>
        <div className={styles.head}>
          <h1 className={styles.title}>Browse locations</h1>
          <p className={styles.sub}>
            Every place logged so far. Tap a location to see it on the map, or
            check here before logging to avoid duplicates.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.search}>
            <TextField
              label="Search"
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.filter}>
            <Dropdown
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
            />
          </div>
          <div className={styles.filter}>
            <Dropdown
              label="Sort by"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        <div className={styles.resultsHead}>
          <h2 className={styles.resultsTitle}>Locations</h2>
          <span className={styles.count}>{visible.length}</span>
        </div>

        {loadError && <span className={styles.error}>{loadError}</span>}

        {loading ? (
          <span className={styles.sub}>Loading…</span>
        ) : visible.length === 0 ? (
          <span className={styles.empty}>
            {locations.length === 0
              ? "No locations have been logged yet."
              : "No locations match your filters."}
          </span>
        ) : (
          <div className={styles.list}>
            {visible.map((loc) => (
              <RecentRow
                key={loc.id}
                location={loc}
                onOpen={() => router.push(`/map?focus=${loc.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
