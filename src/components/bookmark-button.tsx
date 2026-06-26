"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function BookmarkButton({ novelSlug }: { novelSlug: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadBookmark() {
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      const token = data.session?.access_token;

      if (!mounted) return;

      setSignedIn(Boolean(token));

      if (!token) return;

      const response = await fetch(`/api/bookmarks?novelSlug=${novelSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!mounted || !response.ok) return;

      const result = (await response.json()) as { saved: boolean };
      setSaved(result.saved);
    }

    loadBookmark();

    const subscription = supabase?.auth.onAuthStateChange(() => {
      loadBookmark();
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [novelSlug]);

  async function toggleBookmark() {
    if (!supabase) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);

    const response = await fetch(saved ? `/api/bookmarks?novelSlug=${novelSlug}` : "/api/bookmarks", {
      method: saved ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(saved ? {} : { "Content-Type": "application/json" }),
      },
      body: saved ? undefined : JSON.stringify({ novelSlug }),
    });

    setLoading(false);

    if (response.ok) {
      setSaved(!saved);
      setSignedIn(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={loading}
      className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#81324c] disabled:opacity-60"
    >
      <Heart size={17} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      {loading ? "Saving..." : saved ? "Saved" : signedIn ? "Save" : "Sign in to save"}
    </button>
  );
}
