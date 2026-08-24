import { createHash, randomBytes } from "node:crypto";

import { db } from "@/lib/db";

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function createResetToken() {
  return randomBytes(32).toString("hex");
}

export async function issuePasswordReset(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user?.passwordHash) {
    return null;
  }

  await db.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const rawToken = createResetToken();
  const expires = new Date(Date.now() + RESET_TTL_MS);

  await db.verificationToken.create({
    data: {
      identifier: email,
      token: hashToken(rawToken),
      expires,
    },
  });

  return { email: user.email, rawToken, expires };
}

export async function resetPasswordWithToken(rawToken: string, passwordHash: string) {
  const hashed = hashToken(rawToken);
  const record = await db.verificationToken.findUnique({
    where: { token: hashed },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await db.verificationToken.deleteMany({
        where: { identifier: record.identifier },
      });
    }
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: record.identifier },
    select: { id: true, email: true },
  });

  if (!user) {
    await db.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    });
    return null;
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    db.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    }),
  ]);

  return user;
}
