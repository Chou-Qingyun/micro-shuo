import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Privacy Policy for Sweet Chinese Romance, including how account data, comments, subscriptions, analytics, and advertising data may be handled.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "How Sweet Chinese Romance handles reader account data, comments, subscriptions, analytics, and advertising data.",
    type: "website",
  },
};

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "When you use Sweet Chinese Romance, we may collect information you provide directly, such as your email address, password credentials handled through our authentication provider, display name, avatar, comments, bookmarks, reading progress, and subscription preferences.",
      "We may also collect basic technical information automatically, such as browser type, device information, IP address, pages visited, referring pages, approximate location inferred from technical data, and interaction logs needed to keep the website secure and functional.",
    ],
  },
  {
    title: "2. How We Use Information",
    content: [
      "We use information to provide reader accounts, save bookmarks, track reading progress, display comments, send chapter update notifications, improve site performance, prevent abuse, and maintain the security of the service.",
      "We may use aggregated or de-identified information to understand which novels, categories, and chapters are most useful to readers.",
    ],
  },
  {
    title: "3. Account Registration and Email Verification",
    content: [
      "If you create an account, you may be asked to verify your email address before you can sign in. This helps protect accounts and reduces spam or automated abuse.",
      "You are responsible for keeping your login information secure and for using an email address that you control.",
    ],
  },
  {
    title: "4. Comments and Reader Notes",
    content: [
      "Comments, reader notes, and similar interactive features may be visible to other users. Please avoid posting private personal information in public areas of the website.",
      "We may remove comments that are spam, abusive, illegal, infringing, or otherwise harmful to the reading community.",
    ],
  },
  {
    title: "5. Subscriptions and Update Alerts",
    content: [
      "If you subscribe to site updates or novel update alerts, we use your email address to manage that subscription and send relevant notifications.",
      "You may unsubscribe from available update alerts through the website interface where this feature is provided.",
    ],
  },
  {
    title: "6. Cookies, Analytics, and Advertising",
    content: [
      "We may use cookies or similar technologies to keep you signed in, remember preferences, secure the service, measure performance, and understand website usage.",
      "If advertising is enabled, third-party advertising partners such as Google AdSense may use cookies or similar technologies to serve, measure, and improve ads. Their data practices are governed by their own policies.",
    ],
  },
  {
    title: "7. Third-Party Services",
    content: [
      "The website may rely on third-party services for hosting, database storage, authentication, email delivery, analytics, advertising, and media storage. These providers may process information only as needed to provide their services to us.",
      "Examples may include hosting and database providers such as Vercel and Supabase, and advertising services such as Google AdSense if enabled.",
    ],
  },
  {
    title: "8. Data Retention",
    content: [
      "We keep information for as long as needed to provide the website, comply with legal obligations, resolve disputes, prevent abuse, and maintain business records.",
      "If you delete or change content in your account, some copies may remain for a limited time in backups, logs, or records required for security and operational purposes.",
    ],
  },
  {
    title: "9. Your Choices",
    content: [
      "You may update certain account information in your profile, manage bookmarks and subscriptions where available, and choose whether to post comments.",
      "Depending on your location, you may have rights to request access, correction, deletion, restriction, or portability of certain personal information.",
    ],
  },
  {
    title: "10. Children's Privacy",
    content: [
      "Sweet Chinese Romance is intended for a general audience and is not directed to children under 13. We do not knowingly collect personal information from children under 13.",
      "If you believe a child has provided personal information, please contact the site operator so the information can be reviewed and removed where appropriate.",
    ],
  },
  {
    title: "11. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date.",
      "Your continued use of the website after changes are posted means you accept the updated policy.",
    ],
  },
  {
    title: "12. Contact",
    content: [
      "For privacy questions, account requests, or policy concerns, please contact the site operator through the contact method provided on the website or through the domain owner contact channel.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#281f2d] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[#7a6b76]">Effective date: June 26, 2026</p>
        <p className="mt-6 text-base leading-8 text-[#5f515f]">
          This Privacy Policy explains how {siteConfig.name} collects, uses, stores, and protects
          information when you browse, read, create an account, comment, bookmark novels, subscribe
          to updates, or otherwise use the website.
        </p>

        <div className="mt-8 grid gap-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl font-semibold text-[#281f2d]">{section.title}</h2>
              <div className="mt-3 grid gap-3 text-sm leading-7 text-[#5f515f]">
                {section.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 border-t border-rose-50 pt-5 text-sm text-[#7a6b76]">
          Please also review our{" "}
          <Link href="/terms-of-use" className="font-semibold text-[#9b405e]">
            Terms of Use
          </Link>
          .
        </div>
      </article>
    </div>
  );
}
