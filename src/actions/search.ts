"use server";

import { getSession } from "@/lib/auth";
import { SYSTEM_AUDIT_EMAIL } from "@/lib/audit";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export type SearchEvidenceHit = {
  id: string;
  evidenceId: string;
  title: string;
  caseNumber: string;
  status: string;
};

export type SearchUserHit = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type GlobalSearchResult = {
  evidence: SearchEvidenceHit[];
  users: SearchUserHit[];
  canOpenAdmin: boolean;
};

export async function globalSearch(
  query: string
): Promise<GlobalSearchResult> {
  const session = await getSession();
  if (!session?.user) {
    return { evidence: [], users: [], canOpenAdmin: false };
  }

  const q = query.trim();
  const canOpenAdmin = can(session.user.role, "users:view");

  if (q.length < 2) {
    return { evidence: [], users: [], canOpenAdmin };
  }

  const [evidence, users] = await Promise.all([
    can(session.user.role, "evidence:view")
      ? prisma.evidenceItem.findMany({
          where: {
            OR: [
              { evidenceId: { contains: q, mode: "insensitive" } },
              { caseNumber: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 8,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            evidenceId: true,
            title: true,
            caseNumber: true,
            status: true,
          },
        })
      : Promise.resolve([]),
    prisma.user.findMany({
      where: {
        email: { not: SYSTEM_AUDIT_EMAIL },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { badgeNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    }),
  ]);

  return { evidence, users, canOpenAdmin };
}
