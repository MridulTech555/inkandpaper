import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuthorMedia } from "@/lib/services/media";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const media = await getAuthorMedia(user.id);
  return NextResponse.json({ media });
}
