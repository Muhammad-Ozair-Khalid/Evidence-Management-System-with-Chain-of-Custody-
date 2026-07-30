import { redirect } from "next/navigation";
import { ModuleBadge } from "@/components/ui-ems/module-badge";
import { PageHeader } from "@/components/ui-ems/page-header";
import { RegisterEvidenceForm } from "@/components/evidence/register-form";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export default async function RegisterEvidencePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "evidence:register")) {
    redirect("/evidence");
  }

  return (
    <div>
      <PageHeader
        title="Register New Evidence"
        subtitle="Assign a unique Evidence ID and capture the intake SHA-256 hash."
        actions={<ModuleBadge module="evidence" />}
      />
      <RegisterEvidenceForm />
    </div>
  );
}
