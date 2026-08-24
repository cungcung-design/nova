import { MemberActions } from "@/components/team/member-actions";

type Props = {
  members: Array<{
    id: string;
    role: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>;
  canChangeRole: boolean;
  canRemove: boolean;
};

export function TeamMembers({ members, canChangeRole, canRemove }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-6 py-5">
        <h2 className="font-semibold">
          Team Members
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          People who currently have access to this workspace.
        </p>
      </div>

      <div className="divide-y">
        {members.map((member) => {
          const initials =
            (member.user.name ?? "")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

          return (
            <div
              key={member.id}
              className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {initials}
                </div>

                <div>
                  <p className="font-medium">
                    {member.user.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {member.role}
                </span>

                <span className="text-xs text-muted-foreground">
                  Joined{" "}
                  {member.createdAt.toISOString().split("T")[0]}
                </span>

                <MemberActions
                  memberId={member.id}
                  currentRole={member.role}
                  canChangeRole={canChangeRole}
                  canRemove={canRemove}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
