import { Check, RefreshCw } from "lucide-react";
import styles from "./CoordChip.module.css";

interface CoordChipProps {
  lat: number;
  lng: number;
  onRecapture?: () => void;
}

export function CoordChip({ lat, lng, onRecapture }: CoordChipProps) {
  return (
    <div className={styles.chip}>
      <span className={styles.ok}>
        <Check size={17} strokeWidth={2.5} />
      </span>
      <div className={styles.mid}>
        <span className={styles.status}>Location captured</span>
        <span className={styles.coords}>
          Lat {lat.toFixed(5)}&nbsp;&nbsp;&nbsp;&nbsp;Lng {lng.toFixed(5)}
        </span>
      </div>
      <button
        type="button"
        className={styles.recapture}
        aria-label="Re-capture location"
        onClick={onRecapture}
      >
        <RefreshCw size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
