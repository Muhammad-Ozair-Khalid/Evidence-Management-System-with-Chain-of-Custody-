"use client";

import { FormEvent, useState, useTransition } from "react";
import { changeOwnPassword } from "@/actions/account";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await changeOwnPassword(formData);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Password change failed",
          description: result.error,
        });
        return;
      }
      setSuccess(true);
      form.reset();
      toast({
        variant: "admin",
        title: "Password updated",
        description: "Use your new password next time you sign in.",
      });
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Change password</CardTitle>
        <p className="text-muted-ems">
          Requires your current password. Changes are recorded in the audit trail.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="max-w-md space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              At least 10 characters.
            </p>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-1.5"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-md border border-accent-integrity/30 bg-accent-integrity/10 px-3 py-2 text-sm text-accent-integrity"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="rounded-md border border-accent-evidence/30 bg-accent-evidence/10 px-3 py-2 text-sm text-accent-evidence"
            >
              Password updated successfully.
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            style={{ backgroundColor: "#5C6B7A" }}
            className="text-white hover:opacity-90"
          >
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
