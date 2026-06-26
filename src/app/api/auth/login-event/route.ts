import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";
import { getAuthenticatedUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent")?.slice(0, 512) || null;
  const loggedAt = new Date();

  // 既更新用户最近登录信息，也保留一条登录历史，方便后续后台审计或风控。
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginIp: ipAddress,
        lastLoginAt: loggedAt,
      },
    }),
    prisma.userLoginEvent.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        createdAt: loggedAt,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    lastLoginIp: ipAddress,
    lastLoginAt: loggedAt.toISOString(),
  });
}
