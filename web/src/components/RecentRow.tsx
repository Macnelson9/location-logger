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
  return (
    <button type="button" className={styles.row} onClick={onClick}>
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
    </button>
  );
}
