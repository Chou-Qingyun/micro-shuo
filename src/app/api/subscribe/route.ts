import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";

function isValidEmail(email: string) {
  return email.includes("@");
}

type SubscribeBody = {
  email?: string;
  source?: string;
};

async function getRequestContext(request: Request, body?: SubscribeBody | null) {
  const user = await getAuthenticatedUser(request);
  const { searchParams } = new URL(request.url);

  if (user?.email) {
    return {
      email: user.email,
      source: body?.source?.trim() || searchParams.get("source")?.trim() || "site",
    };
  }

  const queryEmail = searchParams.get("email")?.trim().toLowerCase();
  const email = queryEmail || body?.email?.trim().toLowerCase() || "";
  const source = body?.source?.trim() || searchParams.get("source")?.trim() || "site";

  return { email, source };
}

export async function GET(request: Request) {
  const { email, source } = await getRequestContext(request);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ subscribed: false }, { status: 400 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { email, source },
  });

  return NextResponse.json({
    subscribed: Boolean(subscription),
    email,
    source,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SubscribeBody | null;
  const { email, source } = await getRequestContext(request, body);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  const subscription = await prisma.subscription.upsert({
    where: {
      email_source: {
        email,
        source,
      },
    },
    update: {},
    create: {
      email,
      source,
    },
  });

  return NextResponse.json({
    ok: true,
    email: subscription.email,
    source: subscription.source,
  });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as SubscribeBody | null;
  const { email, source } = await getRequestContext(request, body);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  await prisma.subscription.deleteMany({
    where: { email, source },
  });

  return NextResponse.json({
    ok: true,
    subscribed: false,
    email,
    source,
  });
}
