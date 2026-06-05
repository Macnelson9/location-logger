import { MapPin } from "lucide-react";
import type { ApiLocation } from "@/lib/types";
import { formatCoords } from "@/lib/recent";
import styles from "./RecentRow.module.css";

export function RecentRow({
  location,
  onClick,
}: {
  location: ApiLocation;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className={styles.pin}>
        <MapPin size={21} strokeWidth={2} />
      </span>
      <div className={styles.text}>
        <span className={styles.name}>{location.name}</span>
        <span className={styles.coords}>
          {formatCoords(location.lat, location.lng)}
        </span>
      </div>
      <span className={styles.badge}>{location.category}</span>
    </>
  );

  // Read-only rows (e.g. the Browse page) get a non-interactive container so
  // they aren't misleadingly clickable.
  if (!onClick) {
    return <div className={`${styles.row} ${styles.static}`}>{inner}</div>;
  }

  return (
    <button type="button" className={styles.row} onClick={onClick}>
      {inner}
    </button>
  );
}
