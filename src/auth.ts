import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit/audit-service";
import { rateLimit } from "@/lib/security/rate-limit";
import { emailSchema } from "@/lib/validation/auth";
import { clearActiveWorkspace } from "@/lib/workspace-context";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (!authSecret && process.env.NEXT_PHASE !== "phase-production-build") {
  console.error(
    "NEXTAUTH_SECRET or AUTH_SECRET must be set. Authentication will fail.",
  );
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const parsedEmail = emailSchema.safeParse(
          String(credentials.email).trim().toLowerCase(),
        );

        if (!parsedEmail.success) {
          return null;
        }

        const email = parsedEmail.data;
        const password = String(credentials.password);

        const limit = await rateLimit(`login:${email}`, 10, 60, {
          failOpen: false,
        });

        if (!limit.success) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user?.passwordHash) {
            await createAuditLog({
              action: "AUTH_LOGIN_FAILED",
              metadata: { email },
            });
            return null;
          }

          const validPassword = await bcrypt.compare(
            password,
            user.passwordHash,
          );

          if (!validPassword) {
            const membership = await db.membership.findFirst({
              where: { userId: user.id },
              orderBy: { createdAt: "asc" },
            });

            await createAuditLog({
              action: "AUTH_LOGIN_FAILED",
              workspaceId: membership?.workspaceId,
              userId: user.id,
              metadata: { email },
            });
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("AUTH: authorize error", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? token.sub ?? "";
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (!user.id) {
        return;
      }

      const membership = await db.membership.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });

      await createAuditLog({
        workspaceId: membership?.workspaceId,
        userId: user.id,
        action: "AUTH_LOGIN",
        metadata: {
          method: "password",
        },
      });
    },

    async signOut({ token }) {
      const userId =
        (token?.id as string | undefined) ??
        (token?.sub as string | undefined);

      if (!userId) {
        return;
      }

      const membership = await db.membership.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      await createAuditLog({
        workspaceId: membership?.workspaceId,
        userId,
        action: "AUTH_LOGOUT",
      });

      try {
        await clearActiveWorkspace();
      } catch {
        // Cookie deletion is best-effort during sign-out.
      }
    },
  },

  pages: {
    signIn: "/login",
  },
};
