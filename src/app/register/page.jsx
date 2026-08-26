"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Input from "@/components/Input";
import Button from "@/components/Button";
import theme from "@/lib/theme";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Success — send them to the services page
    router.push("/services");
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
          Create an account
        </h1>

        {error && (
          <p style={{ background: theme.colors.dangerBg, color: theme.colors.danger, padding: "0.6rem 0.9rem", borderRadius: theme.radii.sm, fontSize: "0.9rem", marginBottom: theme.spacing.md }}>
            {error}
          </p>
        )}

        <div style={{ marginBottom: theme.spacing.md }}>
          <Input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: theme.spacing.md }}>
          <Input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

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
          {loading ? "Creating..." : "Sign up"}
        </Button>

        <p style={{ textAlign: "center", color: theme.colors.textMuted, fontSize: "0.9rem", marginTop: theme.spacing.lg }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: theme.colors.primary, fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
