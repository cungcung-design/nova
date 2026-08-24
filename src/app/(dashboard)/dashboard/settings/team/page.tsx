import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getTeam } from "@/services/team.service";

import { TeamHeader } from "@/components/team/team-header";

import { InviteMember } from "@/components/team/invite-member";

import { TeamMembers } from "@/components/team/team-members";

import { PendingInvitations } from "@/components/team/pending-invitations";

export default async function TeamPage() {
  const workspace = await getCurrentWorkspace();

  const team = await getTeam(workspace.id);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <TeamHeader
        workspace={workspace}
        memberCount={team.members.length}
      />

      <InviteMember />

      <TeamMembers members={team.members} />

      <PendingInvitations invitations={team.invitations} />
    </div>
  );
}
