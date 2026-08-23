import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuthorMedia } from "@/lib/services/media";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await getAuthorMedia(user.id);
    return NextResponse.json({ media });
  } catch (error) {
    console.error("GET /api/author/media failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
