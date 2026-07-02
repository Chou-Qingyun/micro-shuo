"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export function UserMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      const token = data.session?.access_token;

      if (!token) {
        if (mounted) setProfile(null);
        return;
      }

      const response = await fetch("/api/account/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!mounted) return;

      if (!response.ok) {
        await supabase?.auth.signOut();
        setProfile(null);
        return;
      }

      const result = (await response.json()) as { user: UserProfile };
      setProfile(result.user);
    }

    loadProfile();

    const subscription = supabase?.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase?.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  if (!profile) {
    if (pathname.startsWith("/admin")) {
      return (
        <Link
          href="/admin"
          className="inline-flex h-10 items-center rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#81324c]"
        >
          Admin
        </Link>
      );
    }

    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="inline-flex h-10 items-center rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#81324c]"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href="/account"
        aria-label="Account"
        className="grid size-10 place-items-center overflow-hidden rounded-[8px] bg-[#9b405e] text-white shadow-sm transition hover:bg-[#81324c]"
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName ?? "User avatar"}
            className="size-full object-cover"
          />
        ) : (
          <UserRound size={18} aria-hidden="true" />
        )}
      </Link>

      <div className="invisible absolute right-0 top-full z-40 w-44 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
        <div className="rounded-[8px] border border-rose-100 bg-white p-2 shadow-[0_18px_50px_rgba(75,43,58,0.16)]">
          <Link
            href="/account"
            className="block rounded-[8px] px-3 py-2 text-sm font-semibold text-[#281f2d] hover:bg-[#f8f1ee]"
          >
            {profile.displayName || "My Account"}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 inline-flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#9b405e] hover:bg-[#f8f1ee]"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
