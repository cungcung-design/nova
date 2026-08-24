type Props = {
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
};

export function PendingInvitations({ invitations }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-6 py-5">
        <h2 className="font-semibold">
          Pending Invitations
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Invitations that have not been accepted yet.
        </p>
      </div>

      {invitations.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No pending invitations.
        </div>
      ) : (
        <div className="divide-y">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {invitation.email}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Sent{" "}
                  {invitation.createdAt.toISOString().split("T")[0]}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border px-3 py-1 text-xs">
                  {invitation.role}
                </span>

                <span className="text-xs text-muted-foreground">
                  Expires{" "}
                  {invitation.expiresAt.toISOString().split("T")[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
