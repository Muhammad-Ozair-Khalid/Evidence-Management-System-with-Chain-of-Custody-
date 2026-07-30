"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AlertTriangle, FileSearch, Loader2, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Tamper-evident by design",
    body: "SHA-256 recomputed server-side on every handoff; mismatches are flagged, never silently overwritten.",
  },
  {
    icon: FileSearch,
    title: "Append-only audit trail",
    body: "Every registration, transfer, resolution, and report is recorded and exportable.",
  },
  {
    icon: AlertTriangle,
    title: "Supervisor escalation",
    body: "Integrity flags block movement until a supervisor records a written resolution.",
  },
];

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-sidebar p-10 lg:flex lg:flex-col lg:justify-between">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-audit opacity-[0.10] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-accent-evidence opacity-[0.08] blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <LogoMark size={36} />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">EMS</p>
          <p className="text-[11px] text-sidebar-muted">Chain of Custody</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-white">
          Digital evidence, provably intact.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sidebar-text">
          A forensic inventory and custody ledger built so that every exhibit can
          answer one question without ambiguity: who held it, when, and was it
          altered?
        </p>

        <ul className="mt-8 space-y-5">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[#95A0B0] ring-1 ring-white/10"
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-sidebar-muted">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-[11px] text-sidebar-muted">
        NCERT Forensic Evidence Unit · Development environment
      </p>
    </div>
  );
}

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
    <div className="w-full max-w-sm">
      <div className="mb-8 lg:hidden">
        <LogoMark size={40} />
      </div>

      <h1 className="text-page-title text-canvas-foreground">Sign in</h1>
      <p className="mt-1.5 text-muted-ems">
        Use your issued EMS credentials to continue.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
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
            className="h-10"
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
            className="h-10"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="animate-rise flex items-start gap-2 rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2.5 text-sm text-accent-integrity"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          className="h-10 w-full text-white"
          disabled={loading}
          style={{ backgroundColor: "#3F4A5A" }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 rounded-md border border-dashed border-border bg-secondary/50 px-3.5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Demo accounts
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-mono text-canvas-foreground">
            admin@ems.local
          </span>{" "}
          ·{" "}
          <span className="font-mono text-canvas-foreground">
            supervisor@ems.local
          </span>{" "}
          ·{" "}
          <span className="font-mono text-canvas-foreground">
            examiner1@ems.local
          </span>{" "}
          ·{" "}
          <span className="font-mono text-canvas-foreground">
            custodian1@ems.local
          </span>
          <br />
          Password:{" "}
          <span className="font-mono text-canvas-foreground">Password123!</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-2">
        <BrandPanel />
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <Suspense
            fallback={
              <Card className="w-full max-w-sm p-8 text-center text-muted-ems">
                Loading…
              </Card>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
