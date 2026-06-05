import type { InputHTMLAttributes, ReactNode } from "react";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./Field.module.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Optional element rendered inside the field, after the input. Ignored when
   *  the field renders its own reveal toggle. */
  trailing?: ReactNode;
  /** For `type="password"` fields: show an eye button that toggles the value
   *  between hidden and visible. */
  revealable?: boolean;
}

export function TextField({
  label,
  id,
  trailing,
  revealable,
  type,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const showToggle = revealable && isPassword;
  const inputType = showToggle && revealed ? "text" : type;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <div className={styles.control}>
        <input id={fieldId} className={styles.input} type={inputType} {...rest} />
        {showToggle ? (
          <button
            type="button"
            className={styles.adornment}
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
          >
            {revealed ? (
              <EyeOff size={18} strokeWidth={2} />
            ) : (
              <Eye size={18} strokeWidth={2} />
            )}
          </button>
        ) : (
          trailing
        )}
      </div>
    </div>
  );
}
