"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: theme is only known on the client.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";
  const icon = compact ? 15 : 17;

  return (
    <div
      className={`${styles.toggle} ${compact ? styles.compact : ""}`}
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        className={`${styles.btn} ${!isDark ? styles.active : ""}`}
        aria-pressed={!isDark}
        aria-label="Light mode"
        onClick={() => setTheme("light")}
      >
        <Sun size={icon} strokeWidth={2} />
      </button>
      <button
        type="button"
        className={`${styles.btn} ${isDark ? styles.active : ""}`}
        aria-pressed={isDark}
        aria-label="Dark mode"
        onClick={() => setTheme("dark")}
      >
        <Moon size={icon} strokeWidth={2} />
      </button>
    </div>
  );
}
