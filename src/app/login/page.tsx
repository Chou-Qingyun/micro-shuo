import type { Metadata } from "next";
import { Suspense } from "react";
import { LockKeyhole } from "lucide-react";
import { UserAuthForm } from "@/components/auth/user-auth-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to save romance novels, bookmarks, and reading progress.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
          Reader Account
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold leading-tight text-[#281f2d]">
          Keep every chapter close.
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#5f515f]">
          Save favorites, continue reading, and join chapter comments when logged in.
        </p>
      </section>
      <section className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-[0_24px_70px_rgba(75,43,58,0.12)]">
        <div className="grid size-11 place-items-center rounded-[8px] bg-[#f8f1ee] text-[#9b405e]">
          <LockKeyhole size={21} aria-hidden="true" />
        </div>
        <h2 className="mt-5 font-serif text-3xl font-semibold text-[#281f2d]">
          Sign in
        </h2>
        <Suspense
          fallback={
            <p className="mt-6 rounded-[8px] bg-[#f8f1ee] px-3 py-2 text-sm text-[#7a6b76]">
              Loading sign in form...
            </p>
          }
        >
          <UserAuthForm />
        </Suspense>
      </section>
    </div>
  );
}
