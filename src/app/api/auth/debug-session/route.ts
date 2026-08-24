import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return Response.json({ session });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
