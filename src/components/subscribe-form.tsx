"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MailPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

function isValidEmail(value: string) {
  return value.includes("@");
}

export function SubscribeForm({ source = "site" }: { source?: string }) {
  const [message, setMessage] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [checkedEmail, setCheckedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveEmail = sessionEmail || email.trim();
  const normalizedEffectiveEmail = effectiveEmail.trim().toLowerCase();
  const isCurrentlySubscribed =
    isValidEmail(normalizedEffectiveEmail) && checkedEmail === normalizedEffectiveEmail && subscribed;

  const checkSubscription = useCallback(async (nextEmail: string, token = "") => {
    const normalizedEmail = nextEmail.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return;
    }

    const params = new URLSearchParams({ email: normalizedEmail, source });
    const response = await fetch(`/api/subscribe?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      setCheckedEmail(normalizedEmail);
      setSubscribed(false);
      return;
    }

    const result = (await response.json()) as { subscribed: boolean };
    setCheckedEmail(normalizedEmail);
    setSubscribed(result.subscribed);
  }, [source]);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };

      if (!mounted) return;

      setSessionEmail(data.session?.user.email ?? "");
      setSessionToken(data.session?.access_token ?? "");
    }

    loadSession();

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? "");
      setSessionToken(session?.access_token ?? "");
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionEmail) return;

    const timeout = window.setTimeout(() => {
      checkSubscription(sessionEmail, sessionToken);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [checkSubscription, sessionEmail, sessionToken]);

  useEffect(() => {
    if (sessionEmail) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      checkSubscription(normalizedEmail, "");
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [checkSubscription, email, sessionEmail]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedEmail = normalizedEffectiveEmail;

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/subscribe", {
      method: isCurrentlySubscribed ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify({ email: submittedEmail, source }),
    });

    setLoading(false);

    if (!response.ok) {
      setMessage("Please check your email.");
      return;
    }

    setCheckedEmail(submittedEmail);
    setSubscribed(!isCurrentlySubscribed);
    setMessage(isCurrentlySubscribed ? "Unsubscribed." : "Subscribed.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
      {sessionEmail ? (
        <p className="flex min-h-11 items-center rounded-[8px] bg-white px-3 text-sm text-[#6c5b68]">
          Updates will be sent to {sessionEmail}.
        </p>
      ) : (
        <input
          type="email"
          name="email"
          required
          value={email}
          placeholder="Email for chapter updates"
          onChange={(event) => {
            setEmail(event.target.value);
            setMessage("");
          }}
          onInvalid={(event) => {
            const input = event.currentTarget;

            if (input.validity.valueMissing) {
              input.setCustomValidity("Please enter your email address.");
              return;
            }

            if (input.validity.typeMismatch) {
              input.setCustomValidity("Please enter a valid email address.");
            }
          }}
          onInput={(event) => {
            // 用户重新输入时清除上一次的自定义校验文案，避免浏览器一直显示旧提示。
            event.currentTarget.setCustomValidity("");
          }}
          className="h-11 rounded-[8px] border border-rose-100 bg-white px-3 text-sm text-[#281f2d] outline-none transition placeholder:text-[#a98d95] focus:border-[#c46b84]"
        />
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#281f2d] px-4 text-sm font-semibold text-white transition hover:bg-[#3b2e42]"
      >
        <MailPlus size={17} aria-hidden="true" />
        {loading ? "Please wait..." : isCurrentlySubscribed ? "Unsubscribe" : "Subscribe"}
      </button>
      {message ? <p className="text-sm text-[#557463] sm:col-span-2">{message}</p> : null}
    </form>
  );
}
