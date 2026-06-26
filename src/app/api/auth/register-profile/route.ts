import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function createDefaultDisplayName() {
  const seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `Reader ${seed}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    email?: string;
    displayName?: string;
  } | null;
  const id = body?.id?.trim();
  const email = body?.email?.trim().toLowerCase();

  if (!id || !email || !email.includes("@")) {
    return NextResponse.json({ message: "Invalid user profile." }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      displayName: body?.displayName?.trim() || undefined,
    },
    create: {
      id,
      email,
      displayName: body?.displayName?.trim() || createDefaultDisplayName(),
    },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
  });
}
