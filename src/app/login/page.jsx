"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Input from "@/components/Input";
import Button from "@/components/Button";
import theme from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/services");
    router.refresh(); // refresh server components so they see the logged-in state
  };

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: theme.spacing.lg }}>
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.lg,
          boxShadow: theme.shadows.md,
          padding: theme.spacing.xl,
        }}
      >
        <h1
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: "1.75rem",
            color: theme.colors.text,
            textAlign: "center",
            margin: "0 0 1.5rem",
          }}
        >
          Welcome back
        </h1>

        {error && (
          <p style={{ background: theme.colors.dangerBg, color: theme.colors.danger, padding: "0.6rem 0.9rem", borderRadius: theme.radii.sm, fontSize: "0.9rem", marginBottom: theme.spacing.md }}>
            {error}
          </p>
        )}

        <div style={{ marginBottom: theme.spacing.md }}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: theme.spacing.lg }}>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading} fullWidth>
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <p style={{ textAlign: "center", color: theme.colors.textMuted, fontSize: "0.9rem", marginTop: theme.spacing.lg }}>
          No account?{" "}
          <Link href="/register" style={{ color: theme.colors.primary, fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
