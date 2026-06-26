import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";

export const metadata: Metadata = {
  title: "Account Activation",
  description: "Complete account activation and sign in.",
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-12 text-center">
          <p className="text-sm text-[#6c5b68]">Activating your account...</p>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}

