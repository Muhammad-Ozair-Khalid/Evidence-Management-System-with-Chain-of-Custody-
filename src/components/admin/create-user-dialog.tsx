"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, UserPlus } from "lucide-react";
import { Role } from "@prisma/client";
import { createUser } from "@/actions/users";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_OPTIONS = Object.values(Role);

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function reset() {
    setError(null);
    setTempPassword(null);
    setCreatedEmail(null);
    setCopied(false);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createUser(formData);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Could not create user",
          description: result.error,
        });
        return;
      }
      setTempPassword(result.tempPassword);
      setCreatedEmail(result.email);
      toast({
        variant: "admin",
        title: "User created",
        description: `Account ready for ${result.email}. Copy the temporary password now.`,
      });
      router.refresh();
    });
  }

  async function copyPassword() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          style={{ backgroundColor: "#5C6B7A" }}
          className="text-white hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" />
          Invite / Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="border-b border-accent-admin/20 bg-accent-admin/[0.08] px-6 py-4">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Generates a temporary password shown once. Ask the user to change
              it on first login via Account Settings.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
        {tempPassword ? (
          <div className="space-y-4">
            <div
              role="status"
              className="rounded-xl border border-accent-admin/30 bg-accent-admin/10 px-3 py-3 text-sm"
            >
              Account created for{" "}
              <span className="font-medium">{createdEmail}</span>.
            </div>
            <div>
              <Label>Temporary password — copy now</Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  readOnly
                  value={tempPassword}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyPassword}
                  aria-label="Copy temporary password"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-accent-evidence" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-accent-integrity">
                This password is shown once and cannot be retrieved again.
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              style={{ backgroundColor: "#5C6B7A" }}
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Full name</Label>
              <Input
                id="create-name"
                name="name"
                required
                minLength={2}
                placeholder="e.g. Fatima Khan"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                name="email"
                type="email"
                required
                placeholder="name@ems.local"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="create-badge">Badge number (optional)</Label>
              <Input
                id="create-badge"
                name="badgeNumber"
                placeholder="e.g. NCERT-042"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="create-role">Role</Label>
              <select
                id="create-role"
                name="role"
                required
                defaultValue="CUSTODIAN"
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-muted-ems">
                CUSTODIAN hold · EXAMINER register · SUPERVISOR resolve · ADMIN
                users
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2 text-sm text-accent-integrity"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="w-full text-white hover:opacity-90"
              style={{ backgroundColor: "#5C6B7A" }}
            >
              {pending ? "Creating…" : "Create user"}
            </Button>
          </form>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
