"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

async function recordLoginEvent(token?: string) {
  if (!token) return;

  await fetch("/api/auth/login-event", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => null);
}

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Activating your account...");

  useEffect(() => {
    async function completeAuthCallback() {
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      const next = searchParams.get("next") || "/";
      const code = searchParams.get("code");
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const urlError = searchParams.get("error_description") || hashParams.get("error_description");

      if (urlError) {
        setMessage(urlError);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setMessage(error.message);
          return;
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setMessage(error.message);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setMessage("Activation completed. Please sign in with your email and password.");
        return;
      }

      await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await recordLoginEvent(token);

      router.replace(next);
      router.refresh();
    }

    completeAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-12 text-center">
      <section className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
          Account Activation
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
          Please wait
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#6c5b68]">{message}</p>
      </section>
    </div>
  );
}
