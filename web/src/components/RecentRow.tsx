import { MapPin } from "lucide-react";
import type { LoggedLocation } from "@/lib/recent";
import { formatCoords } from "@/lib/recent";
import styles from "./RecentRow.module.css";

export function RecentRow({ location }: { location: LoggedLocation }) {
  return (
    <div className={styles.row}>
      <span className={styles.pin}>
        <MapPin size={21} strokeWidth={2} />
      </span>
      <div className={styles.text}>
        <span className={styles.name}>{location.name}</span>
        <span className={styles.coords}>
          {formatCoords(location.lat, location.lng)}
        </span>
      </div>
      <span className={styles.badge}>{location.type}</span>
    </div>
  );
}
