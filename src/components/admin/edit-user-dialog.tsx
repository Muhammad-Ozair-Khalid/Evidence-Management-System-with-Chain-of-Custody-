"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Role } from "@prisma/client";
import { updateUser } from "@/actions/users";
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

export type EditableUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  badgeNumber: string | null;
};

export function EditUserDialog({ user }: { user: EditableUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("userId", user.id);
    startTransition(async () => {
      const result = await updateUser(formData);
      if (!result.ok) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Update failed",
          description: result.error,
        });
        return;
      }
      setOpen(false);
      toast({
        variant: "admin",
        title: "User updated",
        description: "Profile / role changes have been saved and audited.",
      });
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Edit ${user.name}`}
          title="Edit user"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update profile or role for {user.email}. Role changes are audited.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor={`edit-name-${user.id}`}>Full name</Label>
            <Input
              id={`edit-name-${user.id}`}
              name="name"
              required
              minLength={2}
              defaultValue={user.name}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={user.email}
              disabled
              className="mt-1.5 opacity-70"
            />
          </div>
          <div>
            <Label htmlFor={`edit-badge-${user.id}`}>Badge number</Label>
            <Input
              id={`edit-badge-${user.id}`}
              name="badgeNumber"
              defaultValue={user.badgeNumber ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={`edit-role-${user.id}`}>Role</Label>
            <select
              id={`edit-role-${user.id}`}
              name="role"
              required
              defaultValue={user.role}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
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
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
