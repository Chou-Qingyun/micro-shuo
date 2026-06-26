"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function ReadingProgressTracker({
  novelSlug,
  chapterSlug,
}: {
  novelSlug: string;
  chapterSlug: string;
}) {
  useEffect(() => {
    async function saveProgress() {
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      const token = data.session?.access_token;

      if (!token) return;

      await fetch("/api/reading-progress", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          novelSlug,
          chapterSlug,
          progress: 0,
        }),
      });
    }

    saveProgress();
  }, [chapterSlug, novelSlug]);

  return null;
}

