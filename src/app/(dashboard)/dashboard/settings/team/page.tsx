import { Suspense } from "react";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { hasPermission, permissions } from "@/lib/permissions";
import { getTeam } from "@/services/team.service";
import { TeamHeader } from "@/components/team/team-header";
import { InviteMember } from "@/components/team/invite-member";
import { TeamMembers } from "@/components/team/team-members";
import { PendingInvitations } from "@/components/team/pending-invitations";

export default async function TeamPage() {
  const workspace = await getCurrentWorkspace();
  await requireRole(workspace.id, [...permissions.team.view]);

  const team = await getTeam(workspace.id);
  const canInvite = hasPermission(workspace.role, permissions.team.invite);
  const canChangeRole = hasPermission(workspace.role, permissions.team.updateRole);
  const canRemove = hasPermission(workspace.role, permissions.team.remove);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <TeamHeader
        workspace={workspace}
        memberCount={team.members.length}
      />

      {canInvite ? (
        <Suspense
          fallback={
            <div className="h-40 animate-pulse rounded-2xl border bg-muted" />
          }
        >
          <InviteMember />
        </Suspense>
      ) : null}

      <TeamMembers
        members={team.members}
        canChangeRole={canChangeRole}
        canRemove={canRemove}
      />

      <PendingInvitations
        invitations={team.invitations}
        canCancel={canInvite}
      />
    </div>
  );
}
