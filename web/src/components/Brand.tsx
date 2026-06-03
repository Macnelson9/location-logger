import { MapPin } from "lucide-react";
import styles from "./Brand.module.css";

export function Brand({ size = 34 }: { size?: number }) {
  const icon = Math.round(size * 0.53);
  return (
    <div className={styles.brand}>
      <span className={styles.logo} style={{ width: size, height: size }}>
        <MapPin size={icon} strokeWidth={2} />
      </span>
      <span className={styles.wordmark}>LocationLog</span>
    </div>
  );
}
