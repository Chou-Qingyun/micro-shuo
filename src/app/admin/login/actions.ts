"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName } from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const failUrl = `/admin/login?error=invalid&next=${encodeURIComponent(next)}`;

  if (!username || !password) {
    redirect(failUrl);
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (
    !adminUser ||
    !adminUser.isActive ||
    !verifyPassword(password, adminUser.passwordHash)
  ) {
    redirect(failUrl);
  }

  await prisma.adminUser.update({
    where: { id: adminUser.id },
    data: { lastLoginAt: new Date() },
  });

  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, adminUser.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}
