"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Check your credentials and try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-border p-8 shadow-card">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark size={48} />
        <h1 className="mt-4 text-page-title text-canvas-foreground">
          Sign in to EMS
        </h1>
        <p className="mt-1 text-muted-ems">
          Evidence Management System · Chain of Custody
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@ems.local"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2 text-sm text-accent-integrity"
          >
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          style={{ backgroundColor: "#3F4A5A" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8 text-center text-muted-ems">
            Loading…
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
