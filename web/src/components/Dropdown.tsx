import { useId } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Field.module.css";

interface DropdownProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  id?: string;
}

export function Dropdown({
  label,
  placeholder = "Select option",
  value,
  onChange,
  options,
  id,
}: DropdownProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const isPlaceholder = value === "";

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <div className={styles.control}>
        <select
          id={fieldId}
          className={`${styles.select} ${isPlaceholder ? styles.placeholder : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.chevron} size={18} strokeWidth={2} />
      </div>
    </div>
  );
}
