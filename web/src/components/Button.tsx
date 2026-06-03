import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./Button.module.css";

type Variant = "primary" | "tonal";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: LucideIcon;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  icon: Icon,
  fullWidth = false,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {Icon && <Icon size={17} strokeWidth={2} />}
      <span>{children}</span>
    </button>
  );
}
