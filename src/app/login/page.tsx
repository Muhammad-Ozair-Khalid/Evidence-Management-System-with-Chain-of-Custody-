"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  FileSearch,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

const DEMO_ACCOUNTS = [
  { email: "admin@ems.local", label: "Admin" },
  { email: "supervisor@ems.local", label: "Supervisor" },
  { email: "examiner1@ems.local", label: "Examiner" },
  { email: "custodian1@ems.local", label: "Custodian" },
];

function HashMotif() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.16]"
      aria-hidden
    >
      <div className="absolute -right-8 top-20 font-mono text-[11px] leading-6 text-brand-soft">
        {Array.from({ length: 18 }).map((_, i) => (
          <p
            key={i}
            className="animate-fade"
            style={{
              animationDelay: `${i * 35}ms`,
              animationName: "hashRain",
              animationDuration: "0.6s",
              animationFillMode: "both",
            }}
          >
            {`${(0x1a3f + i * 97).toString(16)}${(0x8c2e + i * 53).toString(16)}…`}
          </p>
        ))}
      </div>
      <div className="absolute bottom-16 left-10 h-px w-40 bg-gradient-to-r from-brand to-transparent" />
      <div className="absolute bottom-16 left-10 h-16 w-px bg-gradient-to-t from-brand/60 to-transparent" />
    </div>
  );
}

function BrandPanel() {
  const [activeHighlight, setActiveHighlight] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveHighlight((v) => (v + 1) % HIGHLIGHTS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0 mesh-brand" />
      <div className="pointer-events-none absolute inset-0 marketing-grid opacity-40" />
      <div
        className="pointer-events-none absolute right-16 top-1/3 h-24 w-24 animate-pulse-ring rounded-full border border-brand/40"
        style={{ ["--glow" as string]: "rgba(11,92,46,0.45)" }}
        aria-hidden
      />
      <HashMotif />

      <Link href="/" className="relative flex items-center gap-3">
        <LogoMark size={36} />
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-white">EMS</p>
          <p className="text-[11px] text-sidebar-muted">Chain of Custody</p>
        </div>
      </Link>

      <div className="relative max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-soft">
          NCERT Forensic Evidence Unit
        </p>
        <h2 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-tight text-white">
          Digital evidence, provably intact.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sidebar-text">
          A forensic inventory and custody ledger built so that every exhibit can
          answer one question without ambiguity: who held it, when, and was it
          altered?
        </p>

        <ul className="mt-8 space-y-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }, i) => {
            const active = i === activeHighlight;
            return (
              <li
                key={title}
                className={cn(
                  "flex gap-3 rounded-lg border p-3 transition-all duration-300",
                  active
                    ? "border-brand/40 bg-brand/10"
                    : "border-transparent opacity-55"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                    active
                      ? "bg-brand/30 text-brand-soft ring-brand/40"
                      : "bg-white/5 text-sidebar-muted ring-white/10"
                  )}
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
            );
          })}
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
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

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
    setFieldErrors({});
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        About EMS
      </Link>

      <div className="mb-8 lg:hidden">
        <LogoMark size={40} />
      </div>

      <h1 className="font-display text-3xl font-bold tracking-tight text-canvas-foreground">
        Sign in
      </h1>
      <p className="mt-1.5 text-muted-ems">
        Use your issued EMS credentials to continue.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((f) => ({ ...f, email: undefined }));
              }
            }}
            placeholder="you@ems.local"
            className={cn(
              "h-10 transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(11,92,46,0.18)]",
              fieldErrors.email && "border-accent-integrity"
            )}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-accent-integrity">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((f) => ({ ...f, password: undefined }));
                }
              }}
              placeholder="••••••••"
              className={cn(
                "h-10 pr-10 transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(11,92,46,0.18)]",
                fieldErrors.password && "border-accent-integrity"
              )}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-canvas-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="text-xs text-accent-integrity">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="animate-shake flex items-start gap-2 rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2.5 text-sm text-accent-integrity"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          className={cn(
            "relative h-10 w-full overflow-hidden bg-brand text-white shadow-glow-brand hover:bg-brand-soft",
            loading && "pointer-events-none"
          )}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="absolute inset-0 animate-shimmer opacity-60" />
              <Loader2 className="relative h-4 w-4 animate-spin" aria-hidden />
              <span className="relative">Signing in…</span>
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 rounded-md border border-dashed border-border bg-secondary/60 px-3.5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Demo accounts
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Click a chip to fill credentials · password{" "}
          <span className="font-mono text-canvas-foreground">Password123!</span>
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => fillDemo(a.email)}
              className="rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/20"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-2 lg:overflow-hidden lg:rounded-none lg:shadow-elevated">
        <BrandPanel />
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <Suspense
            fallback={
              <div className="w-full max-w-sm space-y-6" aria-busy="true">
                <div className="h-4 w-24 animate-shimmer rounded" />
                <div className="space-y-2">
                  <div className="h-8 w-36 animate-shimmer rounded" />
                  <div className="h-4 w-56 animate-shimmer rounded" />
                </div>
                <Card className="space-y-4 border-border/80 p-5 shadow-card">
                  <div className="space-y-2">
                    <div className="h-3 w-12 animate-shimmer rounded" />
                    <div className="h-10 w-full animate-shimmer rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 animate-shimmer rounded" />
                    <div className="h-10 w-full animate-shimmer rounded-md" />
                  </div>
                  <div className="h-10 w-full animate-shimmer rounded-md" />
                </Card>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
