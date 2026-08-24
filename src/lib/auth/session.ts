import { requireUser } from "@/lib/authz";

export async function getCurrentUser() {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}
