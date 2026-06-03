"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Topbar.module.css";

export function Topbar({ email = "michaelofatu@gmail.com" }: { email?: string }) {
  const router = useRouter();
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className={styles.bar}>
      <Brand size={32} />
      <div className={styles.right}>
        <ThemeToggle compact />
        <div className={styles.user}>
          <span className={styles.avatar}>{initials}</span>
          <span className={styles.email}>{email}</span>
        </div>
        <button
          type="button"
          className={styles.logout}
          aria-label="Sign out"
          onClick={() => router.push("/")}
        >
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
