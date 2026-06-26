"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Bell, BookOpen, Camera, Heart, Save, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;

type AccountTab = "library" | "profile";
type BookshelfFilter = "reading" | "saved" | "subscribed";

type Profile = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type LibraryBook = {
  novelSlug: string;
  title: string;
  coverUrl: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  progress: number;
  updatedAt: string;
};

type SavedBook = {
  novelSlug: string;
  title: string;
  coverUrl: string;
  excerpt: string;
  savedAt: string;
  firstChapterSlug: string | null;
};

type SubscribedBook = {
  novelSlug: string;
  title: string;
  coverUrl: string;
  excerpt: string;
  subscribedAt: string;
  firstChapterSlug: string | null;
};

export function AccountDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AccountTab>("library");
  const [bookshelfFilter, setBookshelfFilter] = useState<BookshelfFilter>("reading");
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [subscribedBooks, setSubscribedBooks] = useState<SubscribedBook[]>([]);
  const [updatingSubscription, setUpdatingSubscription] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  useEffect(() => {
    async function loadAccount() {
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      const sessionToken = data.session?.access_token;

      if (!sessionToken) {
        router.replace(`/login?next=${encodeURIComponent("/account")}`);
        return;
      }

      setToken(sessionToken);

      const [profileResponse, libraryResponse] = await Promise.all([
        fetch("/api/account/profile", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }),
        fetch("/api/account/library", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }),
      ]);

      if (!profileResponse.ok) {
        router.replace(`/login?next=${encodeURIComponent("/account")}`);
        return;
      }

      const profileResult = (await profileResponse.json()) as { user: Profile };
      const libraryResult = (await libraryResponse.json()) as {
        books: LibraryBook[];
        savedBooks: SavedBook[];
        subscribedBooks: SubscribedBook[];
      };

      setProfile(profileResult.user);
      setDisplayName(profileResult.user.displayName ?? "");
      setAvatarUrl(profileResult.user.avatarUrl ?? "");
      setLibrary(libraryResult.books ?? []);
      setSavedBooks(libraryResult.savedBooks ?? []);
      setSubscribedBooks(libraryResult.subscribedBooks ?? []);
    }

    loadAccount();
  }, [router]);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !supabase || !profile) return;

    if (file.size > MAX_AVATAR_SIZE) {
      event.target.value = "";
      setMessage("Avatar image must be 3MB or smaller.");
      return;
    }

    setUploading(true);
    setMessage("");

    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${profile.id}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      setUploading(false);
      setMessage(error.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    setMessage("Avatar uploaded. Click Save to apply it.");
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
        avatarUrl,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(result?.message ?? "Unable to save profile.");
      return;
    }

    const result = (await response.json()) as { user: Profile };
    setProfile(result.user);
    setMessage("Profile saved.");
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) return;

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setResetMessage(error.message);
      return;
    }

    setResetMessage("Password updated.");
    setNewPassword("");
  }

  async function handleUnsubscribeBook(novelSlug: string) {
    if (!token) return;

    setUpdatingSubscription(novelSlug);
    const response = await fetch("/api/subscribe", {
      method: "DELETE",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: `novel:${novelSlug}` }),
    });
    setUpdatingSubscription("");

    if (!response.ok) {
      return;
    }

    setSubscribedBooks((books) => books.filter((book) => book.novelSlug !== novelSlug));
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-sm text-[#6c5b68]">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
              My Account
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-[#281f2d]">
              {profile.displayName || "Reader"}
            </h1>
          </div>
          <div className="grid size-16 place-items-center overflow-hidden rounded-[8px] bg-[#9b405e] text-white">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User avatar" className="size-full object-cover" />
            ) : (
              <UserRound size={28} aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 rounded-[8px] bg-[#f8f1ee] p-1">
        <button
          type="button"
          onClick={() => setTab("library")}
          className={`h-11 rounded-[8px] text-sm font-semibold ${
            tab === "library" ? "bg-white text-[#9b405e] shadow-sm" : "text-[#6c5b68]"
          }`}
        >
          Bookshelf
        </button>
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`h-11 rounded-[8px] text-sm font-semibold ${
            tab === "profile" ? "bg-white text-[#9b405e] shadow-sm" : "text-[#6c5b68]"
          }`}
        >
          Profile
        </button>
      </div>

      {tab === "library" ? (
        <section className="mt-6 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#281f2d]">Bookshelf</h2>
            <div className="grid grid-cols-3 rounded-[8px] bg-[#f8f1ee] p-1">
              <button
                type="button"
                onClick={() => setBookshelfFilter("reading")}
                className={`h-9 rounded-[8px] px-3 text-xs font-semibold ${
                  bookshelfFilter === "reading" ? "bg-white text-[#9b405e] shadow-sm" : "text-[#6c5b68]"
                }`}
              >
                Reading
              </button>
              <button
                type="button"
                onClick={() => setBookshelfFilter("saved")}
                className={`h-9 rounded-[8px] px-3 text-xs font-semibold ${
                  bookshelfFilter === "saved" ? "bg-white text-[#9b405e] shadow-sm" : "text-[#6c5b68]"
                }`}
              >
                Saved
              </button>
              <button
                type="button"
                onClick={() => setBookshelfFilter("subscribed")}
                className={`h-9 rounded-[8px] px-3 text-xs font-semibold ${
                  bookshelfFilter === "subscribed" ? "bg-white text-[#9b405e] shadow-sm" : "text-[#6c5b68]"
                }`}
              >
                Subscribed
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            {bookshelfFilter === "reading" && library.length === 0 ? (
              <p className="text-sm text-[#7a6b76]">No reading history yet.</p>
            ) : null}

            {bookshelfFilter === "reading"
              ? library.map((book) => (
                  <article
                    key={book.novelSlug}
                    className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4 sm:grid-cols-[88px_1fr_auto]"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-[8px] bg-white">
                      <img src={book.coverUrl} alt={`${book.title} cover`} className="size-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#281f2d]">{book.title}</h3>
                      <p className="mt-2 text-sm text-[#6c5b68]">
                        Reading progress: Chapter {book.chapterNumber} · {book.chapterTitle}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#9b405e]"
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#9b405e]">{book.progress}%</span>
                      </div>
                      <p className="mt-1 text-xs text-[#8a6c67]">Last read: {book.updatedAt}</p>
                    </div>
                    <Link
                      href={`/novels/${book.novelSlug}/chapter/${book.chapterSlug}`}
                      className="inline-flex h-10 items-center justify-center gap-2 self-center rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
                    >
                      <BookOpen size={16} aria-hidden="true" />
                      Continue Reading
                    </Link>
                  </article>
                ))
              : null}

            {bookshelfFilter === "saved" && savedBooks.length === 0 ? (
              <p className="text-sm text-[#7a6b76]">No saved books yet.</p>
            ) : null}

            {bookshelfFilter === "saved"
              ? savedBooks.map((book) => (
                  <article
                    key={book.novelSlug}
                    className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4 sm:grid-cols-[88px_1fr_auto]"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-[8px] bg-white">
                      <img src={book.coverUrl} alt={`${book.title} cover`} className="size-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#281f2d]">{book.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c5b68]">{book.excerpt}</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#9b405e]">
                        <Heart size={14} fill="currentColor" aria-hidden="true" />
                        Saved on {book.savedAt}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-center sm:justify-end">
                      {book.firstChapterSlug ? (
                        <Link
                          href={`/novels/${book.novelSlug}/chapter/${book.firstChapterSlug}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
                        >
                          <BookOpen size={16} aria-hidden="true" />
                          Read
                        </Link>
                      ) : null}
                      <Link
                        href={`/novels/${book.novelSlug}`}
                        className="inline-flex h-10 items-center justify-center rounded-[8px] bg-white px-4 text-sm font-semibold text-[#9b405e] shadow-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </article>
                ))
              : null}

            {bookshelfFilter === "subscribed" && subscribedBooks.length === 0 ? (
              <p className="text-sm text-[#7a6b76]">No subscribed books yet.</p>
            ) : null}

            {bookshelfFilter === "subscribed"
              ? subscribedBooks.map((book) => (
                  <article
                    key={book.novelSlug}
                    className="grid gap-4 rounded-[8px] border border-rose-100 bg-[#fffaf8] p-4 sm:grid-cols-[88px_1fr_auto]"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-[8px] bg-white">
                      <img src={book.coverUrl} alt={`${book.title} cover`} className="size-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#281f2d]">{book.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c5b68]">{book.excerpt}</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#9b405e]">
                        <Bell size={14} fill="currentColor" aria-hidden="true" />
                        Subscribed on {book.subscribedAt}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-center sm:justify-end">
                      {book.firstChapterSlug ? (
                        <Link
                          href={`/novels/${book.novelSlug}/chapter/${book.firstChapterSlug}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white"
                        >
                          <BookOpen size={16} aria-hidden="true" />
                          Read
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleUnsubscribeBook(book.novelSlug)}
                        disabled={updatingSubscription === book.novelSlug}
                        className="inline-flex h-10 items-center justify-center rounded-[8px] bg-white px-4 text-sm font-semibold text-[#9b405e] shadow-sm disabled:opacity-60"
                      >
                        {updatingSubscription === book.novelSlug ? "Updating..." : "Unsubscribe"}
                      </button>
                    </div>
                  </article>
                ))
              : null}
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#281f2d]">Profile</h2>
          <form onSubmit={handleSaveProfile} className="mt-5 grid gap-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid size-20 place-items-center overflow-hidden rounded-[8px] bg-[#9b405e] text-white">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="User avatar" className="size-full object-cover" />
                ) : (
                  <UserRound size={32} aria-hidden="true" />
                )}
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] bg-[#f8f1ee] px-4 text-sm font-semibold text-[#7a4c5a]">
                <Camera size={16} aria-hidden="true" />
                {uploading ? "Uploading..." : "Upload Avatar"}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
              Nickname
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
              Registered Email
              <input
                value={profile.email}
                readOnly
                className="h-11 rounded-[8px] border border-rose-100 bg-[#f8f1ee] px-3 font-normal text-[#7a6b76] outline-none"
              />
            </label>

            <div className="grid gap-2 text-sm font-semibold text-[#3a303c]">
              Password
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 py-2">
                <span className="inline-flex items-center gap-2 text-sm font-normal text-[#6c5b68]">
                  <ShieldCheck size={16} aria-hidden="true" />
                  Set
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetMessage("");
                  }}
                  className="h-9 rounded-[8px] bg-white px-3 text-xs font-semibold text-[#9b405e] shadow-sm"
                >
                  Reset Password
                </button>
              </div>
            </div>

            {message ? <p className="text-sm text-[#557463]">{message}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-[8px] bg-[#9b405e] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save size={16} aria-hidden="true" />
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </section>
      )}

      {showResetModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#281f2d]/45 px-4">
          <form
            onSubmit={handleResetPassword}
            className="w-full max-w-md rounded-[8px] bg-white p-6 shadow-[0_24px_70px_rgba(75,43,58,0.22)]"
          >
            <h2 className="font-serif text-3xl font-semibold text-[#281f2d]">Reset Password</h2>
            <p className="mt-2 text-sm leading-6 text-[#6c5b68]">Enter your new login password.</p>
            <input
              type="password"
              minLength={6}
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-5 h-11 w-full rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 outline-none focus:border-[#c46b84]"
            />
            {resetMessage ? <p className="mt-3 text-sm text-[#557463]">{resetMessage}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" className="h-10 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white">
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="h-10 rounded-[8px] bg-[#f8f1ee] px-4 text-sm font-semibold text-[#7a4c5a]"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
