import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AcceptInviteButton } from "./accept-invite-button";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Join workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          You were invited to join a NOVA workspace. Accept to continue.
        </p>
        <AcceptInviteButton token={token} />
      </div>
    </main>
  );
}
