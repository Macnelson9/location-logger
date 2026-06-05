import { Brand } from "@/components/Brand";
import styles from "./offline.module.css";

/**
 * Static fallback shown by the service worker when a navigation is attempted
 * with no network. Kept dependency-free so it caches and renders fully offline.
 */
export default function OfflinePage() {
  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <Brand size={34} />
        <div className={styles.text}>
          <h1 className={styles.title}>You&rsquo;re offline</h1>
          <p className={styles.sub}>
            LocationLog needs a connection to load and save locations. Reconnect
            and try again.
          </p>
        </div>
      </div>
    </main>
  );
}
