"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { logout } from "@/lib/api";
import styles from "./Topbar.module.css";

const NAV_LINKS = [
  { href: "/log", label: "Log" },
  { href: "/map", label: "Map" },
  { href: "/recents", label: "Recents" },
  { href: "/browse", label: "Browse" },
];

export function Topbar({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const initials = email.slice(0, 2).toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <Brand size={32} />
        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.navLinkActive : ""
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
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
        <button
          type="button"
          className={styles.hamburger}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </div>

      {menuOpen && (
        <nav className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${
                pathname === link.href ? styles.mobileLinkActive : ""
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            className={styles.mobileLogout}
            onClick={handleLogout}
          >
            <LogOut size={15} strokeWidth={2} />
            Sign out
          </button>
        </nav>
      )}
    </header>
  );
}
