"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { RecentRow } from "@/components/RecentRow";
import { LocationModal } from "@/components/LocationModal";
import { getCategories, getLocations, getMe } from "@/lib/api";
import type { ApiLocation, Category, User } from "@/lib/types";
import styles from "./recents.module.css";

export default function RecentsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [recent, setRecent] = useState<ApiLocation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
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

      const [locs, cats] = await Promise.all([getLocations(), getCategories()]);
      if (!active) return;
      if (locs.ok) setRecent(locs.data);
      if (cats.ok) setCategories(cats.data);
      if (!locs.ok) setLoadError("Couldn't load your locations. Please refresh.");
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

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

  return (
    <div className={styles.screen}>
      <Topbar email={user.email} />

      <main className={styles.body}>
        <div className={styles.head}>
          <h1 className={styles.title}>Recent locations</h1>
          <p className={styles.sub}>
            Everything you&rsquo;ve logged. Tap a place to edit or remove it.
          </p>
        </div>

        <div className={styles.resultsHead}>
          <h2 className={styles.resultsTitle}>Your locations</h2>
          <span className={styles.count}>{recent.length}</span>
        </div>

        {loadError && <span className={styles.error}>{loadError}</span>}

        {loading ? (
          <span className={styles.sub}>Loading…</span>
        ) : recent.length === 0 ? (
          <span className={styles.empty}>
            You haven&rsquo;t logged any locations yet.
          </span>
        ) : (
          <div className={styles.list}>
            {recent.map((loc) => (
              <RecentRow
                key={loc.id}
                location={loc}
                onClick={() => setEditing(loc)}
              />
            ))}
          </div>
        )}
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
          onDeleted={(id) => setRecent((prev) => prev.filter((l) => l.id !== id))}
        />
      )}
    </div>
  );
}
