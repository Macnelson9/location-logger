import { MapPin, Pencil } from "lucide-react";
import type { ApiLocation } from "@/lib/types";
import { formatCoords } from "@/lib/recent";
import styles from "./RecentRow.module.css";

export function RecentRow({
  location,
  onOpen,
  onEdit,
}: {
  location: ApiLocation;
  /** Primary action: open this location (e.g. show it on the map). */
  onOpen?: () => void;
  /** Secondary action: open the edit/delete modal. Renders a pencil button. */
  onEdit?: () => void;
}) {
  const content = (
    <>
      <span className={styles.pin}>
        <MapPin size={21} strokeWidth={2} />
      </span>
      <div className={styles.text}>
        <span className={styles.name}>{location.name}</span>
        <span className={styles.coords}>
          {formatCoords(location.lat, location.lng)}
        </span>
        <span className={styles.coordsMobile}>{location.category}</span>
      </div>
      <span className={styles.badge}>{location.category}</span>
    </>
  );

  // Read-only rows (e.g. the Browse page) get a non-interactive container so
  // they aren't misleadingly clickable.
  if (!onOpen) {
    return <div className={`${styles.row} ${styles.static}`}>{content}</div>;
  }

  return (
    <div className={styles.row}>
      <button type="button" className={styles.main} onClick={onOpen}>
        {content}
      </button>
      {onEdit && (
        <button
          type="button"
          className={styles.edit}
          aria-label={`Edit ${location.name}`}
          onClick={onEdit}
        >
          <Pencil size={17} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
