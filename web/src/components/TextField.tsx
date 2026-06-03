import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import styles from "./Field.module.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, id, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <div className={styles.control}>
        <input id={fieldId} className={styles.input} {...rest} />
      </div>
    </div>
  );
}
