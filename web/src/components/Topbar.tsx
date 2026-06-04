"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { logout } from "@/lib/api";
import styles from "./Topbar.module.css";

export function Topbar({ email }: { email: string }) {
  const router = useRouter();
  const initials = email.slice(0, 2).toUpperCase();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

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
          onClick={handleLogout}
        >
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
