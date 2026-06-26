"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  author: string;
};

export function CommentBox({
  novelSlug,
  chapterSlug,
}: {
  novelSlug: string;
  chapterSlug?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadComments() {
      const params = new URLSearchParams({ novelSlug });

      if (chapterSlug) {
        params.set("chapterSlug", chapterSlug);
      }

      const response = await fetch(`/api/comments?${params.toString()}`);
      const result = (await response.json()) as { comments: CommentItem[] };

      if (mounted) {
        setComments(result.comments ?? []);
      }
    }

    async function loadSession() {
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };

      if (mounted) {
        setSignedIn(Boolean(data.session));
      }
    }

    loadComments();
    loadSession();

    const subscription = supabase?.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [chapterSlug, novelSlug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const body = String(new FormData(form).get("body") ?? "").trim();

    if (!body) return;

    if (!supabase) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ novelSlug, chapterSlug, body }),
    });

    if (!response.ok) {
      setMessage("Unable to post comment.");
      return;
    }

    form.reset();

    const params = new URLSearchParams({ novelSlug });

    if (chapterSlug) {
      params.set("chapterSlug", chapterSlug);
    }

    const result = await fetch(`/api/comments?${params.toString()}`).then(
      (item) => item.json() as Promise<{ comments: CommentItem[] }>,
    );
    setComments(result.comments ?? []);
  }

  return (
    <section className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[#281f2d]">
        <MessageCircle size={19} aria-hidden="true" />
        <h2 className="text-lg font-semibold">Reader Notes</h2>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <textarea
          name="body"
          rows={4}
          maxLength={500}
          placeholder={signedIn ? "Leave a gentle nudge for the next chapter..." : "Sign in to comment..."}
          className="min-h-28 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-3 text-sm leading-6 text-[#281f2d] outline-none transition placeholder:text-[#a98d95] focus:border-[#c46b84]"
        />
        <button
          type="submit"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-[8px] bg-[#557463] px-4 text-sm font-semibold text-white transition hover:bg-[#465f51]"
        >
          <Send size={16} aria-hidden="true" />
          {signedIn ? "Post" : "Sign in"}
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-[#9b405e]">{message}</p> : null}
      <div className="mt-5 grid gap-3">
        {comments.length === 0 ? (
          <p className="text-sm text-[#7a6b76]">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-[8px] bg-[#f8f1ee] p-3">
              <p className="text-sm leading-6 text-[#3a303c]">{comment.body}</p>
              <p className="mt-2 text-xs text-[#8a6c67]">
                {comment.author} · {comment.createdAt}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
