import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/admin/login/actions";

type PageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to manage Sweet Chinese Romance content.",
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error, next = "/admin" } = await searchParams;

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-12">
      <section className="w-full rounded-[8px] border border-rose-100 bg-white p-6 shadow-[0_24px_70px_rgba(75,43,58,0.12)]">
        <div className="grid size-11 place-items-center rounded-[8px] bg-[#f8f1ee] text-[#9b405e]">
          <LockKeyhole size={21} aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-serif text-4xl font-semibold text-[#281f2d]">
          Admin Login
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6c5b68]">
          Enter your username and password to manage novels and chapters.
        </p>

        {error === "invalid" ? (
          <p className="mt-4 rounded-[8px] bg-[#f8e8e6] px-3 py-2 text-sm font-medium text-[#9b405e]">
            Invalid username or password. Please try again.
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 grid gap-4">
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
            Username
            <input
              name="username"
              required
              autoComplete="username"
              className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#3a303c]">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-11 rounded-[8px] border border-rose-100 bg-[#fffaf8] px-3 font-normal outline-none focus:border-[#c46b84]"
            />
          </label>
          <button
            type="submit"
            className="h-11 rounded-[8px] bg-[#9b405e] px-4 text-sm font-semibold text-white transition hover:bg-[#81324c]"
          >
            Sign In
          </button>
        </form>
      </section>
    </div>
  );
}
