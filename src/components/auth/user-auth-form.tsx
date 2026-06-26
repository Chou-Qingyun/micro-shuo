"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut, Mail, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "signup";

async function recordLoginEvent(token?: string) {
  if (!token) return;

  await fetch("/api/auth/login-event", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => null);
}

export function UserAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [needsEmailActivation, setNeedsEmailActivation] = useState(false);
  const [resending, setResending] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setCurrentEmail(data.session?.user.email ?? "");
    }

    loadSession();

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      setCurrentEmail(session?.user.email ?? "");
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    setLoading(true);
    setMessage("");
    setNeedsEmailActivation(false);

    const emailRedirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo,
            },
          });

    setLoading(false);

    if (response.error) {
      const errorCode = "code" in response.error ? response.error.code : "";
      const errorMessage = response.error.message.toLowerCase();

      if (
        mode === "login" &&
        (errorCode === "email_not_confirmed" ||
          errorMessage.includes("email not confirmed") ||
          errorMessage.includes("not confirmed"))
      ) {
        setNeedsEmailActivation(true);
        setMessage("Please activate your email before signing in.");
        return;
      }

      setMessage(response.error.message);
      return;
    }

    if (mode === "signup" && response.data.user?.email) {
      await fetch("/api/auth/register-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: response.data.user.id,
          email: response.data.user.email,
        }),
      });

      // 注册后不直接保持登录，统一要求用户先完成邮箱激活再登录。
      await supabase.auth.signOut();
    }

    if (mode === "signup" && !response.data.session) {
      setShowEmailConfirmModal(true);
      return;
    }

    if (mode === "signup") {
      setShowEmailConfirmModal(true);
      return;
    }

    await recordLoginEvent(response.data.session?.access_token);

    setMessage("Signed in.");
    router.push(next);
    router.refresh();
  }

  async function handleResendActivation() {
    if (!supabase || !email) return;

    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo:
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setResending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Activation email resent. Please check your inbox.");
  }

  async function handleLogout() {
    await supabase?.auth.signOut();
    setCurrentEmail("");
    router.refresh();
  }

  if (currentEmail) {
    return (
      <div className="mt-6 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4">
        <p className="text-sm font-semibold text-[#281f2d]">Signed in as</p>
        <p className="mt-1 text-sm text-[#6c5b68]">{currentEmail}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#281f2d] px-4 text-sm font-semibold text-white"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <div className="grid grid-cols-2 rounded-[8px] bg-[#f8f1ee] p-1">
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setMessage("");
              setNeedsEmailActivation(false);
            }}
            className={`h-10 rounded-[8px] text-sm font-semibold transition ${
              mode === item ? "bg-white text-[#9b405e] shadow-sm" : "text-[#6c5b68]"
            }`}
          >
            {item === "login" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
        Email
        <span className="flex items-center gap-2 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3">
          <Mail size={17} className="text-[#9b405e]" aria-hidden="true" />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="reader@example.com"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-normal outline-none placeholder:text-[#a98d95]"
          />
        </span>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
        Password
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
        />
      </label>

      {message ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-[#f8f1ee] px-3 py-2 text-sm font-medium text-[#7a4c5a]">
          <p>{message}</p>
          {needsEmailActivation ? (
            <button
              type="button"
              onClick={handleResendActivation}
              disabled={resending}
              className="h-9 rounded-[8px] bg-white px-3 text-xs font-semibold text-[#9b405e] shadow-sm disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend activation email"}
            </button>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white transition hover:bg-[#81324c] disabled:opacity-60"
      >
        <UserPlus size={17} aria-hidden="true" />
        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
      </button>

      {showEmailConfirmModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#281f2d]/45 px-4">
          <div className="w-full max-w-md rounded-[8px] bg-white p-6 shadow-[0_24px_70px_rgba(75,43,58,0.22)]">
            <h2 className="font-serif text-3xl font-semibold text-[#281f2d]">
              Check your inbox
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6c5b68]">
              We sent an activation link to your registered email address. Please
              open your inbox and click the activation link to complete your
              account registration.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowEmailConfirmModal(false);
                setMode("login");
                setMessage("After activation, please sign in with your email and password.");
              }}
              className="mt-6 h-11 rounded-[8px] bg-[#9b405e] px-5 text-sm font-semibold text-white transition hover:bg-[#81324c]"
            >
              I Understand
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
