import { cookies } from "next/headers";

export const adminCookieName = "sweet_admin_session";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(adminCookieName)?.value);
}
