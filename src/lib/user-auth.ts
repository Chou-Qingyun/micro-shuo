import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

type AuthOptions = {
  allowBlocked?: boolean;
};

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase Auth is not configured.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function getAuthenticatedUser(request: Request, options: AuthOptions = {}) {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.email) {
    return null;
  }

  // Supabase Auth 负责登录态，我们自己的 User 表负责业务数据关联。
  const user = await prisma.user.upsert({
    where: { email: data.user.email },
    update: {
      avatarUrl: data.user.user_metadata?.avatar_url ?? undefined,
    },
    create: {
      id: data.user.id,
      email: data.user.email,
      displayName:
        data.user.user_metadata?.display_name ??
        data.user.user_metadata?.name ??
        data.user.email.split("@")[0],
      avatarUrl: data.user.user_metadata?.avatar_url ?? null,
    },
  });

  if (user.isLoginBlocked && !options.allowBlocked) {
    return null;
  }

  return user;
}
