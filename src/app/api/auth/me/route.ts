import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request, { allowBlocked: true });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  if (user.isLoginBlocked) {
    return NextResponse.json({ message: "Your account is blocked." }, { status: 403 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  });
}
