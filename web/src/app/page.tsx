"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { ThemeToggle } from "@/components/ThemeToggle";
import { login } from "@/lib/api";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.ok) {
      router.push("/log");
    } else {
      setError(res.error);
    }
  }

  return (
    <main className={styles.screen}>
      <div className={styles.toggleWrap}>
        <ThemeToggle />
      </div>

      <section className={styles.card}>
        <form className={styles.formSide} onSubmit={handleSubmit}>
          <Brand size={34} />

          <div className={styles.heading}>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.subtitle}>
              Welcome back. Log field locations in seconds.
            </p>
          </div>

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            revealable
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" icon={ArrowRight} fullWidth disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <aside className={styles.accentSide}>
          <div className={styles.plantWrap}>
            <div className={styles.plantCard}>
              {/* Decorative pixel-art motif from the design system */}
              <img
                className={`${styles.plantImg} pixelated`}
                src="/pixel-plant.png"
                alt=""
                width={220}
                height={220}
              />
            </div>
          </div>
          <div className={styles.quote}>
            <p className={styles.quoteText}>Map the places that matter.</p>
            <p className={styles.quoteSub}>
              A simple log for the field — one location at a time.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
