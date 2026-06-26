import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
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

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    displayName?: string;
    avatarUrl?: string;
  } | null;
  const displayName = body?.displayName?.trim();
  const avatarUrl = body?.avatarUrl?.trim();

  if (!displayName) {
    return NextResponse.json({ message: "Nickname is required." }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName,
      avatarUrl: avatarUrl || null,
    },
  });

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      avatarUrl: updatedUser.avatarUrl,
    },
  });
}

