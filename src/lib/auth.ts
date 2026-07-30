import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { type Role } from "@prisma/client";
import { getSystemAuditActorId, writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name: string;
      email: string;
    };
  }

  interface User {
    id: string;
    role: Role;
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    name: string;
    email: string;
  }
}

async function logLoginFailed(emailAttempted: string, reason: string) {
  try {
    const normalized = emailAttempted.toLowerCase().trim();
    const known = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    const actorId = known?.id ?? (await getSystemAuditActorId());
    // Never log passwords — only the email attempted and failure reason.
    await writeAuditLog({
      actorId,
      action: "LOGIN_FAILED",
      entityType: "Auth",
      entityId: normalized || "unknown",
      metadata: {
        emailAttempted: normalized,
        reason,
      },
    });
  } catch (err) {
    console.error("Failed to write LOGIN_FAILED audit", err);
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          await logLoginFailed(
            credentials?.email ?? "",
            "missing_credentials"
          );
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) {
          await logLoginFailed(email, !user ? "unknown_user" : "inactive_user");
          return null;
        }

        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) {
          await logLoginFailed(email, "invalid_password");
          return null;
        }

        const now = new Date();
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: now },
          });
          await writeAuditLog({
            actorId: user.id,
            action: "LOGIN_SUCCESS",
            entityType: "Auth",
            entityId: user.email,
            metadata: { email: user.email, role: user.role },
          });
        } catch (err) {
          console.error("Failed to stamp lastLoginAt / LOGIN_SUCCESS", err);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        role: token.role,
        name: token.name,
        email: token.email,
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}
