import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";
import { acceptInvitation } from "@/services/team.service";
import { apiErrorResponse } from "@/lib/api-error";

type Context = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(_request: Request, { params }: Context) {
  try {
    const user = await requireUser();
    const { token } = await params;

    if (!user.email) {
      return NextResponse.json(
        { error: "Your account needs an email address to accept an invitation." },
        { status: 400 },
      );
    }

    const invitation = await acceptInvitation(token, user.id, user.email);

    return NextResponse.json({
      success: true,
      workspaceId: invitation.workspaceId,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to accept invitation.");
  }
}
